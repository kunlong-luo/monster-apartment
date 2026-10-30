'use client';

import Image from 'next/image';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import moonveilBust from '../../../public/art/yuesha-bust-v3.webp';
import type {CharacterId,WorkerCharacterId} from '@/core/character-life';
import {HEROINE_FACE_ART} from '@/components/summon/heroine-portrait-assets';
import type {RoomPose} from '@/core/room-performance';
import {useGothicMotion} from '@/lib/game/gothic-motion';
import {ROOM_ART_MANIFEST,roomPublicAssetPath} from '@/core/room-art-manifest';

/** The resident is independently animated; background pixels are never scaled.
 * A worker on shift is never duplicated in their private room. */
export function RoomResidentSprite({id,name,working=false,reaction='',pose='idle',previewBackground=false,previewPoseUrl=null}:{
  id:CharacterId;name:string;working?:boolean;reaction?:string;pose?:RoomPose;previewBackground?:boolean;previewPoseUrl?:string|null;
}){
  const systemReduced=useReducedMotion();
  const {reduced:gameReduced}=useGothicMotion();
  const reduced=Boolean(systemReduced||gameReduced);
  const art=ROOM_ART_MANIFEST[id];
  // The concept display uses distinct approved face crops for worker identities.
  // They are not full-body sprites or transparent production poses.
  // A candidate performer may be inspected while their real worker remains on
  // shift, but only while the ephemeral local WebP review URL exists.
  const reviewPerformer=Boolean(previewPoseUrl);
  const away=working&&id!=='yuesha'&&!reviewPerformer;
  // Never duplicate a painted resident; the current four room scenes are
  // actor-free concept artwork and can use their own separately composited resident.
  const embedded=!away&&art.composition==='embedded-resident';
  const production=art.residentStatus==='production';
  // Four actual rendered poses already include body language and a measured
  // floor anchor. Do not additionally translate or rotate those painted feet.
  const stableArtwork=production||reviewPerformer;
  const performerMotion=reduced||stableArtwork?{x:0,y:0,rotate:0}:
    pose==='idle'?{x:0,y:[0,-3,0,2,0],rotate:0}:
    pose==='attentive'?{x:-3,y:-3,rotate:-.5}:
    pose==='warm'?{x:-1,y:-2,rotate:.6}:
    {x:2,y:1,rotate:.7};
  const frame=art.productionAssets.residentFrames[
    {idle:0,attentive:1,warm:2,guarded:3}[pose]
  ];
  return <div className="pointer-events-none absolute inset-0 z-[2]"
    data-testid="room-resident-layer" data-art-quality={art.residentStatus} data-pose={away?"away":pose}
    data-render-mode={away?'away':embedded?'embedded':'separate'}
    data-review-performer={reviewPerformer?'true':'false'} data-local-pose-preview={Boolean(previewPoseUrl)}>
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
      transition={reduced||stableArtwork?{duration:0}:pose==='idle'?{duration:7,ease:'easeInOut',repeat:Infinity}:{duration:.48,ease:'easeOut'}}>
      {previewPoseUrl||production
        ?<AnimatePresence initial={false} mode="sync">
          <motion.div key={previewPoseUrl??frame} data-testid="room-portrait-frame"
            className="pointer-events-none absolute inset-0"
            initial={reduced?false:{opacity:0}}
            animate={{opacity:1}} exit={{opacity:0}}
            transition={{duration:reduced?0:.24,ease:'easeOut'}}>
            <Image src={previewPoseUrl??roomPublicAssetPath(frame)}
              alt={previewPoseUrl?name+'的本地透明立绘候选，仅供审核，真实排班未改变':name+'在私人房间中'}
              fill unoptimized draggable={false} sizes="(max-width:640px) 49vw, 410px"
              className="object-contain object-bottom drop-shadow-[0_12px_22px_#000b]"/>
          </motion.div>
        </AnimatePresence>
        :id==='yuesha'
        ?<Image src={moonveilBust} alt={name+'在会客室中'} fill unoptimized draggable={false}
          sizes="(max-width:640px) 49vw, 410px"
          className="object-contain object-bottom drop-shadow-[0_12px_22px_#000b] [mask-image:radial-gradient(ellipse_52%_70%_at_55%_54%,black_48%,transparent_100%)]"/>
        :<div className="room-portrait-cameo absolute inset-x-0 bottom-[2%] top-[8%]"
          data-testid={'room-portrait-cameo-'+id}
          data-art-source="distinct-approved-face-crop-not-production-sprite">
          <div aria-hidden="true" className="pointer-events-none absolute inset-[5%_8%_8%] rounded-full bg-[radial-gradient(ellipse_at_center,#e8c18a28_0%,#b58a8950_30%,transparent_70%)] blur-[22px]"/>
          <Image src={HEROINE_FACE_ART[id as WorkerCharacterId]}
            alt={name+'的独立精绘肖像（正式透明立绘待制作）'}
            fill unoptimized draggable={false}
            sizes="(max-width:640px) 48vw, (max-width:1100px) 38vw, 410px"
            className="object-cover object-[center_20%] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black_35%,transparent_98%)] drop-shadow-[0_10px_24px_#000a]"/>
        </div>}
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
