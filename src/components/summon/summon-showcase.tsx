'use client';
import Link from 'next/link';
import {ChevronRight,Ticket} from 'lucide-react';
import {ReliableImage as Image} from '@/components/game/reliable-image';
import {HEROINE_FACE_ART,getCardFace} from './heroine-portrait-assets';
import {siteAssetUrl} from '@/lib/game/site-asset-url';
import moonveilPortrait from '../../../public/art/yuesha-portrait-v3.webp';
import {GACHA_CHARACTERS,type SummonableCharacter} from '@/lib/summon/gacha-engine';
import type {FeaturedWorker} from './summon-pool-rail';

/** Uses the catalog's real rarity/rate; switching artwork never boosts odds. */
export function SummonShowcase({featuredWorker,featuredName,featuredBeastName,featuredCard,quote,
  ownedCharactersCount,onOpenTrial,onOpenCollection,onOpenResources}:{
  featuredWorker:FeaturedWorker|null;featuredName:string;featuredBeastName:string;
  featuredCard:SummonableCharacter;quote:string;ownedCharactersCount:number;
  onOpenTrial:()=>void;onOpenCollection:()=>void;onOpenResources:()=>void;
}){
  return (
        <aside className="summon-cinematic-sidebar relative flex w-full flex-col gap-3 overflow-y-auto py-2 lg:w-64 lg:shrink-0 xl:w-72 z-20">
          {/* Featured card; a visual theme is not a drop-rate boost. */}
          <div data-testid="summon-featured-card" data-card-character={featuredWorker??'yuesha'}
            className="relative flex flex-col rounded-lg border border-[#d4aa7080] bg-[#1a0b18e0] p-3 shadow-[0_10px_30px_#000000aa]">
            {/* Grounded actual catalog grade. */}
            <div data-testid="summon-featured-card-tier"
              className="absolute top-2 left-2 z-10 rounded border border-[#ffe5bd88] bg-[#a96839] px-2 py-0.5 text-[10px] font-bold tracking-[.15em] text-[#fff0ce]">
              {featuredCard.rarityZh}
            </div>

            {/* Card Portrait */}
            <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[#e2b57866] bg-[#22101e]">
              <Image
                src={featuredWorker?HEROINE_FACE_ART[featuredWorker]:
                  getCardFace('yuesha-eclipse','feature')??moonveilPortrait}
                fallbackSrc={featuredWorker?undefined:moonveilPortrait}
                alt={featuredName}
                data-testid="summon-featured-card-image"
                fill
                loading="eager"
                unoptimized
                sizes="(max-width:1023px) 50vw,240px"
                className={featuredWorker?'object-cover object-[55%_25%]':'object-contain'}
              />
            </div>

            {/* Card Meta */}
            <div className="mt-2">
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-[#ffe6c2]">{featuredName} ☾</h3>
                <span className="text-[10px] text-[#e8c099]">✦ {featuredBeastName}</span>
              </div>
              <p className="mt-1 text-[10px] text-[#c9a786] italic leading-tight">
                {quote}
              </p>
            </div>

            <p className="mt-2 text-[10px] leading-5 text-[#c9ae8d]" data-testid="summon-featured-odds">
              基础获取概率 {featuredCard.rate.toFixed(2)}% · 主题不额外加成
            </p>

            {/* Quick Actions */}
            <div className="mt-2.5 text-xs">
              {featuredWorker ? (
                <Link href={'/characters/?visit='+featuredWorker}
                  data-testid="summon-featured-room-link"
                  className="flex min-h-10 w-full items-center justify-center rounded border border-[#c69d6f80] bg-[#2d1a2cbb] px-2 py-2 text-center font-medium text-[#ffe2be] transition-colors hover:border-[#f4d8b0] hover:bg-[#44304a] focus-visible:outline-2 focus-visible:outline-[#ffe0b5]">
                  拜访{featuredName}的房间
                </Link>
              ) : (
                <button type="button" onClick={() => onOpenTrial()}
                  data-testid="summon-yuesha-trial"
                  className="min-h-10 w-full rounded border border-[#c69d6f80] bg-[#2d1a2cbb] px-2 py-2 font-medium text-[#ffe2be] transition-colors hover:border-[#f4d8b0] hover:bg-[#44304a] focus-visible:outline-2 focus-visible:outline-[#ffe0b5]">
                  月纱技能试玩
                </button>
              )}
            </div>
            <button type="button" onClick={()=>onOpenCollection()}
              className="mt-2 min-h-11 w-full rounded border border-[#b98b6188] bg-[#261725b8] px-2.5 py-2 text-[11px] font-medium leading-5 text-[#f7d8b2] transition-colors hover:border-[#f8d9b1] hover:bg-[#3d2737] focus-visible:outline-2 focus-visible:outline-[#ffe0b5]">
              查看已收录契约、首饰和装备
            </button>
          </div>

          {/* Official Gacha Probability Table */}
          <div
            data-testid="collection-odds"
            className="my-2 rounded-xl border border-[#8b614088] bg-[#1c0d1bb8] p-2.5 text-xs"
          >
            <h4 className="font-bold text-[#ffdca8] text-[11px] mb-1">召唤概率公示</h4>
            <div className="space-y-0.5 text-[10px]">
              {GACHA_CHARACTERS.map((character,index)=>(
                <div key={character.id} data-testid={'summon-odds-'+character.id}
                  className={'flex justify-between '+(
                    ['text-[#ff7585]','text-[#ffd700]','text-[#c084fc]',
                      'text-[#93c5fd]','text-[#cbd5e1]'][index]??'text-[#e4d2c4]')}>
                  <span>{character.rarityZh}</span>
                  <strong>{character.rate.toFixed(2)}%</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Collection Progress */}
          <div className="rounded-xl border border-[#8b614088] bg-[#1c0d1bb8] p-2.5 text-xs">
            <div className="flex justify-between items-center text-[10px] text-[#e0bfa3]">
              <span data-testid="summon-owned-progress">收集进度 {ownedCharactersCount}/{GACHA_CHARACTERS.length}</span>
              <button
                type="button"
                onClick={() => onOpenResources()}
                className="text-[#ffc66e] hover:underline"
              >
                <span className="inline-flex items-center gap-1"><Ticket aria-hidden="true" size={12} strokeWidth={1.7}/> 契约资源来源 <ChevronRight aria-hidden="true" size={12}/></span>
              </button>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#120713]">
              <div
                className="h-full bg-gradient-to-r from-[#d97706] to-[#dc2626]"
                style={{ width: `${Math.min(100, (ownedCharactersCount / GACHA_CHARACTERS.length) * 100)}%` }}
              />
            </div>
          </div>

          {/* Collectable portraits; visual themes have no UP. */}
          <div className="mt-2">
            <span className="block text-[10px] text-[#cca585] mb-1">可收录契约</span>
            <div className="flex items-center justify-between gap-1">
              {GACHA_CHARACTERS.map(character => (
                <button type="button" key={character.id}
                  data-testid="summon-available-card" data-character-id={character.id}
                  title={character.title} aria-label={`查看契约档案：${character.title}`}
                  onClick={() => onOpenCollection()}
                  className="relative size-10 shrink-0 overflow-hidden rounded-full border border-[#b88c58] bg-[#2a1023] text-xs font-bold text-[#f6d5aa] transition hover:border-[#ffe3b3] hover:scale-105">
                  <Image src={getCardFace(character.id,'thumbnail')??siteAssetUrl(character.avatar)} alt=""
                    fill sizes="40px" className="object-cover object-top"
                    data-portrait-source="dedicated-heroin-face"/>
                </button>
              ))}
            </div>
          </div>
        </aside>
  );
}
