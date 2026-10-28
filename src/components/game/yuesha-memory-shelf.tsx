'use client';

import Image from 'next/image';
import {useState} from 'react';
import memoryPortrait from '../../../public/art/yuesha-portrait-v3.webp';
import {ROOM_INVESTIGATIONS} from '@/core/room-investigation';
import {yueshaMemoryCards} from '@/core/yuesha-memory-shelf';
import type {CharacterLifeState,RoomObjectId} from '@/core/character-life';

type RevisitItem=Extract<RoomObjectId,'seal'|'tea'|'ledger'>;

/** Earned-memory shelf below the scene, derived from durable investigations.
 * The only artwork used here is an existing portrait printed as a card COVER.
 * It is not a claim of independent clean-room CG or transparent acting frames. */
export function YueshaMemoryShelf({progress,onRevisit}:{
  progress:CharacterLifeState;
  onRevisit:(item:RevisitItem)=>void;
}){
  const [reveal,setReveal]=useState(false);
  const cards=yueshaMemoryCards(progress);
  const collected=cards.filter(card=>card.unlocked).length;
  const secret=ROOM_INVESTIGATIONS.find(item=>item.id==='contract');
  return <section aria-label="月纱房间的真实记忆收藏"
    data-testid="yuesha-memory-shelf"
    className="min-w-0 overflow-hidden rounded-xl border border-[#b78a648a] bg-[linear-gradient(145deg,#24131ef0,#100b17f5_80%)] p-3 text-[#fbe0c1] shadow-[inset_0_1px_#ffdfa33d,0_14px_30px_#0005] sm:p-4">
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        <p className="text-[10px] tracking-[.17em] text-[#e2b77c]">MOONLIT MEMORIES</p>
        <h3 className="text-base font-semibold tracking-[.05em] text-[#ffe1b4]">已收集记忆</h3>
      </div>
      <span className="rounded-full border border-[#bc8f656b] bg-[#37202d] px-3 py-1 text-xs tabular-nums"
        data-testid="yuesha-memory-progress">{collected} / {cards.length} 已发现</span>
    </div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cards.map((card,index)=>{
        const isSecret=card.id==='contract';
        const selected=isSecret&&reveal&&card.unlocked;
        return <button type="button" key={card.id}
          data-testid={'yuesha-memory-card-'+card.id}
          aria-label={card.unlocked?card.title+' · 回看记忆':card.title+' · 尚未收录'}
          aria-pressed={isSecret?selected:undefined}
          disabled={!card.unlocked}
          onClick={()=>{
            if(isSecret)setReveal(value=>!value);
            else onRevisit(card.id as RevisitItem);
          }}
          className={'group relative min-h-[124px] overflow-hidden rounded-lg border px-3 py-3 text-left shadow-[0_8px_20px_#0007] transition-[border-color,transform,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-[#ffe0a7] motion-reduce:transition-none '+
            (card.unlocked
              ?'border-[#d5a1719e] bg-[radial-gradient(ellipse_at_80%_12%,#85456788,transparent_75%),linear-gradient(145deg,#3b2438,#1c1428)] hover:-translate-y-0.5 hover:border-[#ffe0aa] hover:shadow-[0_0_20px_#d99f6645]'
              :'cursor-default border-[#674d4b78] bg-[linear-gradient(145deg,#281d27,#16111a)] opacity-70')
          }>
          {isSecret&&card.unlocked&&<Image src={memoryPortrait} alt="" fill
            unoptimized sizes="(max-width:640px) 42vw, 210px"
            className="pointer-events-none object-cover object-[70%_24%] opacity-40"/>}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#120b16e8_0%,transparent_85%)]"/>
          <div className="relative z-[1] flex min-h-[98px] flex-col justify-between">
            <span className="flex items-center justify-between gap-2">
              <span aria-hidden="true" className={'grid size-9 place-items-center rounded-full border text-xl '+
                (card.unlocked?'border-[#efbb8c9e] bg-[#5b3048bd] text-[#ffe1a7]':'border-[#8e707079] bg-[#261924] text-[#9d8289]')}>
                {card.unlocked?card.mark:'◇'}
              </span>
              <span className="text-[10px] text-[#ead0b9]">{card.unlocked?'✦ 已收录':'未发现'}</span>
            </span>
            <span>
              <strong className="block text-xs text-[#ffe2bf]">{card.unlocked?card.title:'未知的记忆'}</strong>
              <span className="mt-1 block text-[10px] leading-4 text-[#cbb2a5]">
                {card.unlocked?card.subtitle:'继续调查房间解锁'}
              </span>
            </span>
          </div>
          <span className="sr-only">第 {index+1} 张记忆</span>
        </button>;
      })}
    </div>
    {reveal&&cards[3].unlocked&&secret&&<p role="status"
      data-testid="yuesha-memory-secret"
      className="mt-3 rounded-lg border border-[#e1b77985] bg-[#563247a3] px-3 py-3 text-xs leading-6 text-[#ffdfbd]">
      ✦ {secret.short}：{secret.revealed}
    </p>}
    <p className="mt-2 text-[10px] leading-5 text-[#bea99b]">
      记忆从实际调查记录自动解锁；点击已收录的物件可回看，未发现的线索不会提前剧透。
    </p>
  </section>;
}
