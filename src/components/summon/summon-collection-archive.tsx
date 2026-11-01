'use client';

import {useState} from 'react';
import Link from 'next/link';
import {ReliableImage as Image} from '@/components/game/reliable-image';
import {HEROINE_FACE_ART} from './heroine-portrait-assets';
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
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-[#c49a62] bg-[#1a0f19] p-5 shadow-[0_15px_50px_#000000ee] text-[#f2dac2]">
            <div className="flex items-center justify-between border-b border-[#c49a6244] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#ffe2be]">♟ 人物契约图鉴与装备锻造</h3>
                <p className="text-xs text-[#d2af8e]">
                  已收录契约：{new Set(collection.draws).size} / 5 | 锻造碎片：
                  <span data-testid="collection-shards">{collection.shards}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onClose()}
                className="flex size-8 items-center justify-center rounded-full border border-[#b88c58] text-sm text-[#eac59b] hover:bg-[#341a2c]"
              >
                ✕
              </button>
            </div>

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
            </div>

            <div className="flex justify-end border-t border-[#c49a6244] pt-3">
              <button
                type="button"
                onClick={() => onClose()}
                className="rounded-lg border border-[#c49a62] bg-[#291724] px-5 py-1.5 text-xs text-[#ffe2be] hover:bg-[#3f2137]"
              >
                返回契约大厅
              </button>
            </div>
          </div>
        </div>
  );
}
