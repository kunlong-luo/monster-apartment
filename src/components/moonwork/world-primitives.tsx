'use client';
import Link from 'next/link';
import {useState} from 'react';
import type {ReactNode} from 'react';
import {CHANGE_EVENT,commitWorldAction} from '@/lib/moonwork/world-store';
import type {WorldAction,ActionStatus} from '@/lib/moonwork/world-store';

/** Shared Tailwind v4 action and link styles for world panels, heroes
 * and worker assignment. No page-scoped action override is required. */
export const WORLD_LINK_CLASS=
  'mt-2.5 inline-flex min-h-9 items-center justify-center rounded-md border '+
  'border-[#d8a874] bg-[linear-gradient(105deg,#694632,#32202d)] px-3 py-2 '+
  'text-xs font-semibold text-[#ffe8c4] no-underline shadow-[inset_0_1px_#ffffff22] '+
  'transition-[border-color,transform,filter] duration-150 hover:-translate-y-0.5 '+
  'hover:border-gothic-glow hover:brightness-110 active:scale-[.98] '+
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gothic-glow '+
  'motion-reduce:transition-none';
export const WORLD_ACTION_CLASS=WORLD_LINK_CLASS+
  ' disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0';

export const WorkshopLink=({children,className=''}:{children:ReactNode;className?:string})=>
  <Link href="/workshop/" className={WORLD_LINK_CLASS+' '+className}>{children}</Link>;
export function Panel({title,children}:{title:string;children:ReactNode}){
  return <section className="mw-panel min-w-0 rounded-[10px] border border-[#aa855d75] bg-[linear-gradient(135deg,#34222ab9,#181219c9)] p-[14px] text-[#eee0cd] shadow-[inset_0_1px_#ebcd9220,0_5px_19px_#0004] [&_p]:text-xs [&_p]:leading-[1.7] [&_p]:text-[#dcc7ae] [&_strong]:text-[22px] [&_strong]:text-[#ffdb9e]">
    <h2 className="mb-[15px] border-b border-[#af907654] pb-[13px] font-serif text-[19px] font-bold text-[#f6d09e]">{title}</h2>
    {children}
  </section>;
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
      className={WORLD_ACTION_CLASS}
      onClick={execute}>{children}</button>
    {message&&<output role="status" className="block text-xs text-[#c7f0b8]">{message}</output>}
  </div>;
}
