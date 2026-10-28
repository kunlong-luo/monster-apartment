'use client';

import type {CSSProperties} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';

/** Percentages refer to the scenic layer, not the whole screen.
 * Different layouts prevent object markers covering resident portraits. */
import {roomHotspotPosition} from '@/core/room-stage-layout';
export type {SceneSpot} from '@/core/room-stage-layout';
export type SceneHotspotItem<T extends string=string>={id:T;label:string};

/** Interactive scene markers stay keyboard-operable and expose discovery
 * feedback without forcing players to scroll to a separate action panel. */
export function RoomSceneHotspots<T extends string>({
  items,observed,selected,onInspect,characterName,roomId,description,
}:{
  items:readonly SceneHotspotItem<T>[];
  observed:readonly string[];
  selected:T|null;
  onInspect:(id:T)=>void;
  characterName:string;
  roomId?:string;
  description?:string;
}){
  const reducedMotion=useReducedMotion();
  const known=items.filter(item=>observed.includes(item.id)).length;
  return <div className="pointer-events-none absolute inset-0 z-[4]" data-hotspot-layout="object-id" aria-label={characterName+'的房间物件'}>
    {items.map((item,index)=>{
      const discovered=observed.includes(item.id);
      const point=roomHotspotPosition(roomId??'',item.id,index);
      return <button type="button" key={item.id}
        aria-label={item.label}
        aria-pressed={selected===item.id}
        data-testid={'scene-object-'+item.id}
        style={{left:point.left,top:point.top} as CSSProperties}
        onClick={()=>onInspect(item.id)}
        className={'group pointer-events-auto absolute z-10 flex min-h-11 min-w-11 max-w-[min(52vw,190px)] -translate-y-1/2 items-center gap-2 rounded-full border px-2.5 py-1.5 shadow-[0_3px_16px_#0009] backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-[#ffe3b2] motion-reduce:transition-none '+
          (selected===item.id
            ?'border-[#ffe0aa] bg-[#765540e8] text-[#fff0d3] shadow-[0_0_19px_#eac38f7a]'
            :discovered
              ?'border-[#d3ab719e] bg-[#2a1a27da] text-[#f9d8a3] hover:border-[#ffe0aa]'
              :'border-[#d7af8091] bg-[#201521d9] text-[#f5e1cd] hover:border-[#ffe0aa] hover:bg-[#674556dd]')}
      >
        <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#daba8f70] bg-[#3c2834d9] text-sm text-[#f5d3a7]">
          {discovered?'✦':'⌕'}
        </span>
        <span className="min-w-0 text-left text-[10px] leading-[1.3] sm:hidden sm:group-hover:block sm:group-focus-visible:block">
          {item.label}
        </span>
      </button>;
    })}
    <AnimatePresence mode="wait">
      {selected&&description&&<motion.div key={selected}
        role="status" aria-live="polite" data-testid="scene-discovery"
        initial={reducedMotion?false:{opacity:0,y:10}}
        animate={{opacity:1,y:0}}
        exit={reducedMotion?{opacity:0}:{opacity:0,y:7}}
        transition={{duration:reducedMotion?0:.2}}
        className="pointer-events-none absolute bottom-12 left-[5%] right-[5%] z-[9] max-w-[min(80%,560px)] rounded-lg border border-[#e7bb8e9e] bg-[#1b1124e9] px-3 py-2 text-[11px] leading-5 text-[#ffe0bf] shadow-[0_6px_24px_#000a] backdrop-blur-md">
        <span className="mr-1 text-[#ffc980]">✧</span>{description}
      </motion.div>}
    </AnimatePresence>
    <span className="pointer-events-none absolute bottom-2 left-3 rounded-full border border-[#c79b7258] bg-[#160f1ad5] px-2.5 py-1 text-[10px] text-[#f1c99f]">
      探索房间 · {known}/{items.length}
    </span>
  </div>;
}
