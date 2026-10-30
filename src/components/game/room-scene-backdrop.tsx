'use client';

import Image from 'next/image';
import {useReducedMotion} from 'motion/react';
import {useGothicMotion} from '@/lib/game/gothic-motion';
import {ROOM_ART_MANIFEST,roomPublicAssetPath} from '@/core/room-art-manifest';
import {roomStoryLightTone} from '@/core/room-performance';
import type {RoomPose} from '@/core/room-performance';
import {usePageVisibility} from '@/lib/game/use-page-visibility';
import './gothic-polish.css';
import type {CharacterId} from '@/core/character-life';

/** Background and lighting never move the original painting: no image resampling
 * after returning from another route. Each room has its own ambient palette. */
const ROOM_AMBIENCE={
  yuesha:{
    veil:'bg-[linear-gradient(90deg,#150d23bd_0%,#27112735_51%,#170b21a6_100%)]',
    moon:'bg-[radial-gradient(ellipse_at_76%_14%,#b9a3ff45,transparent_49%)]',
    candle:'bg-[radial-gradient(ellipse_at_14%_67%,#ffc17a47,transparent_49%)]',
  },
  brook:{
    veil:'bg-[linear-gradient(90deg,#082d45d9,#0b3c5754_53%,#071627bb)]',
    moon:'bg-[radial-gradient(ellipse_at_75%_12%,#80d8ff4d,transparent_52%)]',
    candle:'bg-[radial-gradient(ellipse_at_15%_72%,#8ce1f343,transparent_49%)]',
  },
  fern:{
    veil:'bg-[linear-gradient(90deg,#102d25d9,#25533961_52%,#0a261bd6)]',
    moon:'bg-[radial-gradient(ellipse_at_75%_12%,#b2ffc04a,transparent_51%)]',
    candle:'bg-[radial-gradient(ellipse_at_13%_72%,#b6ec8e45,transparent_48%)]',
  },
  cinder:{
    veil:'bg-[linear-gradient(90deg,#381a18da,#66342164_54%,#211017d8)]',
    moon:'bg-[radial-gradient(ellipse_at_74%_12%,#ffc2893e,transparent_50%)]',
    candle:'bg-[radial-gradient(ellipse_at_15%_73%,#ff9b4b50,transparent_49%)]',
  },
} as const;

export function RoomSceneBackdrop({id,previewUrl=null,cinematicPose=null}:{
  id:CharacterId;previewUrl?:string|null;cinematicPose?:RoomPose|null;
}){
  const ambience=ROOM_AMBIENCE[id];
  const art=ROOM_ART_MANIFEST[id];
  // All four concept scenes have independent, environment-only vector art.
  // They are NOT the unreviewed future WebP production backgrounds.
  const fallbackCrop=art.composition==='architecture-crop'&&!previewUrl;
  const backgroundProduction=art.backgroundStatus==='production';
  const showHD=backgroundProduction||Boolean(previewUrl);
  const source=previewUrl??roomPublicAssetPath(backgroundProduction
    ?art.productionAssets.background:art.conceptPreview);
  const systemReduced=useReducedMotion();
  const {reduced:gameReduced}=useGothicMotion();
  const pageVisible=usePageVisibility();
  const still=Boolean(systemReduced||gameReduced||!pageVisible);
  const storyLight=roomStoryLightTone(cinematicPose);
  return <div data-testid="room-scene-backdrop" data-scene-id={id} data-art-quality={art.backgroundStatus} data-composition={art.composition}
    data-local-preview={previewUrl?'true':'false'}
    className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div data-testid="room-background-frame"
      className={fallbackCrop?'absolute inset-y-0 -left-[112%] w-[215%]':'absolute inset-0'}>
      <Image src={source} alt="" fill unoptimized priority={id==='yuesha'}
        sizes={fallbackCrop?'(max-width:1024px) 180vw, 1750px':'(max-width:1024px) 94vw, 850px'}
        className={fallbackCrop?'object-cover object-right':(backgroundProduction||previewUrl)?'object-cover object-center':'object-cover object-[18%_43%]'} />
    </div>
    <div className={'absolute inset-0 '+(showHD
      ?'bg-[linear-gradient(90deg,#130b1a4a_0%,transparent_55%,#130b1a56_100%)]'
      :ambience.veil)}/>
    <div className={'absolute inset-0 '+ambience.moon}/>
    <div className={'private-room__moonshaft absolute inset-0 mix-blend-screen '+(still?'private-room__still':'')}/>
    <div className={'private-room__motes absolute inset-0 '+(still?'private-room__still':'')}/>
    <div data-testid="room-environment-light"
      className={'private-room__candlelight absolute inset-0 mix-blend-screen motion-reduce:animate-none '+(still?' private-room__still ':' ')+ambience.candle}/>
    <div data-testid="room-story-light" data-story-light={storyLight}
      data-motion={still?'still':'playing'}
      className="private-room__story-light absolute inset-0" aria-hidden="true">
      <div className="private-room__story-light--attentive absolute inset-0"/>
      <div className="private-room__story-light--warm absolute inset-0"/>
      <div className="private-room__story-light--guarded absolute inset-0"/>
    </div>
    <div className="absolute inset-0 bg-[linear-gradient(0deg,#0f091be5_0%,transparent_29%,transparent_78%,#0c07168c_100%)]"/>
    <div className="absolute inset-[9px] rounded-[8px] border border-[#f5c99124] shadow-[inset_0_0_40px_#f8be6c0e]"/>
  </div>;
}
