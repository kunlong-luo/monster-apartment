'use client';

import Image from 'next/image';
import {Gem,Diamond} from 'lucide-react';
import {getCardFace} from './heroine-portrait-assets';
import {siteAssetUrl} from '@/lib/game/site-asset-url';
import type {SummonableCharacter,GachaRarity} from '@/lib/summon/gacha-engine';

export const SUMMON_RARITY_RANK:Record<GachaRarity,number>={
  'N':1,'R':2,'SR':3,'SSR-Legend':4,'SSR-Mythic':5,
};

/** The artwork slot is a portrait crop until independent card CG is approved.
 * Never stretch a thumbnail into a fictitious full-body illustration.
 * The one award record below is the result of an already committed draw. */
export function CharacterContractCard({character,mode='feature',awardTestId}:{
  character:SummonableCharacter;
  mode?:'feature'|'thumbnail';
  awardTestId?:string;
}){
  const image=getCardFace(character.id)??siteAssetUrl(character.avatar);
  return <article
    className={'contract-card contract-card--'+mode}
    data-card-id={character.id} data-rarity={character.rarity}
    data-testid={mode==='feature'?'collection-focus-card':undefined}>
    <div className="contract-card__inner">
      <div className="contract-card__art" data-portrait-kind="approved-face-crop">
        <div className="contract-card__halo" aria-hidden="true"/>
        <Image src={image} alt={character.name+'的精绘肖像'}
          fill unoptimized draggable={false} priority={mode==='feature'}
          sizes={mode==='feature'?'(max-width:600px) 85vw, 490px':'(max-width:600px) 19vw, 100px'}
          className="contract-card__portrait" data-portrait-source="dedicated-heroine-face"/>
        <div className="contract-card__art-vignette" aria-hidden="true"/>
      </div>
      <header className="contract-card__head">
        <span className="contract-card__rarity"><Diamond aria-hidden="true" size={13} strokeWidth={1.7}/>{character.rarityZh}</span>
        {character.firstAcquired?<span className="contract-card__new">NEW</span>:<span className="contract-card__echo">契约回响</span>}
      </header>
      <div className="contract-card__caption">
        <span className="contract-card__eyebrow">{character.epithet}</span>
        <h4 data-testid={mode==='feature'?'collection-reveal-name':undefined}>{character.title}</h4>
        {mode==='feature'&&<p className="contract-card__quote">“{character.quote}”</p>}
        <p className="contract-card__award" data-testid={awardTestId}>
          <span>{character.firstAcquired?'首次收录':'重复契约'}</span>
          <span className="contract-card__shards"><Gem aria-hidden="true" size={13}/> +{character.awardedShards??0} 锻造碎片</span>
        </p>
        {mode==='feature'&&<p className="contract-card__art-status">契约典藏 · 人物肖像</p>}
      </div>
    </div>
  </article>;
}
