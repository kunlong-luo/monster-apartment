'use client';
import Link from 'next/link';
import {useId,useRef,useState} from 'react';
import {House,DoorOpen,ChevronDown} from 'lucide-react';
import {CHARACTER_PROFILES} from '@/core/character-life';
import type {CharacterId} from '@/core/character-life';

const residents:readonly CharacterId[]=['yuesha','brook','fern','cinder'];
export function GothicRoomDoors({roomHref}:{roomHref:string}){
  const [mobileOpen,setMobileOpen]=useState(false);
  const menuId=useId();
  const mobileToggle=useRef<HTMLButtonElement>(null);
  return <aside className="ga-room-list absolute z-[3] top-[18%] left-[clamp(9px,2vw,28px)] flex max-h-[60%] w-[clamp(195px,19vw,278px)] flex-col gap-2.5 max-[850px]:w-[220px] max-[840px]:top-[15%] max-[600px]:top-[14%] max-[600px]:left-[7px] max-[600px]:w-fit max-[600px]:gap-1" aria-label="可交互的公寓房间"
    onKeyDown={event=>{if(event.key==='Escape'&&mobileOpen){event.preventDefault();event.stopPropagation();setMobileOpen(false);mobileToggle.current?.focus();}}}>
    <button type="button" ref={mobileToggle} data-testid="ga-room-menu-toggle"
      aria-controls={menuId} aria-expanded={mobileOpen} aria-label={mobileOpen?'收起公寓房间列表':'展开公寓房间列表'}
      onClick={()=>setMobileOpen(open=>!open)}
      className="hidden min-h-11 items-center gap-1.5 rounded-md border border-gothic-brass/60 bg-gothic-panel/95 px-3 text-xs text-gothic-ivory shadow-lg max-[600px]:flex">
      <House size={15} aria-hidden="true"/><span>人物房间 · 4 间</span><ChevronDown size={14} aria-hidden="true" className={mobileOpen?'rotate-180':''}/>
    </button>
    <div id={menuId} data-testid="ga-room-menu-panel" className={'contents max-[600px]:w-[min(250px,calc(100vw-14px))] max-[600px]:rounded-lg max-[600px]:border max-[600px]:border-gothic-brass/55 max-[600px]:bg-gothic-panel/95 max-[600px]:p-2 '+(mobileOpen?'max-[600px]:block':'max-[600px]:hidden')}>
      <div className="ga-list-title text-xs text-gothic-gold">公寓住客</div>
      <div className="ga-doors grid gap-2 overflow-auto py-1">
        {residents.map((id,index)=><Link key={id} href={id==='yuesha'?roomHref:'/characters/?visit='+id}
          onClick={()=>setMobileOpen(false)} data-testid={'ga-room-'+index}
          aria-label={'拜访'+CHARACTER_PROFILES[id].name+'的私人房间'}
          className="ga-door flex min-h-12 items-center gap-3 rounded-lg border border-gothic-brass/60 bg-gothic-panel/90 px-3 py-2 text-gothic-ivory shadow-lg hover:border-gothic-glow">
          <DoorOpen size={20} aria-hidden="true"/>
          <span className="grid min-w-0 gap-1"><strong className="text-sm">{CHARACTER_PROFILES[id].name}</strong><small className="text-xs text-gothic-muted">{CHARACTER_PROFILES[id].title}</small></span>
        </Link>)}
      </div>
    </div>
  </aside>;
}
