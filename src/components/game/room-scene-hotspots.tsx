'use client';

import {useId,useState} from 'react';
import {Check,Search,ListFilter,ScrollText} from 'lucide-react';
import type {CSSProperties} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {useGothicMotion} from '@/lib/game/gothic-motion';

/** Percentages refer to the scenic layer, not the whole screen.
 * Different layouts prevent object markers covering resident portraits. */
import {roomProjectedHotspotPosition,roomHotspotPlacements} from '@/core/room-stage-layout';
import type {RoomStageSize} from '@/core/room-stage-layout';
export type {SceneSpot} from '@/core/room-stage-layout';
export type SceneHotspotItem<T extends string=string>={id:T;label:string};

/** Minimal 44px markers preserve scene detail; accessible names and the
 * discovery panel supply labels on touch and keyboard. */
export function RoomSceneHotspots<T extends string>({
  items,observed,selected,onInspect,characterName,roomId,description,stageSize=null,preview=false,scenic=false,
}:{
  items:readonly SceneHotspotItem<T>[];
  observed:readonly string[];
  selected:T|null;
  onInspect:(id:T)=>void;
  characterName:string;
  roomId?:string;
  description?:string;
  stageSize?:RoomStageSize|null;
  preview?:boolean;scenic?:boolean;
}){
  const systemReduced=useReducedMotion();
  const {reduced:gameReduced}=useGothicMotion();
  const reducedMotion=Boolean(systemReduced||gameReduced);
  const known=items.filter(item=>observed.includes(item.id)).length;
  const [showOffscreen,setShowOffscreen]=useState(false);
  const offscreenMenuId=useId();
  const placements=roomHotspotPlacements(items.map((item,index)=>({
    id:item.id,
    position:roomProjectedHotspotPosition(roomId??'',item.id,stageSize,index,preview),
  })),stageSize);
  const inaccessible=items.filter((_,index)=>placements[index].visibility!=='visible');
  const hasOverlap=placements.some(placement=>placement.visibility==='overlap');
  return <div className={"pointer-events-none absolute inset-0 z-[4]"+(scenic?" lg:hidden":"")} data-hotspot-layout="object-id" aria-label={characterName+'的房间物件'}>
    {items.map((item,index)=>{
      const discovered=observed.includes(item.id);
      const placement=placements[index];
      const point=placement.position;
      if(placement.visibility!=='visible')return null;
      return <button type="button" key={item.id}
        aria-label={item.label}
        aria-pressed={selected===item.id}
        data-testid={'scene-object-'+item.id}
        data-marker-layout="compact"
        style={{left:point.left,top:point.top} as CSSProperties}
        onClick={()=>onInspect(item.id)}
        className={'group pointer-events-auto absolute z-10 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-[0_3px_16px_#0009] transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffe3b2] motion-reduce:transition-none '+
          (selected===item.id
            ?'border-[#ffe0aa] bg-[#65402fe0] text-[#fff0d3] shadow-[0_0_18px_#eac38f72]'
            :discovered
              ?'border-[#d3ab71c4] bg-[#201521c9] text-[#f9d8a3] hover:border-[#ffe0aa]'
              :'border-[#d7af80b0] bg-[#201521ad] text-[#f5e1cd] hover:border-[#ffe0aa] hover:bg-[#4c2c3bd9]')}
      >
        <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full border border-[#daba8f65] bg-[#3c2834a6] text-[#f5d3a7]">
          {discovered?<Check size={13} strokeWidth={1.75}/>:<Search size={13} strokeWidth={1.75}/>}
        </span>
        <span aria-hidden="true"
          className="pointer-events-none invisible absolute top-[calc(100%+4px)] left-1/2 z-20 w-max max-w-40 -translate-x-1/2 rounded-md border border-[#e2bc8c7a] bg-[#1b1322ef] px-2 py-1 text-[11px] leading-5 text-[#ffe1bb] opacity-0 shadow-[0_8px_22px_#000a] transition-opacity duration-150 sm:group-hover:visible sm:group-hover:opacity-100 sm:group-focus-visible:visible sm:group-focus-visible:opacity-100">
          {item.label}
        </span>
      </button>;
    })}
    {inaccessible.length>0&&<div className="pointer-events-auto absolute right-3 top-3 z-[15] flex max-w-[66%] lg:top-[68px] flex-col items-end gap-2"
      data-testid="room-offscreen-objects">
      <button type="button" aria-controls={offscreenMenuId} aria-expanded={showOffscreen}
        onClick={()=>setShowOffscreen(open=>!open)}
        data-testid="room-offscreen-toggle"
        className="min-h-11 rounded-full border border-[#d9b384c9] bg-[#1c1126e3] px-3 py-2 text-[11px] text-[#ffdfb2] shadow-[0_5px_18px_#000a] hover:bg-[#372339] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffdfb2]"
      ><span className="inline-flex items-center gap-1.5"><ListFilter aria-hidden="true" size={15} strokeWidth={1.6}/>{hasOverlap?'更多调查物件':'画面外物件'} · {inaccessible.length}</span></button>
      {showOffscreen&&<div id={offscreenMenuId} role="group" aria-label={hasOverlap?'画面外或重叠的可调查物件':'画面外可调查物件'}
        className="flex max-w-[230px] flex-col gap-1 rounded-xl border border-[#d9b3848c] bg-[#1a1023f2] p-2 shadow-[0_8px_22px_#000a]">
        {inaccessible.map(item=><button type="button" key={item.id} aria-label={item.label}
          aria-pressed={selected===item.id}
          data-testid={'scene-object-'+item.id}
          data-marker-layout="offscreen"
          onClick={()=>{onInspect(item.id);setShowOffscreen(false);}}
          className="min-h-11 rounded-lg border border-[#bba17c7a] bg-[#312034e6] px-3 py-2 text-left text-xs text-[#ffe3c5] hover:border-[#ffe0b0] focus-visible:outline-2 focus-visible:outline-[#ffe0b0]"
        ><span className="inline-flex items-center gap-2">{observed.includes(item.id)?<Check aria-hidden="true" size={14}/>:<Search aria-hidden="true" size={14}/>} {item.label}</span></button>)}
      </div>}
    </div>}
    <AnimatePresence mode="wait">
      {selected&&description&&<motion.div key={selected}
        role="status" aria-live="polite" data-testid="scene-discovery"
        initial={reducedMotion?false:{opacity:0,y:10}}
        animate={{opacity:1,y:0}}
        exit={reducedMotion?{opacity:0}:{opacity:0,y:7}}
        transition={{duration:reducedMotion?0:.2}}
        className="pointer-events-none absolute bottom-12 left-[5%] right-[5%] z-[9] max-w-[min(80%,560px)] rounded-lg border border-[#e7bb8e9e] bg-[#1b1124e9] px-3 py-2 text-[11px] leading-5 text-[#ffe0bf] shadow-[0_6px_24px_#000a] backdrop-blur-md">
        <ScrollText aria-hidden="true" size={14} strokeWidth={1.5} className="mr-1 inline text-[#ffc980]"/>{description}
      </motion.div>}
    </AnimatePresence>
    <span className="pointer-events-none absolute bottom-2 left-3 rounded-full border border-[#c79b7258] bg-[#160f1ad5] px-2.5 py-1 text-[10px] text-[#f1c99f]">
      探索房间 · {known}/{items.length}
    </span>
  </div>;
}
