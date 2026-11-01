'use client';

import {useEffect,useReducer} from 'react';
import type {GachaRarity} from '@/lib/summon/gacha-engine';
import {getNextUnrevealedIndex,getTenPullHoldMs,TEN_PULL_FIRST_REVEAL_MS,
  initialTenPullPlayback,reduceTenPullPlayback} from '@/lib/summon/ten-pull-playback';

/** Reveal navigation only. No access to gacha currency, RNG or localStorage. */
export function useTenPullPlayback(rarities:readonly GachaRarity[],still:boolean,bestIndex:number){
  const count=rarities.length;
  const rarityKey=rarities.join('|');
  const multi=count>1;
  const [state,dispatch]=useReducer(reduceTenPullPlayback,
    {count,still,bestIndex},args=>initialTenPullPlayback(args.count,args.still,args.bestIndex));
  const {revealedIndices,selectedIndex,playback}=state;
  const allRevealed=revealedIndices.length===count;

  // Reduced-motion can change while an animated ten-pull is already open.
  // Always cancel the old autoplay timer and expose the entire saved result.
  useEffect(()=>{
    if(!still||!multi||playback==='complete')return;
    const timer=window.setTimeout(()=>dispatch({type:'reveal-all',count,bestIndex}),0);
    return ()=>window.clearTimeout(timer);
  },[still,multi,playback,count,bestIndex]);

  useEffect(()=>{
    if(!multi||still||playback!=='playing')return;
    const selectedRarity=rarityKey.split('|')[selectedIndex] as GachaRarity;
    const duration=allRevealed?getTenPullHoldMs(selectedRarity):
      revealedIndices.length===0?TEN_PULL_FIRST_REVEAL_MS:getTenPullHoldMs(selectedRarity);
    const timer=window.setTimeout(()=>dispatch(allRevealed
      ?{type:'complete',count,bestIndex}:{type:'advance',count}),duration);
    return ()=>window.clearTimeout(timer);
  },[multi,still,playback,allRevealed,rarityKey,selectedIndex,revealedIndices.length,count,bestIndex]);

  return {
    ...state,allRevealed,
    select:(index:number)=>dispatch({type:'select',count,index}),
    revealAll:()=>dispatch({type:'reveal-all',count,bestIndex}),
    replay:()=>dispatch({type:'replay'}),
    pause:()=>dispatch({type:'pause'}),
    resume:()=>dispatch({type:'resume',count}),
  };
}
