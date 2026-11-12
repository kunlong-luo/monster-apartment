'use client';
import {useEffect} from 'react';
import {simulateWorkshopAutoUntil,startWorkshopAuto,pauseWorkshopAuto,
  toggleWorkshopAutoDelivery} from '../../../v2/src/workshop-auto-production';
import {CHANGE_EVENT} from './world-store';
import {WORKSHOP_SAVE_LOCK,transactWorkshopSave} from '../../../v2/src/workshop-save-transaction';

export const WORKSHOP_AUTO_LOCK=WORKSHOP_SAVE_LOCK;
export type AutoToggleResult='enabled'|'paused'|'unavailable'|'missing'|'error';

export async function toggleWorkshopAuto():Promise<AutoToggleResult>{
  if(typeof navigator==='undefined'||!navigator.locks)return 'unavailable';
  let enabled=false;
  const result=await transactWorkshopSave(
    window.localStorage,navigator.locks,world=>{
      const next=world.auto?.enabled
        ?pauseWorkshopAuto(world):startWorkshopAuto(world,Date.now());
      enabled=Boolean(next.auto?.enabled);
      return next;
    },()=>window.dispatchEvent(new Event(CHANGE_EVENT))
  );
  return result==='applied'?(enabled?'enabled':'paused'):
    result==='missing'?'missing':
    result==='unchanged'||result==='unavailable'?'unavailable':'error';
}

/** A separate, explicit player choice. The same Web Lock and atomic
 * world transaction protects order dispatch, passive production and manual
 * purchases against cross-tab double settlement. */
export async function toggleWorkshopAutoContract():Promise<AutoToggleResult>{
  if(typeof navigator==='undefined'||!navigator.locks)return 'unavailable';
  let enabled=false;
  const result=await transactWorkshopSave(
    window.localStorage,navigator.locks,world=>{
      const next=toggleWorkshopAutoDelivery(world,Date.now());
      enabled=next.auto?.autoDeliver===true;
      return next;
    },()=>window.dispatchEvent(new Event(CHANGE_EVENT))
  );
  return result==='applied'?(enabled?'enabled':'paused'):
    result==='missing'?'missing':
    result==='unchanged'||result==='unavailable'?'unavailable':'error';
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
      void transactWorkshopSave(
        window.localStorage,navigator.locks,
        world=>disposed||!world.auto?.enabled
          ?world:simulateWorkshopAutoUntil(world,Date.now()),
        ()=>window.dispatchEvent(new Event(CHANGE_EVENT)),
        {ifAvailable:true}
      ).finally(()=>{busy=false;});
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
