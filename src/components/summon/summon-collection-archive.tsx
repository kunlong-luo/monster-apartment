'use client';

import {useState} from 'react';
import Link from 'next/link';
import {ReliableImage as Image} from '@/components/game/reliable-image';
import {HEROINE_FACE_ART,getCardPortraitFallback,getSelectedCardPreview} from './heroine-portrait-assets';
import {CHARACTER_CARDS,type CollectionState} from '@/core/character-collection';
import type {CharacterId} from '@/core/character-life';
import {COVENANT_BEASTS} from '@/lib/summon/covenant-beasts';
import type {CollectionStatus} from '@/lib/game/character-collection-store';
import {SummonForgePanel} from './summon-forge-panel';

/**
 * A pure collection/gear surface over the same canonical collection save.
 * Stays mounted when hidden to retain the user's gear-target selection.
 */
export function SummonCollectionArchive({open,collection,collectionStatus,onClose}:{
  open:boolean;collection:CollectionState;collectionStatus:CollectionStatus;onClose:()=>void;
}){
  const [equipTarget,setEquipTarget]=useState<CharacterId>('yuesha');
  const [forgeNotice,setForgeNotice]=useState('');
  const [selectedArtId,setSelectedArtId]=useState<string|null>(null);
  const artCard=selectedArtId?CHARACTER_CARDS.find(c=>c.key===selectedArtId):null;
  const artPreview=artCard?getSelectedCardPreview(artCard.key):null;
  const artOwned=Boolean(artCard&&collection.draws.includes(artCard.key));
  const showArt=Boolean(artCard&&artPreview&&artOwned);
  const closeArchive=()=>{setSelectedArtId(null);onClose();};
  const ownedEquipmentCharacters=[...new Set(CHARACTER_CARDS.filter(
    card=>collection.draws.includes(card.key)).map(card=>card.character))] as CharacterId[];
  const selectedEquipTarget=ownedEquipmentCharacters.includes(equipTarget)
    ?equipTarget:ownedEquipmentCharacters[0]??null;
  if(!open)return null;
  return (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="角色契约图鉴与装备锻造"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
        >
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-[#c49a62] bg-[#1a0f19] p-4 sm:p-5 shadow-[0_15px_50px_#000000ee] text-[#f2dac2]">
            <div className="flex items-center justify-between border-b border-[#c49a6244] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#ffe2be]">{showArt?'月蚀契约 · 人物立绘':'♟ 人物契约图鉴与装备锻造'}</h3>
                {showArt?<p className="text-xs text-[#d2af8e]">{artCard?.title} · 已收录的契约插画</p>:
                  <p className="text-xs text-[#d2af8e]">
                    已收录契约：{new Set(collection.draws).size} / 5 | 锻造碎片：
                    <span data-testid="collection-shards">{collection.shards}</span>
                  </p>}
              </div>
              <button
                type="button"
                onClick={closeArchive}
                className="flex size-8 items-center justify-center rounded-full border border-[#b88c58] text-sm text-[#eac59b] hover:bg-[#341a2c]"
              >
                ✕
              </button>
            </div>

            {showArt&&artPreview&&artCard?
              <section data-testid="collection-art-view" aria-label={artCard.title+'完整立绘'}
                className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto py-3 md:grid-cols-[minmax(0,1fr)_minmax(180px,240px)]">
                <div className="relative h-[min(58vh,650px)] w-full overflow-hidden rounded-xl border border-[#ab805c88] bg-[radial-gradient(ellipse_at_50%_40%,#583045_0%,#241323_56%,#100b14_100%)] md:h-[min(68vh,650px)]">
                  <Image src={artPreview} fallbackSrc={getCardPortraitFallback(artCard.key)??undefined}
                    alt={artCard.title+'的全身契约立绘'} data-testid="collection-art-image"
                    fill unoptimized priority sizes="(max-width:767px) 88vw, 480px"
                    className="object-contain object-center"/>
                </div>
                <div className="flex flex-col justify-between gap-4 self-start py-2 md:self-stretch">
                  <div className="space-y-3">
                    <p className="text-[11px] tracking-[.22em] text-[#cfa876]">ECLIPSE COVENANT</p>
                    <h4 className="font-serif text-2xl leading-tight text-[#ffe0bb]">{artCard.title}</h4>
                    <p className="text-sm leading-7 text-[#ddc4af]">
                      深红月蚀映照古老宫殿，她已与你缔结不可遗忘的契约。
                    </p>
                    <p className="text-xs leading-6 text-[#bea38e]">
                      完整欣赏已收录的人物插画；抽卡品阶与真实奖励以契约记录为准。
                    </p>
                  </div>
                  <button type="button" data-testid="collection-art-back"
                    onClick={()=>setSelectedArtId(null)}
                    className="min-h-11 rounded-md border border-[#a68d70] bg-[#291724] px-4 py-2 text-sm text-[#f1e5d6] transition-colors hover:bg-[#48243a] focus-visible:outline-2 focus-visible:outline-[#f1e5d6] motion-reduce:transition-none">
                    返回人物图鉴
                  </button>
                </div>
              </section>:
            <div className="flex-1 space-y-4 overflow-y-auto pr-1 py-3 text-xs">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {CHARACTER_CARDS.map((card) => {
                  const owned = collection.draws.includes(card.key);
                  return (
                    <div
                      key={card.key}
                      data-testid={'collection-card-' + card.key}
                      className={`flex items-center gap-3 rounded-lg border p-2.5 ${
                        owned
                          ? 'border-[#ffcf7a] bg-[#341727]'
                          : 'border-[#584033] bg-[#201320]/60 opacity-60'
                      }`}
                    >
                      <div className="size-10 overflow-hidden rounded bg-[#1e0f1d] border border-[#a87c50]">
                        <Image src={HEROINE_FACE_ART[card.character]} alt={card.title}
                          width={40} height={40} className="size-full object-cover"/>
                      </div>
                      <div className="min-w-0 flex-1">
                        <strong className="block text-sm text-[#ffe5be]">{card.title}</strong>
                        <span className="text-[10px] text-[#caa789]">
                          {owned ? '已收录' : '待收录 · ' + card.rarity}
                        </span>
                        {owned&&getSelectedCardPreview(card.key)&&
                          <button type="button" data-testid={'collection-view-art-'+card.key}
                            onClick={()=>setSelectedArtId(card.key)}
                            className="mt-2 mr-2 inline-flex min-h-9 items-center rounded border border-[#a68d70] bg-[#241825] px-3 py-1.5 text-[11px] text-[#f1e5d6] hover:bg-[#492839] focus-visible:outline-2 focus-visible:outline-[#f1e5d6]">
                            欣赏完整立绘
                          </button>}
                        {owned&&<Link
                          data-testid={'collection-visit-'+card.key}
                          href={card.character==='yuesha'?'/apartment/?visit=yuesha':
                            '/characters/?visit='+card.character}
                          className="mt-2 inline-flex min-h-9 items-center rounded border border-[#d2a874] bg-[#5a2440] px-3 py-1.5 text-[11px] text-[#ffe4c3] hover:brightness-125">
                          拜访私人房间 ↗
                        </Link>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <section data-testid="beast-contract-roster" aria-label="美女与野兽契约档案"
                className="border-t border-[#b8895866] pt-3">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-sm font-semibold text-[#ffe0b5]">✦ 美女与野兽 · 契约传说</h4>
                  <span className="text-[10px] text-[#d4b090]">四只独特异兽 · 正式 CG 制作中</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {Object.entries(COVENANT_BEASTS).map(([characterId,beast])=>{
                    const owned=CHARACTER_CARDS.some(card=>
                      card.character===characterId&&collection.draws.includes(card.key));
                    return <article key={beast.id} data-testid={'beast-lore-'+beast.id}
                      data-beast-identity={beast.silhouette}
                      data-beast-art-status="awaiting-independent-cg"
                      className={'covenant-beast-card covenant-beast-card--'+beast.palette}>
                      <div className="covenant-beast-card__top">
                        <span className="text-[10px] tracking-[.12em]">BEAST COVENANT</span>
                        <span className="text-[10px]">{owned?'人物卡已收录':'对应人物待收录'}</span>
                      </div>
                      <strong className="block text-sm text-[#ffe8c8]">{beast.name}</strong>
                      <p className="mt-1 text-[11px] text-[#e5c9a9]">{beast.epithet}</p>
                      <p className="mt-2 text-[11px] leading-5 text-[#d8c4b6]">{beast.bond}</p>
                    </article>;
                  })}
                </div>
              </section>

              <SummonForgePanel collection={collection} collectionStatus={collectionStatus}
                ownedEquipmentCharacters={ownedEquipmentCharacters} selectedEquipTarget={selectedEquipTarget}
                onSelectEquipTarget={setEquipTarget} forgeNotice={forgeNotice} onForgeNotice={setForgeNotice}/>
            </div>}

            <div className="flex justify-end border-t border-[#c49a6244] pt-3">
              <button
                type="button"
                onClick={closeArchive}
                className="rounded-lg border border-[#c49a62] bg-[#291724] px-5 py-1.5 text-xs text-[#ffe2be] hover:bg-[#3f2137]"
              >
                {showArt?'离开立绘欣赏':'返回契约大厅'}
              </button>
            </div>
          </div>
        </div>
  );
}
