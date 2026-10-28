'use client';

import {create} from 'zustand';
import {newWorkshop} from '../../../v2/src/workshop-engine';
import type {WorkshopState} from '../../../v2/src/workshop-engine';
import type {WorkshopSelectionSnapshot} from '../../../v2/src/workshop-runtime-contract';
import {CHANGE_EVENT,SAVE_KEY,parseSavedWorld} from './world-store';
import {mirrorWorkshopSave,readWorkshopBackup} from './world-database';

export const EMPTY_SELECTION:WorkshopSelectionSnapshot={
  worker:null,machine:null,movingFrom:null,selectedPlot:null,
};
type State={
  world:WorkshopState|null;
  raw:string|null;
  initialized:boolean;
  selection:WorkshopSelectionSnapshot;
  setSelection:(next:WorkshopSelectionSnapshot)=>void;
  syncFromStorage:()=>void;
};

export const useMoonworkState=create<State>((set,get)=>({
  world:null,raw:null,initialized:false,selection:EMPTY_SELECTION,
  setSelection:(next)=>set(state=>{
    const prev=state.selection;
    return prev.worker===next.worker&&prev.machine===next.machine&&
      prev.movingFrom===next.movingFrom&&prev.selectedPlot===next.selectedPlot
      ?state:{selection:next};
  }),
  syncFromStorage:()=>{
    let raw:string|null=null;
    try{raw=window.localStorage.getItem(SAVE_KEY);}catch{/* unavailable */}
    if(raw===get().raw&&get().initialized)return;
    const world=parseSavedWorld(raw);
    set({raw,world,initialized:true});
    if(world)mirrorWorkshopSave(world);
  },
}));

let listeners=0;
let detach:(()=>void)|null=null;
/** One event bridge for the Next UI and the Pixi runtime. */
export function connectMoonworkState(){
  if(listeners++===0){
    const sync=()=>useMoonworkState.getState().syncFromStorage();
    const onStorage=(e:StorageEvent)=>{
      if(e.key===SAVE_KEY||e.key===null)sync();
    };
    window.addEventListener(CHANGE_EVENT,sync);
    window.addEventListener('pageshow',sync);
    window.addEventListener('storage',onStorage);
    detach=()=>{
      window.removeEventListener(CHANGE_EVENT,sync);
      window.removeEventListener('pageshow',sync);
      window.removeEventListener('storage',onStorage);
    };
    sync();
  }
  return ()=>{
    listeners=Math.max(0,listeners-1);
    if(listeners===0){detach?.();detach=null;}
  };
}

let bootPromise:Promise<WorkshopState|null>|null=null;
/** Legacy save wins. A corrupt save is preserved; only a missing save may be
 * restored from IndexedDB or initialized. Never silently wipe V2 progress. */
export function ensureWorkshopWorld():Promise<WorkshopState|null>{
  if(bootPromise)return bootPromise;
  bootPromise=(async()=>{
    let raw:string|null;
    try{raw=window.localStorage.getItem(SAVE_KEY);}
    catch{return null;}
    if(raw!==null)return parseSavedWorld(raw);
    const backup=await readWorkshopBackup();
    try{
      // Another tab or component might have initialized while IndexedDB read.
      raw=window.localStorage.getItem(SAVE_KEY);
      if(raw!==null)return parseSavedWorld(raw);
      const world=backup??newWorkshop();
      window.localStorage.setItem(SAVE_KEY,JSON.stringify(world));
      window.dispatchEvent(new Event(CHANGE_EVENT));
      return world;
    }catch{return backup??null;}
  })().finally(()=>{bootPromise=null;});
  return bootPromise;
}
