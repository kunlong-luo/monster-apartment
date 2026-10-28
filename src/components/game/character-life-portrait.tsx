'use client';
import {useState} from 'react';
import {ABILITY_GROUPS,ABILITY_LABELS,CHARACTER_PROFILES} from '@/core/character-life';
import type {CharacterId} from '@/core/character-life';

export function CharacterLifePortrait({id}:{id:CharacterId}){
  const [expanded,setExpanded]=useState(false);
  const actor=CHARACTER_PROFILES[id];
  return <section className="rounded-xl border border-[#ae885f7d] bg-[#170e1ccf] p-3 text-[#f4dec5]" data-testid={'life-profile-'+id}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs tracking-[.12em] text-[#e8bc83]">人物档案 · {actor.name}</p>
      <button type="button" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}
        className="min-h-9 rounded-lg border border-[#b9936c91] px-3 py-1 text-xs hover:bg-[#53343c]"
        data-testid={'life-expand-'+id}>{expanded?'收起能力':'查看完整档案'}</button>
    </div>
    <p className="mt-2 text-xs leading-6 text-[#e4d0bd]">{actor.description}</p>
    <div className="mt-2 flex flex-wrap gap-1.5">{actor.traits.map(trait=>
      <span key={trait} className="rounded-full border border-[#976f6191] bg-[#4026329a] px-2 py-1 text-[10px]">{trait}</span>)}</div>
    <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
      {actor.strengths.map(key=><div key={key} className="rounded-md bg-[#392630] px-2 py-1.5">
        <span className="block text-[#b9a49a]">{ABILITY_LABELS[key]}</span>
        <strong className="text-base font-medium tabular-nums text-[#ffe0ac]">{actor.abilities[key]}</strong>
      </div>)}
    </div>
    {expanded&&<div className="mt-3 space-y-2 border-t border-[#94725270] pt-3">
      {ABILITY_GROUPS.map(group=><div key={group.name}>
        <h4 className="mb-1 text-[11px] text-[#e8bc83]">{group.name}</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
          {group.keys.map(key=><div key={key} className="flex justify-between gap-2">
            <span className="text-[#d7c2b0]">{ABILITY_LABELS[key]}</span><span className="tabular-nums">{actor.abilities[key]}</span>
          </div>)}
        </div>
      </div>)}
      <p className="text-xs leading-5 text-[#cfb69e]">喜欢：{actor.likes}。心愿：{actor.goal}。</p>
      <p className="text-xs leading-5 text-[#cfb69e]">担忧：{actor.fear}。</p>
      <p className="text-[10px] leading-5 text-[#b99e88]">以上为 V3.4 人物设定参考值；训练、装备和生产加成尚未接入，不作为实时战力。</p>
    </div>}
  </section>;
}
