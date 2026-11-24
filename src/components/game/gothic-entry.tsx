'use client';
import {useState,useSyncExternalStore} from 'react';
import dynamic from 'next/dynamic';

// First-visit cover must not pull the entire lobby, auto-production UI and
// scene effects into the initial Web route before the player enters.
const GothicLobby=dynamic(()=>import('./gothic-lobby').then(module=>module.GothicLobby),{
  ssr:false,
  loading:()=> <main className="grid min-h-dvh place-items-center bg-[#120b19] px-5 text-center text-[#e8d4b2]"
    aria-label="正在进入怪物公寓" data-testid="lobby-loading">
    <div className="grid gap-3"><span aria-hidden="true" className="text-4xl">☾</span>
      <p className="text-sm tracking-[.17em]">正在开启公寓大门…</p></div>
  </main>,
});
import {GothicWelcome} from './gothic-welcome';
import {welcomeEnteredStorage} from '@/lib/game/storage-service';

export const WELCOME_ENTERED_KEY='monster-apartment:welcome-entered:v1';
const WELCOME_EVENT='monster-apartment:welcome-entered-changed';

function readEntered(){
  if(typeof window==='undefined')return false;
  try{return welcomeEnteredStorage.readRaw()==='1';}
  catch{return false;}
}
function subscribeEntered(callback:()=>void){
  const onStorage=(event:StorageEvent)=>{
    if(event.key===WELCOME_ENTERED_KEY||event.key===null)callback();
  };
  window.addEventListener('storage',onStorage);
  window.addEventListener(WELCOME_EVENT,callback);
  return ()=>{
    window.removeEventListener('storage',onStorage);
    window.removeEventListener(WELCOME_EVENT,callback);
  };
}
/** No eighth route: first-entry welcome and saved game use the same root URL. */
export function GothicEntry(){
  const previouslyEntered=useSyncExternalStore(subscribeEntered,readEntered,()=>false);
  const [sessionEntered,setSessionEntered]=useState(false);
  const enter=()=>{
    try{welcomeEnteredStorage.writeRaw('1');}
    catch{/* Storage denial cannot block play for this session. */}
    setSessionEntered(true);
    window.dispatchEvent(new Event(WELCOME_EVENT));
  };
  return previouslyEntered||sessionEntered
    ?<GothicLobby/>
    :<GothicWelcome onEnter={enter}/>;
}
