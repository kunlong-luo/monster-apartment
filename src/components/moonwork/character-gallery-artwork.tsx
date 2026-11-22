'use client';

import {ChevronLeft,ChevronRight,Image as ImageIcon} from 'lucide-react';
import {motion} from 'motion/react';
import {useState} from 'react';
import type {CSSProperties} from 'react';
import {ReliableImage} from '@/components/game/reliable-image';
import {
  getCardFace,getCardPortraitFallback,getCardArtTier,artworkPixelBudget,
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
  const artTier=getCardArtTier(active.key);
  const hasFigureArt=artTier!=='portrait';
  const [loaded,setLoaded]=useState<{
    key:CardKey;width:number;height:number;dpr:number;
  }|null>(null);
  const sourcePixels=loaded?.key===active.key?loaded:null;
  const staticPortrait=!hasFigureArt&&source&&typeof source!=='string'?source:null;
  const budget=sourcePixels
    ?artworkPixelBudget(sourcePixels.width,sourcePixels.height,sourcePixels.dpr)
    :staticPortrait?artworkPixelBudget(staticPortrait.width,staticPortrait.height)
    :null;
  // 3:4 review previews are not promoted CG. Display all actual pixels at
  // contain and cap BOTH axes to native resolution/DPR, even if Next falls
  // back to the smaller identity portrait on an image load failure.
  const paintingStyle={
    '--cg-portrait-width':(budget?.width??256)+'px',
    '--cg-portrait-height':(budget?.height??256)+'px',
    '--cg-figure-width':(budget?.width??360)+'px',
    '--cg-figure-height':(budget?.height??480)+'px',
  } as CSSProperties;
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
    <div className="cg-art-view__stage" data-art-kind={hasFigureArt?'figure':'portrait'}
      data-art-status={artTier}>
      <motion.div key={active.key} className="cg-art-view__painting"
        style={paintingStyle}
        data-native-portrait={!hasFigureArt?'true':'false'}
        initial={reducedMotion?false:{opacity:0,scale:hasFigureArt?1.025:1}}
        animate={{opacity:1,scale:1}}
        transition={{duration:reducedMotion?0:.25,ease:'easeOut'}}>
        {source&&<ReliableImage src={source}
          fallbackSrc={getCardPortraitFallback(active.key)??undefined}
          alt={active.title+'人物画作'} fill unoptimized priority
          sizes="(max-width:800px) 92vw, 70vw"
          className="cg-art-view__photo"
          onLoad={event=>{
            const img=event.currentTarget;
            if(img.naturalWidth>0&&img.naturalHeight>0){
              setLoaded({key:active.key,width:img.naturalWidth,height:img.naturalHeight,
                dpr:typeof window==='undefined'?2:window.devicePixelRatio||2});
            }
          }}/>}
      </motion.div>
      {!hasFigureArt&&<span className="cg-art-view__portrait-caption" aria-hidden="true">
        肖像原稿 · 以原始像素鉴赏
      </span>}
      <span className="cg-art-view__stage-ornament" aria-hidden="true"/>
    </div>
    <aside className="cg-art-view__side">
      <div className="cg-art-view__heading" aria-live="polite" aria-atomic="true">
        <small>MONSTER APARTMENT · A05</small>
        <h2>{active.title}</h2>
        <p>{hasFigureArt?'契约插画鉴赏':'角色肖像鉴赏'} · {owned?'已收录':'尚未收录'}</p>
        <p className="cg-art-view__disclaimer" data-testid="a05-art-review-status">
          {artTier==='production'?'正式审核通过的角色原画':
            artTier==='candidate'?'独立角色候选画稿 · 尚未通过正式 CG 人工验收':
            '已登记的角色肖像 · 不以头像冒充全身原画'}
        </p>
        {sourcePixels&&<p className="cg-art-view__source-pixels"
          data-testid="a05-art-source-resolution">
          原图 {sourcePixels.width}×{sourcePixels.height} · 以原始像素预算显示
        </p>}
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
