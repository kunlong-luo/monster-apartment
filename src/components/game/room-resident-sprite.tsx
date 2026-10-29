'use client';

import Image from 'next/image';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import moonveilBust from '../../../public/art/yuesha-bust-v3.webp';
import type {CharacterId,WorkerCharacterId} from '@/core/character-life';
import {WorkerArtwork} from '@/components/moonwork/worker-artwork';
import type {RoomPose} from '@/core/room-performance';
import {useGothicMotion} from '@/lib/game/gothic-motion';
import {ROOM_ART_MANIFEST,roomPublicAssetPath} from '@/core/room-art-manifest';

/** The resident is independently animated; background pixels are never scaled.
 * A worker on shift is never duplicated in their private room. */
export function RoomResidentSprite({id,name,working=false,reaction='',pose='idle',previewBackground=false}:{
  id:CharacterId;name:string;working?:boolean;reaction?:string;pose?:RoomPose;previewBackground?:boolean;
}){
  const systemReduced=useReducedMotion();
  const {reduced:gameReduced}=useGothicMotion();
  const reduced=Boolean(systemReduced||gameReduced);
  const performerMotion=reduced?{x:0,y:0,rotate:0}:
    pose==='idle'?{x:0,y:[0,-3,0,2,0],rotate:0}:
    pose==='attentive'?{x:-3,y:-3,rotate:-.5}:
    pose==='warm'?{x:-1,y:-2,rotate:.6}:
    {x:2,y:1,rotate:.7};
  const art=ROOM_ART_MANIFEST[id];
  const away=working&&id!=='yuesha';
  // Never duplicate a painted resident; the current four room scenes are
  // actor-free concept artwork and can use their own separately composited resident.
  const embedded=!away&&art.composition==='embedded-resident';
  const production=art.residentStatus==='production';
  const frame=art.productionAssets.residentFrames[
    {idle:0,attentive:1,warm:2,guarded:3}[pose]
  ];
  return <div className="pointer-events-none absolute inset-0 z-[2]"
    data-testid="room-resident-layer" data-art-quality={art.residentStatus} data-pose={away?"away":pose}
    data-render-mode={away?'away':embedded?'embedded':'separate'}>
    {away?<div data-testid={'room-resident-away-'+id}
      className="absolute right-[5%] bottom-[27%] w-[45%] max-w-56 rounded-lg border border-[#efd4aa66] bg-[#170e19e8] p-3 text-center shadow-[0_9px_25px_#000a]">
      <span aria-hidden="true" className="block text-2xl text-[#f5cc8a]">✉</span>
      <p className="mt-1 text-xs text-[#ffe4c0]">{name}正在工坊值守</p>
      <p className="mt-1 text-[11px] leading-5 text-[#d8bea9]">桌上留有便条；等值守结束后再当面交谈。</p>
    </div>:embedded?<span className="sr-only" data-testid={'room-resident-embedded-'+id}>
      {name}已绘制在概念背景中，暂不重复叠加不透明立绘
    </span>:<motion.div data-testid={'room-resident-present-'+id}
      className={'absolute bottom-0 h-[94%] w-[49%] max-w-[410px] origin-bottom '+
        ((art.backgroundStatus==='production'||previewBackground)?'left-[2%]':'right-[2%]')}
      initial={false}
      animate={performerMotion}
      transition={reduced?{duration:0}:pose==='idle'?{duration:7,ease:'easeInOut',repeat:Infinity}:{duration:.48,ease:'easeOut'}}>
      {production
        ?<Image src={roomPublicAssetPath(frame)} alt={name+'在会客室中'} fill unoptimized draggable={false}
          sizes="(max-width:640px) 49vw, 410px"
          className="object-contain object-bottom drop-shadow-[0_12px_22px_#000b]"/>
        :id==='yuesha'
        ?<Image src={moonveilBust} alt={name+'在会客室中'} fill unoptimized draggable={false}
          sizes="(max-width:640px) 49vw, 410px"
          className="object-contain object-bottom drop-shadow-[0_12px_22px_#000b] [mask-image:radial-gradient(ellipse_52%_70%_at_55%_54%,black_48%,transparent_100%)]"/>
        :<WorkerArtwork id={id as WorkerCharacterId} name={name}/>}
    </motion.div>}
    <AnimatePresence mode="wait">
      {!away&&reaction&&<motion.p key={reaction} data-testid="room-resident-reaction"
        initial={reduced?false:{opacity:0,y:8}}
        animate={{opacity:1,y:0}} exit={{opacity:0}}
        transition={{duration:reduced?0:.24}}
        className={'absolute bottom-[8%] z-[3] max-w-[43%] rounded-lg border border-[#f8d1a58a] bg-[#25131edb] px-2.5 py-2 text-[11px] leading-5 text-[#ffe3c2] shadow-[0_7px_22px_#0009] backdrop-blur-sm '+
          ((art.backgroundStatus==='production'||previewBackground)?'left-[3%]':'right-[3%]')}
      >{reaction}</motion.p>}
    </AnimatePresence>
  </div>;
}
