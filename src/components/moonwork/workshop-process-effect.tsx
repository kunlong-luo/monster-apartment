'use client';
import {motion} from 'motion/react';
import type {CSSProperties} from 'react';
import type {Craft} from '../../../v2/src/workshop-engine';

// Only a read-only cue for the real projected production state. No timers,
// randomness, economy changes, texture allocations or separate game state.
const CUES={
  well:{x:[0,3,0],y:[10,-10,-30],rotate:[0,0,0],duration:2.8},
  garden:{x:[-6,8,18],y:[8,-9,-20],rotate:[-18,30,60],duration:3.6},
  kiln:{x:[0,-12,10],y:[12,-15,-38],rotate:[0,70,135],duration:1.9},
} as const;
const POSITIONS=[{x:34,y:61},{x:51,y:70},{x:66,y:53}] as const;

export function WorkshopProcessEffect({craft,active,motionEnabled}:{
  craft:Craft;active:boolean;motionEnabled:boolean;
}){
  if(!active)return null;
  const cue=CUES[craft];
  return <span className="workshop-cinematic__process" aria-hidden="true"
    data-testid={'workshop-process-'+craft} data-process={craft}
    data-motion={motionEnabled?'running':'paused'}>
    {POSITIONS.map((p,i)=><motion.i key={i}
      className="workshop-cinematic__process-particle"
      style={{'--particle-x':p.x+'%','--particle-y':p.y+'%'} as CSSProperties}
      initial={false}
      animate={motionEnabled?{
        x:[...cue.x],y:[...cue.y],rotate:[...cue.rotate],opacity:[0,.65,0],
      }:{x:0,y:0,rotate:0,opacity:.38}}
      transition={motionEnabled?{duration:cue.duration,delay:i*.29,repeat:Infinity,ease:'easeInOut'}:{duration:0}}
    />)}
  </span>;
}
