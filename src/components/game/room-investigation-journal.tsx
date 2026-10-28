'use client';
import {useState} from 'react';
import {roomInvestigations,roomInvestigationConclusion} from '@/core/room-investigation';
import {CHARACTER_PROFILES} from '@/core/character-life';
import {useCharacterLife} from '@/lib/game/character-life-store';

export function RoomInvestigationJournal(){
  const [expanded,setExpanded]=useState(false);
  const {progress,status}=useCharacterLife();
  const entries=roomInvestigations(progress);
  const completed=entries.filter(item=>item.complete).length;
  const conclusion=roomInvestigationConclusion(progress);
  return <section aria-label="月光街人物线索手册"
    data-testid="room-investigation-journal"
    className="min-w-0 rounded-xl border border-[#c79d697d] bg-[linear-gradient(135deg,#34222fe8,#130d18f0)] p-3 text-[#f5e1c8] shadow-[inset_0_1px_#ffdb9a3b]">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="min-w-0">
        <span className="text-[10px] tracking-[.13em] text-[#eac389]">PERSONAL INVESTIGATION</span>
        <h3 className="text-sm font-semibold">人物线索手册 <span className="font-normal text-[#cdb8a1]">{completed}/{entries.length}</span></h3>
      </div>
      <button type="button" data-testid="investigation-toggle"
        aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}
        className="min-h-10 rounded-lg border border-[#bd916c80] bg-[#4b303f] px-3 py-1.5 text-xs hover:border-[#ffda9f] focus-visible:outline-2 focus-visible:outline-[#ffda9f]">
        {expanded?'收起线索':'查看线索'}
      </button>
    </div>
    <div className="mt-2 flex gap-1.5" aria-label={'已发现 '+completed+' 条人物房间秘密'}>
      {entries.map(item=><span key={item.id} className={'h-1.5 flex-1 rounded-full '+(item.complete?'bg-[#dfc28b]':'bg-[#715c62]')}/>)}
    </div>
    {expanded&&<div className="mt-3 space-y-2" data-testid="investigation-entries">
      {entries.map(item=><div key={item.id}
        data-testid={'investigation-'+item.id}
        className="rounded-lg border border-[#b6916963] bg-[#1d1420b8] px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <strong className="text-xs">{item.complete?item.label:'尚未解开的记录'}</strong>
          <span className="text-[10px] text-[#e9c48d]">{CHARACTER_PROFILES[item.characterId].name} · {item.count}/{item.total}</span>
        </div>
        <p className="mt-1 text-xs leading-5 text-[#d9c8bc]">{item.summary}</p>
      </div>)}
      {conclusion&&<p role="status" data-testid="investigation-conclusion"
        className="rounded-lg border border-[#e1b877aa] bg-[#5b3541ad] p-3 text-xs leading-6 text-[#ffe0b2]">
        ✦ 四室共鸣 · {conclusion}
      </p>}
      <p className="text-[10px] leading-5 text-[#c5ae9b]">前往角色图鉴拜访工匠，或在公寓与月纱交谈；每间房观察相关物件即可永久记录。故事真相仍需在正式章节中揭晓。</p>
      {status!=='ok'&&<p role="alert" className="text-[11px] text-[#ffc5cc]">人物线索存档当前不可写入，原记录不会被覆盖。</p>}
    </div>}
  </section>;
}
