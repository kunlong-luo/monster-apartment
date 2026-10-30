'use client';
import {useSyncExternalStore} from 'react';

const watchVisibility=(notify:()=>void)=>{
  document.addEventListener('visibilitychange',notify);
  return ()=>document.removeEventListener('visibilitychange',notify);
};
const visible=()=>typeof document==='undefined'||document.visibilityState==='visible';

/** Shared tab visibility state: story clock pauses and decorative animation
 * stops together, with the visual beat remaining in memory. */
export function usePageVisibility(){
  return useSyncExternalStore(watchVisibility,visible,()=>true);
}
