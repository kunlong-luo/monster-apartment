'use client';

import Image from 'next/image';
import {useState} from 'react';
import moonshaPainting from '../../../public/art/yuesha-portrait-v3.webp';
import {CHARACTER_PROFILES} from '@/core/character-life';
import type {CharacterId} from '@/core/character-life';
import {roomInvestigations} from '@/core/room-investigation';
import {useCharacterLife} from '@/lib/game/character-life-store';
import {WorkerArtwork} from '@/components/moonwork/worker-artwork';

const PALETTES:Record<CharacterId,string>={
  yuesha:'from-[#54203a] via-[#422040] to-[#140c1e]',
  brook:'from-[#124b65] via-[#142b4f] to-[#091625]',
  fern:'from-[#285c44] via-[#1e3d36] to-[#0d231a]',
  cinder:'from-[#783d29] via-[#452129] to-[#1c1018]',
};
/** Read-only collectible memories derived entirely from existing V1 observations.
 * Previously completed rooms also unlock: no save migration or extra currency. */
export function RoomMemoryGallery(){
  const {progress,status}=useCharacterLife();
  const entries=roomInvestigations(progress);
  const [selected,setSelected]=useState<CharacterId|null>(null);
  const complete=entries.filter(entry=>entry.complete).length;
  const expanded=entries.find(entry=>entry.characterId===selected&&entry.complete);
  return <section aria-label="人物记忆卡收藏" data-testid="room-memory-gallery"
    className="space-y-3 rounded-xl border border-[#b892735e] bg-[#170e1bdc] p-3 text-[#f3dbc0]">
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <span className="text-[10px] tracking-[.16em] text-[#e9ba86]">MEMORY COLLECTION</span>
        <h3 className="text-base font-semibold text-[#ffdfb6]">月光记忆 · 私室收藏</h3>
      </div>
      <span className="text-xs tabular-nums text-[#efcda1]">{complete} / {entries.length} 已收录</span>
    </div>
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {entries.map(entry=>{
        const id=entry.characterId;
        const unlocked=entry.complete;
        return <button type="button" key={entry.id} disabled={!unlocked}
          data-testid={'memory-card-'+entry.id}
          aria-label={CHARACTER_PROFILES[id].name+' · '+(unlocked?entry.label:'记忆尚未解锁')}
          onClick={()=>setSelected(current=>current===id?null:id)}
          aria-expanded={selected===id&&unlocked}
          className={'group relative min-h-36 overflow-hidden rounded-lg border bg-gradient-to-br text-left shadow-[0_6px_22px_#0008] transition-[border-color,transform] focus-visible:outline-2 focus-visible:outline-[#ffe1bb] disabled:cursor-default motion-reduce:transition-none '+
            PALETTES[id]+' '+(unlocked?'border-[#dbac737d] hover:-translate-y-0.5 hover:border-[#ffe4b1]':'border-[#8a6f696a] opacity-70')}>
          <div aria-hidden="true" className="pointer-events-none absolute -right-2 bottom-0 h-[94%] w-[65%] opacity-70">
            {unlocked&&(id==='yuesha'
              ?<Image src={moonshaPainting} alt="" fill unoptimized sizes="150px" className="object-cover object-[50%_30%]"/>
              :<WorkerArtwork id={id} name={CHARACTER_PROFILES[id].name} compact/>)}
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0f0c19c2] via-[#110e1f78] to-transparent"/>
          <div className="relative z-[1] flex min-h-36 flex-col justify-between p-3">
            <span className="text-[10px] tracking-[.08em] text-[#f5d49e]">{unlocked?'✦ 已收藏':'◇ 尚未解锁'}</span>
            <span className="space-y-1">
              <strong className="block text-xs text-[#ffebcb]">{unlocked?entry.label:'未完成的记忆'}</strong>
              <span className="block text-[10px] text-[#e4cdb7]">{CHARACTER_PROFILES[id].name} · {entry.count}/{entry.total}</span>
            </span>
          </div>
        </button>;
      })}
    </div>
    {expanded&&<div role="status" data-testid="memory-card-detail"
      className="rounded-lg border border-[#d4a76d7d] bg-[#3c2733c7] px-3 py-3">
      <p className="text-sm font-medium text-[#ffe0b2]">✦ {expanded.label} · {CHARACTER_PROFILES[expanded.characterId].name}</p>
      <p className="mt-2 text-xs leading-6">{expanded.summary}</p>
      <p className="mt-2 text-[10px] text-[#cfbaa5]">这是调查回忆，不会消耗道具、影响制造效率或改变初次剧情选择。</p>
    </div>}
    {status!=='ok'&&<p role="alert" className="text-xs text-rose-200">
      人物档案目前无法读取或写入；请先保护当前存档，避免覆盖。</p>}
    <p className="text-[10px] leading-5 text-[#bca895]">在四位角色的私人房间中找到两件关联物品，即可永久收录对应的故事记忆。</p>
  </section>;
}
