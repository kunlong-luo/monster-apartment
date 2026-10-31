'use client';

import type {CSSProperties} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import type {CharacterId,RoomObjectId} from '@/core/character-life';
import type {RoomPose} from '@/core/room-performance';
import type {RoomStageSize} from '@/core/room-stage-layout';
import {roomSceneFocus} from '@/core/room-scene-focus';
import {useGothicMotion} from '@/lib/game/gothic-motion';

/** Non-interactive scene acting cue. It never replaces real physical props,
 * blocks touch targets, or transforms/rasterizes the background painting. */
export function RoomSceneFocus({id,item,pose,stageSize=null,preview=false,scenic=false}:{
  id:CharacterId;item:RoomObjectId|null;pose:RoomPose;stageSize?:RoomStageSize|null;preview?:boolean;scenic?:boolean;
}){
  const systemReduced=useReducedMotion();
  const {reduced:gameReduced}=useGothicMotion();
  const still=Boolean(systemReduced||gameReduced);
  const style=item?roomSceneFocus(id,item,pose,stageSize,preview):null;
  return <div data-testid="room-focus-layer"
    className={"pointer-events-none absolute inset-0 z-[3] overflow-hidden"+(scenic?" lg:hidden":"")} aria-hidden="true">
    <AnimatePresence mode="wait">
      {item&&style&&<motion.div key={id+'-'+item}
        data-testid="room-scene-focus" data-object-id={item} data-focus-pose={pose}
        initial={still?false:{opacity:0}}
        animate={{opacity:1}} exit={{opacity:0}}
        transition={{duration:still?0:.32,ease:'easeOut'}}
        className="pointer-events-none absolute inset-0"
        style={{background:style.background}}>
        <div className="absolute size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border motion-reduce:transition-none sm:size-[84px]"
          style={{left:style.left,top:style.top,borderColor:style.edge,
            boxShadow:'0 0 30px 5px '+style.tint+', inset 0 0 18px '+style.tint} as CSSProperties}/>
      </motion.div>}
    </AnimatePresence>
  </div>;
}
