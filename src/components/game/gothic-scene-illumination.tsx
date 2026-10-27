'use client';

import {motion} from 'motion/react';
import {useSyncExternalStore} from 'react';
import {useGothicMotion} from '@/lib/game/gothic-motion';

const REDUCED_MOTION='(prefers-reduced-motion: reduce)';
function subscribeReducedMotion(callback:()=>void){
  const media=window.matchMedia(REDUCED_MOTION);
  media.addEventListener('change',callback);
  return ()=>media.removeEventListener('change',callback);
}
const browserReducedMotion=()=>window.matchMedia(REDUCED_MOTION).matches;
const serverReducedMotion=()=>false;

/** Atmospheric lighting stays separate from the full-resolution painting.
 * The entire layer is decorative, hit-test transparent and motion-aware. */
export function GothicSceneIllumination({
  variant,paused=false
}:{
  variant:'lobby'|'apartment';
  paused?:boolean;
}){
  const {reduced}=useGothicMotion();
  // Observe live operating-system/browser preference changes. Motion's
  // module-level media snapshot may be stale in client-side route tests.
  const prefersReduced=useSyncExternalStore(
    subscribeReducedMotion,browserReducedMotion,serverReducedMotion
  );
  const still=Boolean(paused||reduced||prefersReduced);
  const left=still?{opacity:.37,scale:1}:{opacity:[.32,.52,.32],scale:[1,1.035,1]};
  const right=still?{opacity:.31,scale:1}:{opacity:[.29,.46,.29],scale:[1,1.025,1]};
  return <div aria-hidden="true" data-testid="gothic-scene-illumination"
    data-variant={variant} data-motion={still?'still':'ambient'}
    className={'gothic-scene-illumination gothic-scene-illumination--'+variant}>
    <div className="gothic-scene-illumination__tracery"/>
    <div className="gothic-scene-illumination__moonshaft"/>
    <motion.div className="gothic-scene-illumination__candle gothic-scene-illumination__candle--left"
      initial={false} animate={left}
      transition={still?{duration:0}:{duration:7.5,repeat:Infinity,ease:'easeInOut'}}/>
    <motion.div className="gothic-scene-illumination__candle gothic-scene-illumination__candle--right"
      initial={false} animate={right}
      transition={still?{duration:0}:{duration:9.2,repeat:Infinity,ease:'easeInOut',delay:1.5}}/>
  </div>;
}
