'use client';
import {useSyncExternalStore} from 'react';
import {decideYuesha,newCharacterLife,validCharacterLife,visitCharacter} from '../../core/character-life';
import type {CharacterId,CharacterLifeState,YueshaChoice} from '../../core/character-life';
export const CHARACTER_LIFE_KEY='monster-apartment:character-life:v1';
export const CHARACTER_LIFE_EVENT='monster-apartment:character-life-change';
const UNAVAILABLE='__character-life-unavailable__';
type ReadResult={status:'ok'|'corrupt'|'unavailable';progress:CharacterLifeState};
export function decodeCharacterLife(raw:string|null):ReadResult{
  if(raw===UNAVAILABLE)return {status:'unavailable',progress:newCharacterLife()};
  if(raw===null)return {status:'ok',progress:newCharacterLife()};
  try{
    const value:unknown=JSON.parse(raw);
    return validCharacterLife(value)?{status:'ok',progress:value}:
      {status:'corrupt',progress:newCharacterLife()};
  }catch{return {status:'corrupt',progress:newCharacterLife()};}
}
export function readLifeSnapshot():string|null{
  if(typeof window==='undefined')return null;
  try{return window.localStorage.getItem(CHARACTER_LIFE_KEY);}catch{return UNAVAILABLE;}
}
function subscribe(onChange:()=>void):()=>void{
  const onStorage=(e:StorageEvent)=>{if(e.key===CHARACTER_LIFE_KEY||e.key===null)onChange();};
  window.addEventListener('storage',onStorage);
  window.addEventListener(CHARACTER_LIFE_EVENT,onChange);
  return ()=>{window.removeEventListener('storage',onStorage);window.removeEventListener(CHARACTER_LIFE_EVENT,onChange);};
}
export function useCharacterLife():ReadResult{
  const raw=useSyncExternalStore(subscribe,readLifeSnapshot,()=>null);
  return decodeCharacterLife(raw);
}
type Action={type:'visit';id:CharacterId}|{type:'yuesha-choice';choice:YueshaChoice};
export type LifeActionStatus='applied'|'duplicate'|'corrupt'|'unavailable';
/** Separate lore progress; no workshop/cozy resource or money side effects. */
export function commitCharacterLife(action:Action):LifeActionStatus{
  const raw=readLifeSnapshot(),snapshot=decodeCharacterLife(raw);
  if(snapshot.status!=='ok')return snapshot.status;
  const previous=snapshot.progress;
  const next=action.type==='visit'?visitCharacter(previous,action.id):
    decideYuesha(previous,action.choice);
  if(next===previous)return 'duplicate';
  try{
    window.localStorage.setItem(CHARACTER_LIFE_KEY,JSON.stringify(next));
    window.dispatchEvent(new Event(CHARACTER_LIFE_EVENT));
    return 'applied';
  }catch{return 'unavailable';}
}
