'use client';

import Image from 'next/image';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import moonveilBust from '../../../public/art/yuesha-bust-v3.webp';
import type {CharacterId,WorkerCharacterId} from '@/core/character-life';
import {WorkerArtwork} from '@/components/moonwork/worker-artwork';

/** The resident is independently animated; background pixels are never scaled.
 * A worker on shift is never duplicated in their private room. */
export function RoomResidentSprite({id,name,working=false,reaction=''}:{
  id:CharacterId;name:string;working?:boolean;reaction?:string;
}){
  const reduced=useReducedMotion();
  const away=working&&id!=='yuesha';
  return <div className="pointer-events-none absolute inset-0 z-[2]"
    data-testid="room-resident-layer">
    {away?<div data-testid={'room-resident-away-'+id}
      className="absolute right-[5%] bottom-[27%] w-[45%] max-w-56 rounded-lg border border-[#efd4aa66] bg-[#170e19e8] p-3 text-center shadow-[0_9px_25px_#000a]">
      <span aria-hidden="true" className="block text-2xl text-[#f5cc8a]">✉</span>
      <p className="mt-1 text-xs text-[#ffe4c0]">{name}正在工坊值守</p>
      <p className="mt-1 text-[11px] leading-5 text-[#d8bea9]">桌上留有便条；等值守结束后再当面交谈。</p>
    </div>:<motion.div data-testid={'room-resident-present-'+id}
      className="absolute right-[2%] bottom-0 h-[94%] w-[49%] max-w-[410px] origin-bottom"
      initial={false}
      animate={reduced?undefined:{y:[0,-3,0,2,0]}}
      transition={{duration:7,ease:'easeInOut',repeat:Infinity}}>
      {id==='yuesha'
        ?<Image src={moonveilBust} alt={name+'在会客室中'} fill unoptimized draggable={false}
          sizes="(max-width:640px) 49vw, 410px"
          className="object-contain object-bottom drop-shadow-[0_12px_22px_#000b]"/>
        :<WorkerArtwork id={id as WorkerCharacterId} name={name}/>}
    </motion.div>}
    <AnimatePresence mode="wait">
      {!away&&reaction&&<motion.p key={reaction} data-testid="room-resident-reaction"
        initial={reduced?false:{opacity:0,y:8}}
        animate={{opacity:1,y:0}} exit={{opacity:0}}
        transition={{duration:reduced?0:.24}}
        className="absolute right-[3%] bottom-[8%] z-[3] max-w-[43%] rounded-lg border border-[#f8d1a58a] bg-[#25131edb] px-2.5 py-2 text-[11px] leading-5 text-[#ffe3c2] shadow-[0_7px_22px_#0009] backdrop-blur-sm"
      >{reaction}</motion.p>}
    </AnimatePresence>
  </div>;
}
