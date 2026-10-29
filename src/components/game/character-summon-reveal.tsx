'use client';
import {useEffect,useRef} from 'react';
import Image from 'next/image';
import {motion,useReducedMotion} from 'motion/react';
import {CHARACTER_CARDS,characterPotentialTier} from '@/core/character-collection';
import type {CardKey} from '@/core/character-collection';
import {CHARACTER_PROFILES} from '@/core/character-life';
import {WorkerArtwork} from '@/components/moonwork/worker-artwork';
import {useGothicMotion} from '@/lib/game/gothic-motion';
import {useCharacterCollection} from '@/lib/game/character-collection-store';
import moonveilPortrait from '../../../public/art/yuesha-portrait-v3.webp';

const swatches:Record<number,{glow:string;border:string;background:string}>={
  1:{glow:'#adbbc9',border:'#93a8bb',background:'#2d3c4f'},
  2:{glow:'#7cc7ff',border:'#88c9e6',background:'#183a52'},
  3:{glow:'#d39cf9',border:'#bd84e6',background:'#3f2357'},
  4:{glow:'#fbd487',border:'#e7ba65',background:'#523317'},
  5:{glow:'#ff7185',border:'#ff526f',background:'#5d0d2b'},
};
export function CharacterSummonReveal({cardKey,duplicate,onClose}:{
  cardKey:CardKey;duplicate:boolean;onClose:()=>void;
}){
  const card=CHARACTER_CARDS.find(item=>item.key===cardKey)!;
  const theme=swatches[card.tier];
  const close=useRef<HTMLButtonElement>(null);
  const {reduced}=useGothicMotion();
  const systemReduced=useReducedMotion();
  const still=Boolean(reduced||systemReduced);
  const {collection}=useCharacterCollection();
  const potential=characterPotentialTier(card.character,collection);
  useEffect(()=>{
    close.current?.focus();
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();onClose();}
      if(event.key==='Tab'){event.preventDefault();close.current?.focus();}
    };
    window.addEventListener('keydown',key);
    return ()=>window.removeEventListener('keydown',key);
  },[onClose]);
  return <motion.div role="dialog" aria-modal="true" aria-label="契约召唤结果"
    data-testid="collection-reveal" data-rarity={card.rarity} data-motion={still?'still':'animated'}
    initial={still?false:{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
    transition={{duration:still?0:.25}}
    className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#08040be9] p-3 backdrop-blur-md sm:p-6"
    onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
    <motion.div initial={still?false:{opacity:0,y:45,scale:.8,rotateY:-13}}
      animate={{opacity:1,y:0,scale:1,rotateY:0}}
      exit={{opacity:0,scale:.95}}
      transition={{duration:still?0:(card.tier===5?.85:.55),ease:'easeOut'}}
      className="relative flex w-full max-w-[380px] flex-col items-center overflow-hidden rounded-2xl border-2 p-4 text-center shadow-[0_25px_90px_#000b] sm:p-6"
      style={{borderColor:theme.border,
        background:'radial-gradient(ellipse at 50% 19%, '+theme.background+' 0%, #1b0e1f 68%)',
        boxShadow:'0 0 65px '+theme.glow+'55, 0 20px 70px #000b'}}>
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0"
        initial={still?false:{opacity:0,scale:.7}}
        animate={{opacity:.55,scale:1}}
        transition={{duration:still?0:1.1}}
        style={{background:'radial-gradient(circle at 50% 33%, '+theme.glow+'55, transparent 59%)'}}/>
      <p className="relative text-[10px] tracking-[.23em] text-[#ffe2bf]">MOONLIT CONTRACT</p>
      <div className="relative my-4 grid size-[clamp(170px,54vw,235px)] place-items-center overflow-hidden rounded-full border-2"
        style={{borderColor:theme.border,boxShadow:'0 0 32px '+theme.glow+'55'}}>
        <div className="absolute inset-0 bg-[#2c2039]"/>
        {card.character==='yuesha'?<Image src={moonveilPortrait} fill unoptimized sizes="235px" alt="月纱的现有角色肖像"
          className="object-cover object-top"/>:
          <WorkerArtwork id={card.character} name={CHARACTER_PROFILES[card.character].name}/>}
      </div>
      <p className="relative mb-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-[.13em]"
        style={{borderColor:theme.border,color:theme.glow}} data-testid="collection-reveal-rarity">
        {card.tier===5?'☾ 红色 · 神话·月蚀':card.rarity}
      </p>
      <h3 className="relative mt-1 text-xl font-semibold leading-relaxed text-[#ffecd0]"
        data-testid="collection-reveal-name">{card.title}</h3>
      <p className="relative mt-2 text-xs leading-5 text-[#ddc7b4]">
        {duplicate?'重复契约转化为更多锻造碎片。':'新的珍藏契约已永久收录。'}
      </p>
      <p className="relative mt-1 text-[11px] text-[#d5b69d]">角色最高潜力：{potential} 阶 · 擅长能力 +{potential*2}</p>
      <button ref={close} onClick={onClose} type="button" data-testid="collection-reveal-close"
        className="relative mt-5 min-h-11 w-full rounded-lg border border-[#e5be8e] bg-[#59304b] px-4 text-sm font-bold text-[#fff0d7] hover:bg-[#713e5a] focus-visible:outline-2 focus-visible:outline-[#ffe6bd]">
        收下契约 · 返回图鉴
      </button>
    </motion.div>
  </motion.div>;
}
