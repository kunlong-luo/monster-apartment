'use client';

import {ChevronLeft,ChevronRight,Image as ImageIcon} from 'lucide-react';
import {motion} from 'motion/react';
import {ReliableImage} from '@/components/game/reliable-image';
import {
  getCardFace,getCardPortraitFallback,getCollectibleCardArt,
} from '@/components/summon/heroine-portrait-assets';
import {CHARACTER_CARDS} from '@/core/character-collection';
import type {CardKey} from '@/core/character-collection';

type GalleryCard=(typeof CHARACTER_CARDS)[number];

/** Artwork-only viewer. Every painting comes from the audited character
 * registry; no statistics, buttons or labels are baked into the artwork. */
export function CharacterGalleryArtwork({
  cards,selectedKey,onSelect,collectedKeys,reducedMotion,
}:{
  cards:readonly GalleryCard[];
  selectedKey:CardKey;
  onSelect:(key:CardKey)=>void;
  collectedKeys:readonly CardKey[];
  reducedMotion:boolean;
}){
  const activeIndex=cards.findIndex(card=>card.key===selectedKey);
  const active=cards[activeIndex]??cards[0];
  const source=getCardFace(active.key,'feature');
  const hasFigureArt=Boolean(getCollectibleCardArt(active.key));
  const owned=collectedKeys.includes(active.key);
  const change=(delta:number)=>{
    const next=(activeIndex+delta+cards.length)%cards.length;
    onSelect(cards[next].key);
  };

  return <section className="cg-art-view" data-testid="a05-art-viewer"
    aria-label="人物画作鉴赏" onKeyDown={event=>{
      if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
      event.preventDefault();
      event.stopPropagation();
      change(event.key==='ArrowRight'?1:-1);
    }}>
    <div className="cg-art-view__stage" data-art-kind={hasFigureArt?'figure':'portrait'}>
      <motion.div key={active.key} className="cg-art-view__painting"
        initial={reducedMotion?false:{opacity:0,scale:1.025}}
        animate={{opacity:1,scale:1}}
        transition={{duration:reducedMotion?0:.25,ease:'easeOut'}}>
        {source&&<ReliableImage src={source}
          fallbackSrc={getCardPortraitFallback(active.key)??undefined}
          alt={active.title+'人物画作'} fill unoptimized priority
          sizes="(max-width:800px) 92vw, 70vw"
          className="cg-art-view__photo"/>}
      </motion.div>
      <span className="cg-art-view__stage-ornament" aria-hidden="true"/>
    </div>
    <aside className="cg-art-view__side">
      <div className="cg-art-view__heading" aria-live="polite" aria-atomic="true">
        <small>MONSTER APARTMENT · A05</small>
        <h2>{active.title}</h2>
        <p>{hasFigureArt?'契约插画鉴赏':'角色肖像鉴赏'} · {owned?'已收录':'尚未收录'}</p>
        <p className="cg-art-view__disclaimer">
          {hasFigureArt?'展示当前契约候选画稿':'显示角色已登记肖像，不以头像冒充全身原画'}
        </p>
      </div>
      <div className="cg-art-view__navigation">
        <button type="button" aria-label="上一张人物画作" onClick={()=>change(-1)}>
          <ChevronLeft size={21}/><span>上一张</span>
        </button>
        <span className="cg-art-view__counter">{activeIndex+1} / {cards.length}</span>
        <button type="button" aria-label="下一张人物画作" onClick={()=>change(1)}>
          <span>下一张</span><ChevronRight size={21}/>
        </button>
      </div>
      <div className="cg-art-view__filmstrip" role="group" aria-label="选择人物画作">
        {cards.map(card=>{
          const face=getCardFace(card.key,'thumbnail');
          return <button type="button" key={card.key}
            className={'cg-art-view__thumb'+(card.key===active.key?' cg-art-view__thumb--active':'')}
            aria-label={'查看'+card.title+'画作'}
            aria-pressed={card.key===active.key}
            onClick={()=>onSelect(card.key)}>
            <span className="cg-art-view__thumb-image">
              {face&&<ReliableImage src={face}
                fallbackSrc={getCardPortraitFallback(card.key)??undefined}
                alt="" fill unoptimized sizes="80px" className="object-cover"/>}
            </span>
            <span>{card.title}</span>
            {getCollectibleCardArt(card.key)&&<ImageIcon size={14} aria-hidden="true"/>}
          </button>;
        })}
      </div>
    </aside>
  </section>;
}
