'use client';

import {useState} from 'react';
import {roomConversationTopics} from '@/core/room-conversations';
import type {RoomConversationTopic} from '@/core/room-conversations';
import type {CharacterId,RoomObjectId} from '@/core/character-life';

/** Revisit-friendly optional dialogue: the initial one-time branch stays intact. */
export function RoomConversationTopics({id,observed,working=false,cinematicActive=false,onSpeak}:{
  id:CharacterId;
  observed:readonly RoomObjectId[];
  working?:boolean;
  cinematicActive?:boolean;
  onSpeak?:(topic:RoomConversationTopic)=>void;
}){
  const [active,setActive]=useState<string|null>(null);
  const topics=roomConversationTopics(id,observed);
  const selected=topics.find(topic=>topic.id===active&&topic.unlocked);
  return <section aria-label="房间自由交谈" data-testid={'room-conversations-'+id}
    className="space-y-2 border-t border-[#b9917357] pt-4">
    <div className="flex items-center justify-between gap-2">
      <h3 className="font-serif text-sm tracking-[.06em] text-[#f0c58e]">自由交谈</h3>
      <span className="text-[10px] text-[#c0aa99]">
        {working?'正在值守':topics.filter(topic=>topic.unlocked).length+'/'+topics.length+' 话题'}
      </span>
    </div>
    {working?<p className="text-[11px] leading-5 text-[#d6bea8]">对方正在工坊工作；回到休息时间才能继续聊天。房间物件仍可调查。</p>:<>
      <div className="grid gap-1.5 sm:grid-cols-3" role="group" aria-label="自由交谈话题">
        {topics.map(topic=><button type="button" key={topic.id}
          disabled={!topic.unlocked}
          aria-pressed={active===topic.id}
          title={!topic.unlocked?topic.lockedHint:undefined}
          data-testid={'room-topic-'+id+'-'+topic.id}
          onClick={()=>{setActive(topic.id);onSpeak?.(topic);}}
          className={'min-h-11 rounded-md border px-2.5 py-2 text-left text-[11px] leading-5 transition-colors focus-visible:outline-2 focus-visible:outline-[#ffe1b8] disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none '+
            (active===topic.id?'border-[#d8ae83] bg-[#513043ad] text-[#fff0d8]':'border-[#b3937860] bg-[#2116238c] text-[#e9d4c0] hover:border-[#e8c09c] hover:bg-[#3d2436b3]')}>
          {topic.unlocked?'✧ ':'🔒 '}{topic.title}
        </button>)}
      </div>
      {selected&&cinematicActive?<p data-testid={'room-topic-response-'+id} role="status"
        className="border-l border-[#caa87b75] pl-2.5 text-[11px] leading-5 text-[#d5ba9f]">
        「{selected.title}」正在场景中演出
      </p>:selected?<div data-testid={'room-topic-response-'+id} role="status"
        className="border-l border-[#caa87b80] bg-[#22162495] px-3 py-2.5 text-xs leading-6 text-[#ffe1c1]">
        <span className="mb-1 block text-[10px] tracking-wider text-[#f0bc7c]">{selected.title}</span>
        {selected.response}
      </div>:<p className="text-[10px] leading-5 text-[#bda792]">
        探索房间可解锁更私密的话题；闲聊可重复回听，不会覆盖第一次的重要抉择。
      </p>}
      {topics.some(topic=>!topic.unlocked)&&
        <p className="text-[10px] leading-5 text-[#bda792]">
          下一个线索：{topics.find(topic=>!topic.unlocked)?.lockedHint}
        </p>}
    </>}
  </section>;
}
