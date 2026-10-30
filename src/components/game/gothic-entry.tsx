'use client';
import {useState,useSyncExternalStore} from 'react';
import {GothicLobby} from './gothic-lobby';
import {GothicWelcome} from './gothic-welcome';

export const WELCOME_ENTERED_KEY='monster-apartment:welcome-entered:v1';
const WELCOME_EVENT='monster-apartment:welcome-entered-changed';

function readEntered(){
  if(typeof window==='undefined')return false;
  try{return window.localStorage.getItem(WELCOME_ENTERED_KEY)==='1';}
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
    try{window.localStorage.setItem(WELCOME_ENTERED_KEY,'1');}
    catch{/* Storage denial cannot block play for this session. */}
    setSessionEntered(true);
    window.dispatchEvent(new Event(WELCOME_EVENT));
  };
  return previouslyEntered||sessionEntered
    ?<GothicLobby/>
    :<GothicWelcome onEnter={enter}/>;
}
