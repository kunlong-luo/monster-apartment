'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {dialogueBeatDuration,dialogueBeats,roomDialogueBeatPose} from '@/core/room-performance';
import type {RoomPose} from '@/core/room-performance';
import {useGothicMotion} from '@/lib/game/gothic-motion';
import {usePageVisibility} from '@/lib/game/use-page-visibility';

/** A small auto-advancing cinematic overlay inside the existing room stage.
 * Progress is ephemeral and never interrupts or edits the first-visit save. */
export function RoomDialogueTheater({name,title,response,onClose,basePose='warm',onBeatPose}:{
  name:string;title:string;response:string;onClose:()=>void;
  basePose?:RoomPose;onBeatPose?:(pose:RoomPose)=>void;
}){
  const beats=useMemo(()=>dialogueBeats(response),[response]);
  const [index,setIndex]=useState(0);
  const pageVisible=usePageVisibility();
  const {reduced:gameReduced}=useGothicMotion();
  const systemReduced=useReducedMotion();
  const still=Boolean(gameReduced||systemReduced);
  const finished=still||index===beats.length-1;
  const currentBeat=still?Math.max(0,beats.length-1):index;
  const beatPose=roomDialogueBeatPose(basePose,currentBeat,beats.length);
  // Keep notifications tied to actual beat changes, not to the callback
  // identity when the parent rerenders for its own story/reaction updates.
  const poseNotification=useRef(onBeatPose);
  useEffect(()=>{
    poseNotification.current=onBeatPose;
  },[onBeatPose]);
  useEffect(()=>{
    poseNotification.current?.(beatPose);
  },[beatPose]);
  useEffect(()=>{
    if(still||finished||!pageVisible||beats.length===0)return;
    const clock=window.setTimeout(()=>{
      setIndex(current=>Math.min(current+1,beats.length-1));
    },dialogueBeatDuration(beats[index]));
    return ()=>window.clearTimeout(clock);
  },[index,beats,still,finished,pageVisible]);

  const displayed=still?beats.join(''):beats.slice(0,index+1).join('');
  return <section data-testid="room-dialogue-theater" data-state={finished?'finished':'playing'}
    data-beat-pose={beatPose}
    role="region" aria-label={name+'的剧情演出'}
    onKeyDown={event=>{
      if(event.key==='Escape'){event.stopPropagation();onClose();}
      if(event.key===' '&&event.target===event.currentTarget){
        event.preventDefault();
        setIndex(beats.length-1);
      }
    }}
    className="pointer-events-auto absolute inset-0 z-[16] flex flex-col justify-end overflow-hidden bg-[linear-gradient(180deg,transparent_0%,#0c071422_38%,#0b0618e7_82%,#090415f7_100%)] p-3 text-[#ffe7cf] sm:p-6">
    <header className="absolute inset-x-3 top-3 flex items-start justify-between gap-4 sm:inset-x-6 sm:top-6">
      <div className="max-w-[65%] rounded-lg border border-[#c99e7350] bg-[#1a1020b9] px-2 py-1 shadow-[0_6px_22px_#0007] sm:px-3 sm:py-2">
        <span className="text-[10px] tracking-[.18em] text-[#ffcc94]">MOONLIT MEMORY</span>
        <h3 className="mt-1 text-sm text-[#ffe4be] sm:text-lg">{title}</h3>
      </div>
      <button type="button" onClick={onClose} data-testid="room-theater-close"
        className="min-h-11 rounded-lg border border-[#e9ba8a84] bg-[#261725ed] px-3 text-xs hover:border-[#ffe0b5] focus-visible:outline-2 focus-visible:outline-[#ffe0b5]">
        返回房间
      </button>
    </header>
    <div className="mx-auto w-full max-w-[min(100%,670px)]">
      <p className="text-[10px] tracking-[.16em] text-[#f5cb97]">{name} · 私室回忆</p>
      <AnimatePresence mode="wait">
        <motion.p key={still?'still':index} role="status" aria-live="polite"
          data-testid="room-theater-line"
          initial={still?false:{opacity:0,y:7}}
          animate={{opacity:1,y:0}} exit={still?{opacity:0}:{opacity:0,y:-5}}
          transition={{duration:still?0:.27}}
          className="mt-2 min-h-16 rounded-lg border border-[#ddb4846c] bg-[#180c1be8] px-3 py-3 text-sm leading-7 shadow-[0_12px_38px_#000b] sm:px-5 sm:text-base">
          {displayed}
        </motion.p>
      </AnimatePresence>
      <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-[#ebc99c]">
        <span data-testid="room-theater-progress" className="tabular-nums">
          {Math.min(still?beats.length:index+1,beats.length)} / {beats.length}
          {' · '}{finished?'本段已播完':'自动演出中'}
        </span>
        {!finished&&<button type="button" onClick={()=>setIndex(beats.length-1)}
          data-testid="room-theater-skip"
          className="min-h-10 rounded-lg border border-[#e7bd968c] bg-[#4e2b40] px-3 text-xs hover:border-[#ffe5bf] focus-visible:outline-2 focus-visible:outline-[#ffe5bf]">
          跳过演出
        </button>}
      </div>
    </div>
  </section>;
}
