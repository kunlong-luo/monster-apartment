'use client';
import Link from 'next/link';
import {useState} from 'react';
import type {ReactNode} from 'react';
import {CHANGE_EVENT,commitWorldAction} from '@/lib/moonwork/world-store';

export const WorkshopLink=({children,className='mw-link'}:{children:ReactNode;className?:string})=>
  <Link href="/workshop/" className={className}>{children}</Link>;
export function Panel({title,children}:{title:string;children:ReactNode}){
  return <section className="mw-panel"><h2>{title}</h2>{children}</section>;
}
export function Action({type,children}:{type:'accept'|'import'|'premium'|'marketWater'|'marketFiber'|'marketCore'|'resident';children:ReactNode}){
  const [message,setMessage]=useState('');
  return <div><button type="button" className="mw-action-button transition-transform duration-150 active:scale-[.98] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gothic-glow" onClick={()=>{
    const outcome=commitWorldAction(window.localStorage,type);
    if(outcome==='applied')window.dispatchEvent(new Event(CHANGE_EVENT));
    setMessage(({applied:'操作完成，工坊存档已更新。',
      missing:'没有可用的工坊存档。',unavailable:'当前不可进行此操作。',
      error:'本地存储不可写入。'} as const)[outcome]);
  }}>{children}</button>{message&&<p role="status" className="mw-message">{message}</p>}</div>;
}
