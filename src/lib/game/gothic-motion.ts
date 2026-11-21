'use client';

import {useSyncExternalStore} from 'react';
import {gothicMotionStorage} from './storage-service';

const KEY='monster-apartment:gothic-motion-reduced';
const EVENT='monster-apartment:motion-changed';

function subscribe(callback:()=>void){
  const onStorage=(event:StorageEvent)=>{if(!event.key||event.key===KEY)callback();};
  window.addEventListener('storage',onStorage);
  window.addEventListener(EVENT,callback);
  return ()=>{
    window.removeEventListener('storage',onStorage);
    window.removeEventListener(EVENT,callback);
  };
}
function getSnapshot(){
  return gothicMotionStorage.readRaw() === '1';
}
/** Same saved motion setting for lobby, apartment, and future game screens. */
export function useGothicMotion(){
  const reduced=useSyncExternalStore(subscribe,getSnapshot,()=>false);
  const toggle=()=>{
    try{
      gothicMotionStorage.writeRaw(reduced?'0':'1');
      window.dispatchEvent(new Event(EVENT));
    }catch{
      // Browsers that block storage still honor system prefers-reduced-motion.
    }
  };
  return {reduced,toggle};
}
