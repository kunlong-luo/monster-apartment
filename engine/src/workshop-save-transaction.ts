import {validWorkshop} from './workshop-engine';
import type {WorkshopState} from './workshop-engine';

/** Preserve existing V2 save and lock names for all open tabs. */
export const WORKSHOP_SAVE_KEY='monster-apartment:workshop-v2-lab';
export const WORKSHOP_CHANGE_EVENT='moonwork:v2-update';
export const WORKSHOP_SAVE_LOCK='monster-apartment:realtime-workshop-v1';

export type WorkshopStorage=Pick<Storage,'getItem'|'setItem'>;
export type WorkshopWriteStatus=
  'applied'|'unchanged'|'missing'|'unavailable'|'conflict'|'busy'|'error';

export function parseWorkshopSnapshot(raw:string|null):WorkshopState|null{
  if(!raw)return null;
  try{
    const value:unknown=JSON.parse(raw);
    return validWorkshop(value)?value:null;
  }catch{return null;}
}

/** Call while holding WORKSHOP_SAVE_LOCK, never with a stale snapshot. */
export function writeWorkshopSnapshot(
  storage:WorkshopStorage,expectedRaw:string|null,next:WorkshopState
):'applied'|'missing'|'conflict'|'error'{
  if(expectedRaw===null)return 'missing';
  if(!validWorkshop(next))return 'error';
  try{
    if(storage.getItem(WORKSHOP_SAVE_KEY)!==expectedRaw)return 'conflict';
    storage.setItem(WORKSHOP_SAVE_KEY,JSON.stringify(next));
    return 'applied';
  }catch{return 'error';}
}

type LockedResult<T>=
  |{status:'ok';value:T}
  |{status:'busy'|'unavailable'|'error'};

/** Web Locks is the shared cross-tab exclusion primitive.
 * Fail closed if missing: localStorage compare-and-set isn't atomic. */
export async function withWorkshopSaveLock<T>(
  locks:LockManager|null|undefined,action:()=>T,
  options:{ifAvailable?:boolean}={}
):Promise<LockedResult<T>>{
  if(!locks)return {status:'unavailable'};
  try{
    return await locks.request(
      WORKSHOP_SAVE_LOCK,
      {ifAvailable:Boolean(options.ifAvailable)},
      lock=>lock
        ?({status:'ok',value:action()} as const)
        :({status:'busy'} as const)
    );
  }catch{return {status:'error'};}
}

/** Read latest, reduce, validate and write once while holding the lock. */
export async function transactWorkshopSave(
  storage:WorkshopStorage,locks:LockManager|null|undefined,
  reducer:(current:WorkshopState)=>WorkshopState,
  onApplied?:()=>void,options:{ifAvailable?:boolean}={}
):Promise<WorkshopWriteStatus>{
  const result=await withWorkshopSaveLock(locks,()=>{
    let raw:string|null;
    try{raw=storage.getItem(WORKSHOP_SAVE_KEY);}
    catch{return 'error' as const;}
    const current=parseWorkshopSnapshot(raw);
    if(!current)return 'missing' as const;
    const next=reducer(current);
    if(next===current)return 'unchanged' as const;
    const status=writeWorkshopSnapshot(storage,raw,next);
    if(status==='applied'){
      try{onApplied?.();}catch{/* A notification cannot undo a write. */}
    }
    return status;
  },options);
  return result.status==='ok'?result.value:result.status;
}
