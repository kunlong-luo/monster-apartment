'use client';
import {useEffect} from 'react';
import {simulateWorkshopAutoUntil,startWorkshopAuto,pauseWorkshopAuto} from '../../../v2/src/workshop-auto-production';
import {CHANGE_EVENT,parseSavedWorld,SAVE_KEY} from './world-store';

export const WORKSHOP_AUTO_LOCK='monster-apartment:realtime-workshop-v1';
export type AutoToggleResult='enabled'|'paused'|'unavailable'|'missing'|'error';

export async function toggleWorkshopAuto():Promise<AutoToggleResult>{
  if(typeof navigator==='undefined'||!navigator.locks)return 'unavailable';
  try{
    return await navigator.locks.request(WORKSHOP_AUTO_LOCK,():AutoToggleResult=>{
      const raw=window.localStorage.getItem(SAVE_KEY);
      const world=parseSavedWorld(raw);
      if(!world)return 'missing';
      const next=world.auto?.enabled?pauseWorkshopAuto(world):startWorkshopAuto(world,Date.now());
      if(next===world)return 'unavailable';
      if(window.localStorage.getItem(SAVE_KEY)!==raw)return 'error';
      // Production state and clock share ONE existing, validated save write.
      window.localStorage.setItem(SAVE_KEY,JSON.stringify(next));
      window.dispatchEvent(new Event(CHANGE_EVENT));
      const outcome:AutoToggleResult=next.auto?.enabled?'enabled':'paused';
      return outcome;
    });
  }catch{return 'error';}
}

/** Active on all seven routes, even when workshop Pixi is unmounted.
 * Web Locks elect one auto writer; a timer ONLY wakes timestamp simulation.
 * Without Web Locks, refuse to produce instead of risking double rewards. */
export function WorkshopAutoRuntime(){
  useEffect(()=>{
    if(!navigator.locks)return;
    let disposed=false,busy=false;
    const tick=()=>{
      if(disposed||busy||document.hidden)return;
      busy=true;
      void navigator.locks.request(WORKSHOP_AUTO_LOCK,{ifAvailable:true},lock=>{
        if(!lock||disposed)return;
        let raw:string|null;
        try{raw=window.localStorage.getItem(SAVE_KEY);}catch{return;}
        const world=parseSavedWorld(raw);
        if(!world?.auto?.enabled)return;
        const next=simulateWorkshopAutoUntil(world,Date.now());
        if(next===world)return;
        try{
          if(window.localStorage.getItem(SAVE_KEY)!==raw)return;
          window.localStorage.setItem(SAVE_KEY,JSON.stringify(next));
          window.dispatchEvent(new Event(CHANGE_EVENT));
        }catch{/* Uncommitted output is never displayed as a reward. */}
      }).catch(()=>undefined).finally(()=>{busy=false;});
    };
    const interval=window.setInterval(tick,3000);
    window.addEventListener(CHANGE_EVENT,tick);
    window.addEventListener('pageshow',tick);
    window.addEventListener('focus',tick);
    const onVisibility=()=>{if(!document.hidden)tick();};
    document.addEventListener('visibilitychange',onVisibility);
    tick();
    return ()=>{
      disposed=true;window.clearInterval(interval);
      window.removeEventListener(CHANGE_EVENT,tick);
      window.removeEventListener('pageshow',tick);
      window.removeEventListener('focus',tick);
      document.removeEventListener('visibilitychange',onVisibility);
    };
  },[]);
  return null;
}
