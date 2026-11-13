import {advanceCozy,newCozyGame,resumeCozySave,validCozySave} from '../../core/cozy-engine';
import type {CozyState} from '../../core/cozy-engine';

/** Keep the existing V1 save key and serialized room/economy fields. */
export const COZY_SAVE_KEY='monster-apartment:cozy:v1';
export const COZY_SAVE_LOCK='monster-apartment:cozy-save-v1';
export const COZY_TICK_INTERVAL_MS=2000;

type CozyStorage=Pick<Storage,'getItem'|'setItem'>;
export type CozyReducer=(current:CozyState)=>CozyState;
export type CozySaveResult=
  |{status:'applied'|'unchanged';state:CozyState;previous:CozyState}
  |{status:'corrupt';raw:string}
  |{status:'stale'|'unavailable'|'error'};

/** Treat malformed or incompatible saves as occupied, never as new games. */
export function parseCozySnapshot(raw:string|null):CozyState|null{
  if(raw===null)return null;
  try{
    const value:unknown=JSON.parse(raw);
    return validCozySave(value)?resumeCozySave(value):null;
  }catch{return null;}
}

/** Every writer (including the reset path) must use this cross-tab lock.
 * A localStorage compare-and-set alone is not atomic between browser tabs. */
async function withCozySaveLock(
  locks:LockManager|null|undefined,action:()=>CozySaveResult
):Promise<CozySaveResult>{
  if(!locks)return {status:'unavailable'};
  try{
    return await locks.request(COZY_SAVE_LOCK,{mode:'exclusive'},action);
  }catch{return {status:'error'};}
}

/** Read latest under lock, apply an existing pure game reducer, then write once.
 * Missing saves are created under lock; corrupt ones are never repaired silently. */
export function transactCozySave(
  store:CozyStorage,locks:LockManager|null|undefined,reducer:CozyReducer
):Promise<CozySaveResult>{
  return withCozySaveLock(locks,()=>{
    try{
      const raw=store.getItem(COZY_SAVE_KEY);
      const previous=raw===null?newCozyGame():parseCozySnapshot(raw);
      if(!previous)return {status:'corrupt',raw:raw!};
      const next=reducer(previous);
      if(!validCozySave(next))return {status:'error'};
      const serialized=JSON.stringify(next);
      if(serialized===raw)return {status:'unchanged',state:next,previous};
      store.setItem(COZY_SAVE_KEY,serialized);
      return {status:'applied',state:next,previous};
    }catch{return {status:'error'};}
  });
}

/** Store the last active tick timestamp inside the SAME JSON write as tick.
 * Multiple visible tabs can fire timers, but they cannot advance the same
 * shared 2-second interval twice. Legacy V1 saves simply lack this metadata. */
export function tickCozySave(
  store:CozyStorage,locks:LockManager|null|undefined,now=Date.now()
):Promise<CozySaveResult>{
  return transactCozySave(store,locks,current=>{
    const last=(current as CozyState&{lastActiveTickAt?:unknown}).lastActiveTickAt;
    if(typeof last==='number'&&Number.isSafeInteger(last)&&now>=last&&
       now-last<COZY_TICK_INTERVAL_MS)return current;
    const next=advanceCozy(current);
    return next===current?current:{...next,lastActiveTickAt:now};
  });
}

/** Reset an explicitly confirmed damaged save only if its original payload
 * is STILL present under the same lock used by ordinary gameplay writes. */
export function resetCorruptCozySave(
  store:CozyStorage,locks:LockManager|null|undefined,expectedRaw:string
):Promise<CozySaveResult>{
  return withCozySaveLock(locks,()=>{
    try{
      const raw=store.getItem(COZY_SAVE_KEY);
      if(raw!==expectedRaw||parseCozySnapshot(raw)!==null)return {status:'stale'};
      const state=newCozyGame();
      store.setItem(COZY_SAVE_KEY,JSON.stringify(state));
      return {status:'applied',state,previous:state};
    }catch{return {status:'error'};}
  });
}
