'use client';
import Image from 'next/image';
import {useEffect,useState} from 'react';
import moonlitStreet from '../../../public/art/lobby-hero-v3.webp';
import {CHARACTER_PROFILES,WORKER_DIALOGUES} from '@/core/character-life';
import type {WorkerCharacterId,RoomObjectId,WorkerChoice} from '@/core/character-life';
import {commitCharacterLife,useCharacterLife} from '@/lib/game/character-life-store';
import {WorkerArtwork} from '@/components/moonwork/worker-artwork';
import {CharacterLifePortrait} from './character-life-portrait';
import {GothicModal} from './gothic-hud';
import './gothic-polish.css';

const SCENE_PALETTES={
  brook:{
    veil:'from-[#072f42d6] via-[#10354d8c] to-[#061626d9]',
    glow:'bg-[#68d8ef56]',ribbon:'border-cyan-300/40 text-cyan-100',symbol:'◈',
    roomDetail:'铜管休息区 · 水汽回廊',
  },
  fern:{
    veil:'from-[#143a30dd] via-[#2c4b3580] to-[#10271ce0]',
    glow:'bg-[#8ce1a34a]',ribbon:'border-emerald-200/50 text-emerald-100',symbol:'❀',
    roomDetail:'藤蔓书架 · 月光花房',
  },
  cinder:{
    veil:'from-[#4e2517dd] via-[#5d38227b] to-[#251114ea]',
    glow:'bg-[#ff9a515c]',ribbon:'border-amber-200/50 text-amber-100',symbol:'⚒',
    roomDetail:'炉火台 · 黄铜修理间',
  },
} as const;

export function WorkerPrivateRoom({id,onClose,working}:{
  id:WorkerCharacterId;onClose:()=>void;working:boolean;
}){
  const profile=CHARACTER_PROFILES[id];
  const scene=WORKER_DIALOGUES[id];
  const palette=SCENE_PALETTES[id];
  const [selectedItem,setSelectedItem]=useState<RoomObjectId|null>(null);
  const [notice,setNotice]=useState('');
  const {status,progress}=useCharacterLife();
  const choice=progress.workerDecisions?.[id];
  const observed=progress.observations?.[id]??[];
  useEffect(()=>{
    if(status==='ok')commitCharacterLife({type:'visit',id});
  },[status,id]);

  const inspect=(item:RoomObjectId)=>{
    setSelectedItem(item);
    if(status!=='ok'){setNotice('此时无法保存人物观察，已有记录不会被覆盖。');return;}
    const result=commitCharacterLife({type:'inspect',id,item});
    setNotice(result==='applied'?'你记下了这个细节。':result==='duplicate'?'你曾经留意过这件物品。':'观察记录暂时无法保存。');
  };
  const answer=(value:WorkerChoice)=>{
    const result=commitCharacterLife({type:'worker-choice',id,choice:value});
    setNotice(result==='applied'?'这次交谈成为了你们共同的回忆。':result==='duplicate'?'你们已经谈过这件事。':'选择未能保存，原档不会被覆盖。');
  };
  const foundHint=observed.includes(scene.objects[0].id)&&observed.includes(scene.objects[1].id);

  return <GothicModal title={'拜访'+profile.name+'的房间'} closeLabel={'离开'+profile.name+'的房间'} onClose={onClose} wide>
    <div data-testid={'worker-private-room-'+id} className="min-w-0 w-full space-y-3">
      <header className="flex items-center justify-between gap-2 pr-8">
        <div>
          <p className="text-[10px] tracking-[.2em] text-gothic-gold">MOONLIGHT APARTMENT · PRIVATE SUITE</p>
          <h2 className="mt-1 text-xl text-gothic-ivory">{profile.name} · {scene.roomName}</h2>
        </div>
      </header>
      <div className={'relative h-[clamp(205px,35vh,315px)] overflow-hidden rounded-xl border border-gothic-brass/65 bg-[#120f1c]'}
        aria-label={profile.name+'的房间概念场景'}>
        <Image src={moonlitStreet} fill sizes="(max-width:700px) 92vw, 690px" alt=""
          className="object-cover object-[40%_42%] opacity-50" aria-hidden/>
        <div className={'pointer-events-none absolute inset-0 bg-gradient-to-r '+palette.veil}/>
        <div className={'pointer-events-none absolute left-[21%] top-[18%] size-[36%] rounded-full blur-3xl '+palette.glow}/>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-[#0d0b12f0] to-transparent"/>
        <span aria-hidden="true" className="pointer-events-none absolute left-[5%] top-[29%] text-[clamp(58px,11vw,110px)] leading-none text-[#e8cda84f]">{palette.symbol}</span>
        <div className="absolute bottom-0 right-[7%] h-[96%] w-[55%] max-w-[340px] origin-bottom motion-safe:animate-[room-breathe_5s_ease-in-out_infinite] motion-reduce:animate-none">
          <WorkerArtwork id={id} name={profile.name}/>
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1] max-w-[47%] space-y-2">
          <span className={'inline-block rounded-full border bg-[#14101acc] px-3 py-1 text-[10px] '+palette.ribbon}>{palette.roomDetail}</span>
          <p className="text-[11px] leading-5 text-[#f5ddc3]">{working?'正在工坊值守 · 屋内留着便条':'暂时休息 · 可以聊聊天'}</p>
        </div>
      </div>
      <p className="text-[10px] leading-5 text-gothic-muted">房间交互原型：人物使用现有透明精灵和环境绘景。三张独立正式高清室内原画仍待制作与替换。</p>
      {status!=='ok'&&<p role="alert" className="rounded-lg border border-rose-300/50 p-3 text-xs text-rose-200">
        {status==='corrupt'?'人物存档无法读取；已保留原记录，不会覆盖。':'浏览器暂时无法保存人物拜访记录。'}</p>}
      <section className="space-y-2" aria-label={profile.name+'的交谈'}>
        <h3 className="text-xs tracking-wider text-gothic-gold">与 {profile.name} 交谈</h3>
        <p className="rounded-lg border border-gothic-brass/35 bg-gothic-panel/85 px-3 py-3 text-sm leading-7"
          data-testid={'worker-room-dialogue-'+id}>{choice?scene.responses[choice]:scene.greeting}</p>
        {!choice&&<div className="grid gap-2 sm:grid-cols-2">
          {scene.choices.map(item=><button key={item.id} type="button"
            disabled={status!=='ok'}
            onClick={()=>answer(item.id)}
            data-testid={'worker-room-choice-'+id+'-'+item.id}
            className="min-h-11 rounded-lg border border-gothic-brass/60 bg-gothic-wine/50 p-3 text-left text-xs leading-5 hover:bg-gothic-wine focus-visible:outline-2 focus-visible:outline-gothic-glow disabled:opacity-50"
          >{item.label}</button>)}
        </div>}
      </section>
      <section className="space-y-2" aria-label="观察人物房间">
        <h3 className="text-xs tracking-wider text-gothic-gold">观察房间 · {observed.length}/{scene.objects.length}</h3>
        <div className="flex flex-wrap gap-2">
          {scene.objects.map(item=><button key={item.id} type="button"
            aria-pressed={selectedItem===item.id}
            onClick={()=>inspect(item.id)}
            className="min-h-10 rounded-full border border-gothic-brass/55 bg-gothic-panel/85 px-3 text-xs hover:border-gothic-glow aria-pressed:bg-gothic-wine"
          >{observed.includes(item.id)?'✦ ':''}{item.label}</button>)}
        </div>
        {selectedItem&&<p data-testid={'worker-room-object-'+id} className="rounded-lg bg-gothic-wine/35 p-3 text-xs leading-6">
          {scene.objects.find(item=>item.id===selectedItem)?.text}</p>}
        {foundHint&&<p role="status" data-testid={'worker-room-secret-'+id}
          className="rounded-lg border border-gothic-gold/40 bg-[#422e2bc9] p-3 text-xs leading-6 text-gothic-ivory">✧ 隐藏观察：{scene.whisper}</p>}
        {notice&&<p className="text-[11px] text-gothic-muted" role="status">{notice}</p>}
      </section>
      <CharacterLifePortrait id={id} activity={working?'在工坊工作':'目前休息中'}/>
    </div>
  </GothicModal>;
}
