'use client';
import {useMemo,useSyncExternalStore} from 'react';
import {SAVE_KEY,CHANGE_EVENT,parseSavedWorld} from '@/lib/moonwork/world-store';

/** One stable subscription for the lobby, town, orders, and warehouse.
 * Existing V2 saves and hydration behavior are unchanged. */
function subscribe(cb:()=>void){
  const onStorage=(e:StorageEvent)=>{if(e.key===SAVE_KEY||e.key===null)cb();};
  window.addEventListener('storage',onStorage);
  window.addEventListener(CHANGE_EVENT,cb);
  window.addEventListener('pageshow',cb);
  return ()=>{window.removeEventListener('storage',onStorage);
    window.removeEventListener(CHANGE_EVENT,cb);window.removeEventListener('pageshow',cb);};
}
function rawSave(){try{return localStorage.getItem(SAVE_KEY);}catch{return null;}}
export function useWorkshopWorld(){
  const raw=useSyncExternalStore(subscribe,rawSave,()=>null);
  return useMemo(()=>parseSavedWorld(raw),[raw]);
}
