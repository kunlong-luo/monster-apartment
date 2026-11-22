'use client';
import {useSyncExternalStore} from 'react';
import {decideWorker,decideYuesha,inspectCharacterRoom,newCharacterLife,recordWorkerStoryChapter,validCharacterLife,visitCharacter} from '../../core/character-life';
import type {CharacterId,CharacterLifeState,RoomObjectId,WorkerCharacterId,WorkerChoice,YueshaChoice} from '../../core/character-life';
import {characterLifeStorage} from './storage-service';
import {SAVE_KEY,parseSavedWorld} from '../moonwork/world-store';
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
  return characterLifeStorage.readRaw();
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
type Action=
  |{type:'visit';id:CharacterId}
  |{type:'yuesha-choice';choice:YueshaChoice}
  |{type:'worker-choice';id:WorkerCharacterId;choice:WorkerChoice}
  |{type:'inspect';id:CharacterId;item:RoomObjectId}
  |{type:'worker-chapter';id:WorkerCharacterId};
export type LifeActionStatus='applied'|'duplicate'|'corrupt'|'unavailable';
/** Separate lore progress; no workshop/cozy resource or money side effects. */
export function commitCharacterLife(action:Action):LifeActionStatus{
  const raw=readLifeSnapshot(),snapshot=decodeCharacterLife(raw);
  if(snapshot.status!=='ok')return snapshot.status;
  const previous=snapshot.progress;
  // Chapter progression is derived from the VALIDATED latest V2 save, not
  // a UI-reported number. It writes only the lore save, never any inventory.
  let next;
  if(action.type==='worker-chapter'){
    let rawWorkshop:string|null;
    try{rawWorkshop=window.localStorage.getItem(SAVE_KEY);}
    catch{return 'unavailable';}
    const workshop=parseSavedWorld(rawWorkshop);
    if(!workshop)return 'unavailable';
    next=recordWorkerStoryChapter(previous,action.id,workshop.completed);
  }else{
    next=action.type==='visit'?visitCharacter(previous,action.id):
      action.type==='yuesha-choice'?decideYuesha(previous,action.choice):
      action.type==='worker-choice'?decideWorker(previous,action.id,action.choice):
      inspectCharacterRoom(previous,action.id,action.item);
  }
  if(next===previous)return 'duplicate';
  try{
    characterLifeStorage.writeRaw(JSON.stringify(next));
    window.dispatchEvent(new Event(CHARACTER_LIFE_EVENT));
    return 'applied';
  }catch{return 'unavailable';}
}
