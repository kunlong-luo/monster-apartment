'use client';

import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
import {useGothicMotion} from '@/lib/game/gothic-motion';

const ROUTES=new Set(['/','/apartment','/workshop','/town','/orders','/characters','/warehouse']);
const normalize=(path:string)=>path.replace(/^\/monster-apartment(?=\/|$)/,'').replace(/\/$/,'')||'/';

/** Persistent (layout-owned) navigation veil; it never delays Next Link.
 * Failed navigation cannot leave a blocking overlay. Browser history, reduced
 * motion and exact Pages basePath routes are all supported. */
export function GothicRouteTransition(){
  const pathname=usePathname();
  const {reduced}=useGothicMotion();
  const veil=useRef<HTMLDivElement>(null);
  const previous=useRef(pathname);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(()=>{
    const curtain=veil.current;
    if(!curtain)return;
    const clear=()=>{if(timer.current!==null)clearTimeout(timer.current);};
    const prefersStill=()=>reduced||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const depart=()=>{
      if(prefersStill())return;
      clear();
      curtain.dataset.phase='depart';
      // Never leave the page obscured if navigation is prevented or fails.
      timer.current=setTimeout(()=>{curtain.dataset.phase='idle';},1700);
    };
    const clicked=(event:MouseEvent)=>{
      if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||
        event.altKey||event.shiftKey)return;
      if(!(event.target instanceof Element))return;
      const link=event.target.closest<HTMLAnchorElement>('a[href]');
      if(!link||link.hasAttribute('download')||
        (link.target&&link.target!=='_self'))return;
      let url:URL;
      try{url=new URL(link.href,window.location.href);}catch{return;}
      if(url.origin!==window.location.origin)return;
      const source=normalize(window.location.pathname),destination=normalize(url.pathname);
      // Skip current links, hash jumps and URLs outside the seven game scenes.
      if(!ROUTES.has(destination)||source===destination)return;
      depart();
    };
    document.addEventListener('click',clicked,true);
    window.addEventListener('popstate',depart);
    return ()=>{
      clear();
      document.removeEventListener('click',clicked,true);
      window.removeEventListener('popstate',depart);
    };
  },[reduced]);

  useEffect(()=>{
    if(previous.current===pathname)return;
    previous.current=pathname;
    const curtain=veil.current;
    if(!curtain)return;
    if(timer.current!==null)clearTimeout(timer.current);
    const still=reduced||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    curtain.dataset.phase=still?'idle':'arrive';
    if(!still)timer.current=setTimeout(()=>{curtain.dataset.phase='idle';},430);
  },[pathname,reduced]);

  return <div ref={veil} data-testid="gothic-route-transition"
    data-phase="idle" aria-hidden="true" className="gothic-route-transition">
    <span className="gothic-route-transition__sigil" aria-hidden="true">✧</span>
  </div>;
}
