'use client';

import {useState} from 'react';
import {roomConversationTopics} from '@/core/room-conversations';
import type {RoomConversationTopic} from '@/core/room-conversations';
import type {CharacterId,RoomObjectId} from '@/core/character-life';

/** Revisit-friendly optional dialogue: the initial one-time branch stays intact. */
export function RoomConversationTopics({id,observed,working=false,onSpeak}:{
  id:CharacterId;
  observed:readonly RoomObjectId[];
  working?:boolean;
  onSpeak?:(topic:RoomConversationTopic)=>void;
}){
  const [active,setActive]=useState<string|null>(null);
  const topics=roomConversationTopics(id,observed);
  const selected=topics.find(topic=>topic.id===active&&topic.unlocked);
  return <section aria-label="房间自由交谈" data-testid={'room-conversations-'+id}
    className="space-y-2 rounded-xl border border-[#b9917357] bg-[#190f1acb] px-3 py-3">
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-xs tracking-wider text-[#f0c58e]">✧ 自由交谈</h3>
      <span className="text-[10px] text-[#c0aa99]">
        {working?'正在值守':topics.filter(topic=>topic.unlocked).length+'/'+topics.length+' 话题'}
      </span>
    </div>
    {working?<p className="text-[11px] leading-5 text-[#d6bea8]">对方正在工坊工作；回到休息时间才能继续聊天。房间物件仍可调查。</p>:<>
      <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="自由交谈话题">
        {topics.map(topic=><button type="button" key={topic.id}
          disabled={!topic.unlocked}
          aria-pressed={active===topic.id}
          title={!topic.unlocked?topic.lockedHint:undefined}
          data-testid={'room-topic-'+id+'-'+topic.id}
          onClick={()=>{setActive(topic.id);onSpeak?.(topic);}}
          className={'min-h-11 rounded-lg border px-2 py-2 text-left text-[11px] leading-5 transition-colors focus-visible:outline-2 focus-visible:outline-[#ffe1b8] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none '+
            (active===topic.id?'border-[#f4d397] bg-[#68405be6] text-[#fff0d8]':'border-[#b3937890] bg-[#382330b3] text-[#f4dcc8] hover:border-[#e8c09c]')}>
          {topic.unlocked?'✧ ':'🔒 '}{topic.title}
        </button>)}
      </div>
      {selected?<div data-testid={'room-topic-response-'+id} role="status"
        className="rounded-lg border border-[#caa87b80] bg-[#33202dd9] px-3 py-3 text-xs leading-6 text-[#ffe1c1]">
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
