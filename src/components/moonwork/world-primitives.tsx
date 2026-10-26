'use client';
import Link from 'next/link';
import {useState} from 'react';
import type {ReactNode} from 'react';
import {CHANGE_EVENT,commitWorldAction} from '@/lib/moonwork/world-store';
import type {WorldAction,ActionStatus} from '@/lib/moonwork/world-store';

export const WorkshopLink=({children,className='mw-link'}:{children:ReactNode;className?:string})=>
  <Link href="/workshop/" className={className}>{children}</Link>;
export function Panel({title,children}:{title:string;children:ReactNode}){
  return <section className="mw-panel min-w-0 rounded-xl border border-gothic-brass/60 bg-gothic-panel/85 p-4 text-gothic-ivory shadow-[0_8px_24px_#0006] sm:p-5"><h2>{title}</h2>{children}</section>;
}
export function Action({type,children,disabled=false,testId,onApplied}:{
  type:WorldAction;children:ReactNode;disabled?:boolean;testId?:string;
  onApplied?:()=>void;
}){
  const [message,setMessage]=useState('');
  const execute=()=>{
    let outcome:ActionStatus;
    try{outcome=commitWorldAction(window.localStorage,type);}
    catch{outcome='error';}
    if(outcome==='applied'){
      window.dispatchEvent(new Event(CHANGE_EVENT));
      onApplied?.();
    }
    setMessage(({applied:'操作完成，工坊存档已更新。',
      missing:'没有可用的工坊存档。',unavailable:'当前不可进行此操作。',
      error:'本地存储不可写入。'} as const)[outcome]);
  };
  return <div>
    <button type="button" data-testid={testId} disabled={disabled}
      className="mw-action-button transition-transform duration-150 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gothic-glow"
      onClick={execute}>{children}</button>
    {message&&<p role="status" className="mw-message">{message}</p>}
  </div>;
}
