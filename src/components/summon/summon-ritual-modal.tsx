'use client';

import {useEffect,useRef,useState} from 'react';
import type {KeyboardEvent} from 'react';
import {useReducedMotion} from 'motion/react';
import {useGothicMotion} from '@/lib/game/gothic-motion';
import type {SummonableCharacter} from '@/lib/summon/gacha-engine';
import {nextRitualPhase,RITUAL_PHASE_DURATION,type RitualPhase} from '@/lib/summon/ritual-presentation';
import {SummonRitualSequence} from './summon-ritual-sequence';
import {SummonResultStage} from './summon-result-stage';
import './summon-result.css';
import './summon-ritual-cinematic.css';

interface SummonRitualModalProps {
  characters:SummonableCharacter[];
  onClose:()=>void;
  onSummonAgain?:()=>void;
  onViewCollection?:()=>void;
}

/** Presentation-only finite-state ritual: a draw is already persisted when mounted.
 * Skips, reduced motion and Escape cannot trigger new rolls or write storage. */
export function SummonRitualModal({characters,onClose,onSummonAgain,onViewCollection}:SummonRitualModalProps){
  const [phase,setPhase]=useState<RitualPhase>('charge');
  const ref=useRef<HTMLDivElement>(null);
  const prefersReduced=useReducedMotion();
  const gameMotion=useGothicMotion();
  const still=Boolean(prefersReduced||gameMotion.reduced);
  const hasMythicSSR=characters.some(c=>c.rarity==='SSR-Mythic');
  useEffect(()=>{
    const previous=document.activeElement;
    ref.current?.focus();
    return ()=>{if(previous instanceof HTMLElement&&previous.isConnected)previous.focus();};
  },[]);
  useEffect(()=>{
    if(phase==='reveal')return;
    // A reduced-motion user never waits for any cinematic segment.
    const timer=window.setTimeout(()=>setPhase(nextRitualPhase(phase)),
      still?0:RITUAL_PHASE_DURATION[phase]);
    return ()=>window.clearTimeout(timer);
  },[phase,still]);
  const handleKeyDown=(event:KeyboardEvent<HTMLDivElement>)=>{
    if(event.key==='Escape'){event.preventDefault();onClose();return;}
    if(event.key!=='Tab')return;
    const controls=Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])')??[]);
    if(!controls.length)return;
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){
      event.preventDefault();last.focus();
    }else if(!event.shiftKey&&document.activeElement===last){
      event.preventDefault();first.focus();
    }
  };
  return <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true"
    aria-label="契约召唤结果" onKeyDown={handleKeyDown}
    data-testid="collection-reveal" data-ritual-phase={phase}
    data-rarity={hasMythicSSR?'神话·月蚀':characters[0]?.rarityZh??'普通'}
    data-motion={still?'still':'animated'}
    className="summon-reveal-overlay">
    <div className="summon-reveal-overlay__ambient" aria-hidden="true"/>
    {phase==='reveal'?
      <SummonResultStage characters={characters} still={still}
        onClose={onClose} onSummonAgain={onSummonAgain} onViewCollection={onViewCollection}/>:
      <SummonRitualSequence phase={phase} characters={characters} still={still}
        onSkip={()=>setPhase('reveal')}/>}
  </div>;
}
