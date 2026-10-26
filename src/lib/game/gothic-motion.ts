'use client';

import {useSyncExternalStore} from 'react';

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
  try{return window.localStorage.getItem(KEY)==='1';}catch{return false;}
}
/** Same saved motion setting for lobby, apartment, and future game screens. */
export function useGothicMotion(){
  const reduced=useSyncExternalStore(subscribe,getSnapshot,()=>false);
  const toggle=()=>{
    try{
      window.localStorage.setItem(KEY,reduced?'0':'1');
      window.dispatchEvent(new Event(EVENT));
    }catch{
      // Browsers that block storage still honor system prefers-reduced-motion.
    }
  };
  return {reduced,toggle};
}
