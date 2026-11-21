'use client';

import {useId,useRef,useState} from 'react';
import {COZY_RESIDENTS,ROOM_DETAILS,COZY_INCIDENTS} from '@/core/cozy-engine';
import type {CozyState,HomeType} from '@/core/cozy-engine';
import {House,Bath,Anvil,Sprout,Plus,ChevronDown} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

export const ROOM_ICONS:Record<HomeType,LucideIcon>={
  nest:House,bath:Bath,workshop:Anvil,greenhouse:Sprout,
};

/** Visual/interaction component only: all mutations live in the owning game scene. */
export function GothicRoomDoors({
  world,selected,onChoose
}:{
  world:CozyState;
  selected:number|null;
  onChoose:(index:number)=>void;
}){
  const [mobileOpen,setMobileOpen]=useState(false);
  const menuId=useId();
  const mobileToggle=useRef<HTMLButtonElement>(null);
  const occupied=world.rooms.filter(room=>!!room?.resident).length;
  const chooseRoom=(index:number)=>{
    onChoose(index);
    setMobileOpen(false);
  };
  return <aside className="ga-room-list absolute z-[3] top-[18%] left-[clamp(9px,2vw,28px)] flex max-h-[60%] w-[clamp(195px,19vw,278px)] flex-col gap-2.5 max-[850px]:top-[18%] max-[850px]:max-h-[57%] max-[850px]:w-[220px] max-[840px]:top-[15%] max-[600px]:top-[14%] max-[600px]:left-[7px] max-[600px]:max-h-none max-[600px]:w-fit max-[600px]:gap-1" aria-label="可交互的公寓房间"
    onKeyDown={event=>{
      if(event.key==='Escape'&&mobileOpen){
        event.preventDefault();event.stopPropagation();
        setMobileOpen(false);mobileToggle.current?.focus();
      }
    }}>
    <button type="button" ref={mobileToggle} data-testid="ga-room-menu-toggle"
      aria-controls={menuId} aria-expanded={mobileOpen}
      aria-label={mobileOpen?'收起公寓房间列表':'展开公寓房间列表'}
      onClick={()=>setMobileOpen(open=>!open)}
      className="hidden min-h-9 items-center gap-1.5 rounded-md border border-gothic-brass/60 bg-gothic-panel/95 px-3 text-xs text-gothic-ivory shadow-[0_5px_18px_#0009] max-[600px]:flex">
      <House size={15} strokeWidth={1.7} aria-hidden="true"/>
      <span>房间 · {occupied}/{world.rooms.length} 入住</span>
      {world.incident&&<span className="text-[#ffbba4]" aria-label="公寓事件待查看">!</span>}
      <ChevronDown size={14} strokeWidth={1.7} aria-hidden="true"
        className={mobileOpen?'rotate-180':''}/>
    </button>
    <div id={menuId} data-testid="ga-room-menu-panel"
      className={'contents max-[600px]:w-[min(250px,calc(100vw-14px))] max-[600px]:rounded-lg max-[600px]:border max-[600px]:border-gothic-brass/55 max-[600px]:bg-gothic-panel/95 max-[600px]:p-2 max-[600px]:shadow-[0_12px_28px_#000b] '+(mobileOpen?'max-[600px]:block':'max-[600px]:hidden')}>
    <div className="ga-list-title font-serif text-[10px] tracking-[.19em] text-[#c7a87c] [text-shadow:0_1px_8px_#000] max-[600px]:text-[8px]">RESIDENCE · 六扇房门</div>
    <div className="ga-doors grid grid-cols-1 gap-[7px] overflow-auto py-1 pr-1 pl-0.5 [scrollbar-color:#9b7549_transparent] [scrollbar-width:thin] max-[600px]:gap-[3px] max-[600px]:p-0.5">
      {world.rooms.map((place,index)=>{
        const resident=place?.resident
          ?COZY_RESIDENTS.find(person=>person.id===place.resident)
          :null;
        const RoomIcon=place?ROOM_ICONS[place.type]:Plus;
        return <button key={index} type="button" onClick={()=>chooseRoom(index)}
          data-testid={'ga-room-'+index}
          aria-label={String(index+1)+'号房 '+(place?ROOM_DETAILS[place.type].zh:'待建造')}
          aria-pressed={selected===index}
          data-resident={place?.resident??'empty'}
          className={'ga-door relative flex min-h-[49px] items-center gap-[9px] overflow-hidden rounded-[4px_10px_10px_4px] border border-[#a8885b80] bg-[linear-gradient(105deg,#3f2826e3,#1a1019dc_48%,#26141ce8)] py-[7px] pr-2 pl-[11px] text-left text-gothic-ivory shadow-[inset_2px_0_#c8a06c68,inset_0_1px_#f8d8ae30,0_6px_14px_#0503078a] backdrop-blur-[9px] transition-[transform,border-color,background,box-shadow] duration-200 hover:translate-x-1 hover:border-[#f5ca8e] hover:bg-[linear-gradient(100deg,#66402f,#2c1b25df)] focus-visible:translate-x-1 focus-visible:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow aria-pressed:translate-x-1 aria-pressed:border-[#f5ca8e] aria-pressed:bg-[linear-gradient(100deg,#66402f,#2c1b25df)] motion-reduce:transition-none max-[600px]:min-h-[37px] max-[600px]:gap-[3px] max-[600px]:rounded-[3px_6px_6px_3px] max-[600px]:px-[6px] max-[600px]:py-1'+(selected===index?' is-active':'')+(resident?' is-occupied border-l-[3px] border-l-[#dbb17a]':'')}>
          <span className="ga-door-icon grid w-[34px] shrink-0 place-items-center text-[#edbf80] max-[600px]:w-[22px]" aria-hidden="true"><RoomIcon size={20} strokeWidth={1.65}/></span>
          <span className="ga-door-copy grid min-w-0 gap-1">
            <strong className="whitespace-nowrap text-[clamp(11px,1vw,13px)] font-medium tracking-[.025em] text-[#fbe2c3] max-[600px]:text-[10px]">{String(index+1).padStart(2,'0')} · {place?ROOM_DETAILS[place.type].zh:'待建造'}</strong>
            <small className="truncate whitespace-nowrap text-[10px] text-[#caae92] max-[600px]:text-[9px]">{resident?'住客 · '+resident.zh:place?'房间空置':'点击修建'}</small>
          </span>
        </button>;
      })}
    </div>
    {world.incident&&<span className="ga-incident inline-flex rounded-lg border border-[#aa7467] bg-[#3e2332d8] p-2 text-[11px] leading-[1.4] text-[#ffbba4]">
      ✧ {COZY_INCIDENTS[world.incident.kind].zh}
    </span>}
    </div>
  </aside>;
}
