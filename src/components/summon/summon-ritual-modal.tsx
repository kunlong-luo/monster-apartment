'use client';

import {useEffect,useRef,useState} from 'react';
import type {KeyboardEvent} from 'react';
import {motion,useReducedMotion} from 'motion/react';
import {MoonStar} from 'lucide-react';
import {useGothicMotion} from '@/lib/game/gothic-motion';
import type {SummonableCharacter} from '@/lib/summon/gacha-engine';
import {SummonResultStage} from './summon-result-stage';
import './summon-result.css';

interface SummonRitualModalProps {
  characters:SummonableCharacter[];
  onClose:()=>void;
  onSummonAgain?:()=>void;
  onViewCollection?:()=>void;
}

/** One already-saved draw snapshot enters this presentation-only component.
 * State transitions and "skip" never call the gacha engine. */
export function SummonRitualModal({characters,onClose,onSummonAgain,onViewCollection}:SummonRitualModalProps){
  const [phase,setPhase]=useState<'ritual'|'reveal'>('ritual');
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
    if(phase!=='ritual')return;
    const timer=window.setTimeout(()=>setPhase('reveal'),still?0:1750);
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
    data-testid="collection-reveal"
    data-rarity={hasMythicSSR?'神话·月蚀':characters[0]?.rarityZh??'普通'}
    data-motion={still?'still':'animated'}
    className="summon-reveal-overlay">
    <div className="summon-reveal-overlay__ambient" aria-hidden="true"/>
    {phase==='ritual'?<motion.div className="summon-ritual-intro" data-testid="summon-ritual-intro"
        initial={still?false:{opacity:0,scale:.88}}
        animate={{opacity:1,scale:1}} transition={{duration:still?0:.5}}>
      <div className="summon-ritual-intro__seal" aria-hidden="true">
        <div className="summon-ritual-intro__orbit"/>
        <MoonStar size={86} strokeWidth={1.15}/>
      </div>
      <span>ANCIENT MOONLIT COVENANT</span>
      <h2>{hasMythicSSR?'月蚀共鸣 · 神话临世':'月影低语 · 契约缔结'}</h2>
      <p>古老契约正在苏醒</p>
      <button type="button" className="summon-ritual-intro__skip" onClick={()=>setPhase('reveal')}>
        跳过仪式
      </button>
    </motion.div>:
      <SummonResultStage characters={characters} still={still}
        onClose={onClose} onSummonAgain={onSummonAgain} onViewCollection={onViewCollection}/>}
  </div>;
}
