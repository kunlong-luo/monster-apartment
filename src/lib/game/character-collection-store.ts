'use client';
import {useSyncExternalStore} from 'react';
import {equipEquipment,forgeEquipment,newCharacterCollection,summonCharacter,validCharacterCollection} from '@/core/character-collection';
import type {CardKey,CollectionState,GearId} from '@/core/character-collection';
import type {CharacterId} from '@/core/character-life';

export const COLLECTION_KEY='monster-apartment:character-collection:v1';
const EVENT='monster-apartment:collection-updated';
const UNAVAILABLE='__collection-no-storage__';
export type CollectionStatus='ok'|'corrupt'|'unavailable';
export function decodeCollection(raw:string|null):{status:CollectionStatus;collection:CollectionState}{
  if(raw===UNAVAILABLE)return {status:'unavailable',collection:newCharacterCollection()};
  if(raw===null)return {status:'ok',collection:newCharacterCollection()};
  try{
    const val:unknown=JSON.parse(raw);
    return validCharacterCollection(val)?{status:'ok',collection:val}:
      {status:'corrupt',collection:newCharacterCollection()};
  }catch{return {status:'corrupt',collection:newCharacterCollection()};}
}
function snapshot():string|null{
  if(typeof window==='undefined')return null;
  try{return localStorage.getItem(COLLECTION_KEY);}catch{return UNAVAILABLE;}
}
function subscribe(cb:()=>void){
  const storage=(e:StorageEvent)=>{if(e.key===COLLECTION_KEY||e.key===null)cb();};
  window.addEventListener('storage',storage);window.addEventListener(EVENT,cb);
  return ()=>{window.removeEventListener('storage',storage);window.removeEventListener(EVENT,cb);};
}
export function useCharacterCollection(){
  return decodeCollection(useSyncExternalStore(subscribe,snapshot,()=>null));
}
export type CollectionAction=
  |{type:'summon';earned:number;roll:number}
  |{type:'forge';id:GearId}
  |{type:'equip';character:CharacterId;id:GearId};
export type CollectionResult={status:'applied'|'duplicate'|'corrupt'|'unavailable';card?:CardKey};
/** The lore and workshop saves are never mutated by the card collection. */
export function commitCollection(action:CollectionAction):CollectionResult{
  const current=decodeCollection(snapshot());
  if(current.status!=='ok')return {status:current.status};
  const s=current.collection;
  const next=action.type==='summon'?summonCharacter(s,action.earned,action.roll):
    action.type==='forge'?forgeEquipment(s,action.id):
    equipEquipment(s,action.character,action.id);
  if(next===s)return {status:'duplicate'};
  try{
    window.localStorage.setItem(COLLECTION_KEY,JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
    return {status:'applied',card:action.type==='summon'?next.draws.at(-1):undefined};
  }catch{return {status:'unavailable'};}
}
