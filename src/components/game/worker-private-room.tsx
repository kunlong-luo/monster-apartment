'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {useRoomStageSize} from './use-room-stage-size';
import {RoomArtLocalPreviewPanel,useRoomArtLocalPreview} from './room-art-local-preview';
import {CHARACTER_PROFILES,WORKER_DIALOGUES} from '@/core/character-life';
import type {WorkerCharacterId,RoomObjectId,WorkerChoice} from '@/core/character-life';
import {commitCharacterLife,useCharacterLife} from '@/lib/game/character-life-store';
import {CharacterLifePortrait} from './character-life-portrait';
import {GothicModal} from './gothic-hud';
import {RoomSceneHotspots} from './room-scene-hotspots';
import {RoomSceneBackdrop} from './room-scene-backdrop';
import {RoomResidentSprite} from './room-resident-sprite';
import {RoomSceneFocus} from './room-scene-focus';
import {RoomConversationTopics} from './room-conversation-topics';
import {RoomDialogueTheater} from './room-dialogue-theater';
import {dialogueBeats,roomDialogueBeatPose,roomObjectPose,roomTopicPose} from '@/core/room-performance';
import type {RoomPose} from '@/core/room-performance';
import type {RoomConversationTopic} from '@/core/room-conversations';
import {roomSceneReaction} from '@/core/room-scene-reactions';
import './gothic-polish.css';

const SCENE_PALETTES={
  brook:{ribbon:'border-cyan-300/40 text-cyan-100',roomDetail:'铜管休息区 · 水汽回廊'},
  fern:{ribbon:'border-emerald-200/50 text-emerald-100',roomDetail:'藤蔓书架 · 月光花房'},
  cinder:{ribbon:'border-amber-200/50 text-amber-100',roomDetail:'炉火台 · 黄铜修理间'},
} as const;

export function WorkerPrivateRoom({id,onClose,working}:{
  id:WorkerCharacterId;onClose:()=>void;working:boolean;
}){
  const stageRef=useRef<HTMLDivElement>(null);
  const stageSize=useRoomStageSize(stageRef);
  const artReview=useRoomArtLocalPreview();
  const profile=CHARACTER_PROFILES[id];
  const scene=WORKER_DIALOGUES[id];
  const palette=SCENE_PALETTES[id];
  const [selectedItem,setSelectedItem]=useState<RoomObjectId|null>(null);
  const [reaction,setReaction]=useState('');
  const [pose,setPose]=useState<RoomPose>('idle');
  const [theater,setTheater]=useState<RoomConversationTopic|null>(null);
  const [notice,setNotice]=useState('');
  const {status,progress}=useCharacterLife();
  const choice=progress.workerDecisions?.[id];
  const observed=progress.observations?.[id]??[];
  useEffect(()=>{
    if(status==='ok')commitCharacterLife({type:'visit',id});
  },[status,id]);

  const inspect=(item:RoomObjectId)=>{
    setSelectedItem(item);
    setReaction(roomSceneReaction(id,item));
    setPose(roomObjectPose(id,item));
    if(status!=='ok'){setNotice('此时无法保存人物观察，已有记录不会被覆盖。');return;}
    const result=commitCharacterLife({type:'inspect',id,item});
    setNotice(result==='applied'?'你记下了这个细节。':result==='duplicate'?'你曾经留意过这件物品。':'观察记录暂时无法保存。');
  };
  const answer=(value:WorkerChoice)=>{
    setPose(value==='care'?'warm':'attentive');
    const result=commitCharacterLife({type:'worker-choice',id,choice:value});
    setNotice(result==='applied'?'这次交谈成为了你们共同的回忆。':result==='duplicate'?'你们已经谈过这件事。':'选择未能保存，原档不会被覆盖。');
  };
  const foundHint=observed.includes(scene.objects[0].id)&&observed.includes(scene.objects[1].id);
  const shownPose=artReview.enabled&&artReview.selectedPose?artReview.selectedPose:pose;

  return <GothicModal title={'拜访'+profile.name+'的房间'} closeLabel={'离开'+profile.name+'的房间'} onClose={onClose} wide immersive>
    <div data-testid={'worker-private-room-'+id} data-room-layout="scenic-left-rail-right" className="min-w-0 w-full space-y-2">
      <div data-testid="room-scenic-layout" className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,2.2fr)_minmax(280px,.9fr)] lg:items-start">
      <div className="min-w-0 space-y-2">
      <div data-testid="worker-room-stage" className="relative h-[clamp(390px,68dvh,720px)] overflow-hidden rounded-xl border border-[#b993688c] bg-[#120f1c] shadow-[0_16px_48px_#0009,inset_0_1px_#e9cfa523]"
        aria-label={profile.name+'的房间概念场景'} ref={stageRef}>
        <RoomSceneBackdrop id={id} previewUrl={artReview.backgroundUrl}
          cinematicPose={theater&&!working?pose:null}/>
        <RoomResidentSprite id={id} name={profile.name} working={working} reaction={reaction}
          pose={shownPose} previewBackground={Boolean(artReview.backgroundUrl)}
          previewPoseUrl={artReview.enabled?artReview.poseUrls[shownPose]??null:null}/>
        <RoomSceneFocus id={id} item={selectedItem} pose={pose} stageSize={stageSize}/>
        <RoomSceneHotspots characterName={profile.name} roomId={id} items={scene.objects} stageSize={stageSize}
          observed={observed} selected={selectedItem} onInspect={inspect}
          description={scene.objects.find(item=>item.id===selectedItem)?.text}/>
        {theater&&!working&&<RoomDialogueTheater key={theater.id} name={profile.name}
          title={theater.title} response={theater.response}
          basePose={roomTopicPose(id,theater.id)} onBeatPose={setPose}
          onClose={()=>{setTheater(null);setPose('idle');}}/>}
        <header className="pointer-events-none absolute left-4 top-4 z-[5] max-w-[min(54%,340px)] text-shadow-md sm:left-6 sm:top-6">
          <span className="text-[9px] font-medium uppercase tracking-[.24em] text-[#e7c294]">PRIVATE SUITE / {profile.name}</span>
          <h2 className="mt-2 font-serif text-xl leading-tight tracking-[.04em] text-[#ffe7c5] sm:text-2xl">{scene.roomName}</h2>
          <p className="mt-2 hidden max-w-[29ch] text-xs leading-6 text-[#ead3bf] sm:block">{scene.roomSummary}</p>
        </header>
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1] max-w-[48%] sm:bottom-5 sm:left-5">
          <p className={'inline-block rounded border border-[#cba77b77] bg-[#180e1cc9] px-2.5 py-1.5 text-[10px] leading-4 '+palette.ribbon}>{working?'工坊值守 · 留言中':palette.roomDetail}</p>
        </div>
      </div>
      <RoomArtLocalPreviewPanel id={id} name={profile.name} review={artReview}
        warning="当前仍使用概念版调查热点坐标；新背景的物件定位须在仓库外单独标注并审核，不能据此预览判断正式热点。"/>
      </div>
      <div data-testid="room-story-rail" className="min-w-0 space-y-4 rounded-xl border border-[#b38d6860] bg-[linear-gradient(170deg,#261724ed,#140d18f2)] p-3 shadow-[inset_0_1px_#f4d6ad20] lg:max-h-[min(68dvh,720px)] lg:overflow-y-auto lg:pr-3 [scrollbar-color:#95755d_#25151f] [scrollbar-width:thin]">
      {status!=='ok'&&<p role="alert" className="rounded-lg border border-rose-300/50 p-3 text-xs text-rose-200">
        {status==='corrupt'?'人物存档无法读取；已保留原记录，不会覆盖。':'浏览器暂时无法保存人物拜访记录。'}</p>}
      <section className="space-y-2" aria-label={profile.name+'的交谈'}>
        <h3 className="text-xs tracking-wider text-gothic-gold">{working?'房间留言与回忆':'与 '+profile.name+'交谈'}</h3>
        <p className="rounded-lg border border-gothic-brass/35 bg-gothic-panel/85 px-3 py-3 text-sm leading-7"
          data-testid={'worker-room-dialogue-'+id}>
          {working?(choice?'你想起上次交谈时，'+scene.responses[choice]:'目前无人应答；仍可调查物件。等工匠休息后再当面交谈。'):
            choice?scene.responses[choice]:scene.greeting}
        </p>
        {working&&!choice&&<p className="text-[11px] leading-6 text-gothic-muted">
          可以前往 <Link href="/workshop/" className="underline decoration-gothic-brass underline-offset-4 hover:text-gothic-glow">工坊</Link> 查看排班。人物同一时间只出现在一处。
        </p>}
        {!choice&&!working&&<div className="grid gap-2 sm:grid-cols-2">
          {scene.choices.map(item=><button key={item.id} type="button"
            disabled={status!=='ok'}
            onClick={()=>answer(item.id)}
            data-testid={'worker-room-choice-'+id+'-'+item.id}
            className="min-h-11 rounded-lg border border-gothic-brass/60 bg-gothic-wine/50 p-3 text-left text-xs leading-5 hover:bg-gothic-wine focus-visible:outline-2 focus-visible:outline-gothic-glow disabled:opacity-50"
          >{item.label}</button>)}
        </div>}
      </section>
      <RoomConversationTopics id={id} observed={observed} working={working} cinematicActive={Boolean(theater)}
        onSpeak={topic=>{
          const base=roomTopicPose(id,topic.id);
          setPose(roomDialogueBeatPose(base,0,dialogueBeats(topic.response).length));
          setReaction('你们谈起了与这间房有关的往事。');
          setTheater(topic);
          stageRef.current?.scrollIntoView({block:'center',behavior:'auto'});
        }}/>
      <section className="space-y-2" aria-label="观察人物房间">
        <h3 className="text-xs tracking-wider text-gothic-gold">房间观察 · 在画面中选择感兴趣的物件</h3>
        {selectedItem&&<p data-testid={'worker-room-object-'+id} className="rounded-lg bg-gothic-wine/35 p-3 text-xs leading-6">
          {scene.objects.find(item=>item.id===selectedItem)?.text}</p>}
        {foundHint&&<p role="status" data-testid={'worker-room-secret-'+id}
          className="rounded-lg border border-gothic-gold/40 bg-[#422e2bc9] p-3 text-xs leading-6 text-gothic-ivory">✧ 隐藏观察：{scene.whisper}</p>}
        {notice&&<p className="text-[11px] text-gothic-muted" role="status">{notice}</p>}
      </section>
      </div>
      </div>
      <details data-testid="room-character-archive" className="group rounded-lg border border-[#ad885f50] bg-[#170e1ae6] px-3 py-2.5">
        <summary className="cursor-pointer select-none py-1 text-xs tracking-[.1em] text-[#e8c99e] focus-visible:outline-2 focus-visible:outline-[#e8c99e]">人物档案与能力 <span className="ml-2 text-[#a68b76] group-open:hidden">· 展开查看</span></summary>
        <div className="mt-3"><CharacterLifePortrait id={id} activity={working?'在工坊工作':'目前休息中'}/></div>
      </details>
    </div>
  </GothicModal>;
}
