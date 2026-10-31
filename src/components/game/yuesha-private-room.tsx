'use client';
import {useEffect,useRef,useState} from 'react';
import {useRoomStageSize} from './use-room-stage-size';
import {RoomArtLocalPreviewPanel,useRoomArtLocalPreview} from './room-art-local-preview';
import {yueshaAfterChoice} from '@/core/character-life';
import {roomInvestigationConclusion} from '@/core/room-investigation';
import type {YueshaChoice} from '@/core/character-life';
import {commitCharacterLife,useCharacterLife} from '@/lib/game/character-life-store';
import {CharacterLifePortrait} from './character-life-portrait';
import {RoomSceneHotspots} from './room-scene-hotspots';
import {RoomSceneBackdrop} from './room-scene-backdrop';
import {RoomResidentSprite} from './room-resident-sprite';
import {RoomSceneFocus} from './room-scene-focus';
import {RoomScenicViewToggle} from './room-scenic-view-toggle';
import {RoomArtAnchorEditor} from './room-art-anchor-editor';
import {RoomArtPropPreview} from './room-art-prop-preview';
import {RoomConversationTopics} from './room-conversation-topics';
import {YueshaMemoryShelf} from './yuesha-memory-shelf';
import {RoomDialogueTheater} from './room-dialogue-theater';
import {dialogueBeats,roomDialogueBeatPose,roomObjectPose,roomTopicPose} from '@/core/room-performance';
import type {RoomPose} from '@/core/room-performance';
import type {RoomConversationTopic} from '@/core/room-conversations';
import {roomSceneReaction,yueshaRoomEasterEgg} from '@/core/room-scene-reactions';
type Hotspot='seal'|'tea'|'ledger';
export function YueshaPrivateRoom({guests,happiness}:{guests:number;happiness:number}){
  const stageRef=useRef<HTMLDivElement>(null);
  const stageSize=useRoomStageSize(stageRef);
  const artReview=useRoomArtLocalPreview();
  const [hotspot,setHotspot]=useState<Hotspot|null>(null);
  const [reaction,setReaction]=useState('');
  const [pose,setPose]=useState<RoomPose>('idle');
  const [theater,setTheater]=useState<RoomConversationTopic|null>(null);
  const [feedback,setFeedback]=useState('');
  // Ephemeral view mode never touches the life/room save or changes investigation state.
  const [scenicMode,setScenicMode]=useState(false);
  const shownPose=artReview.enabled&&artReview.selectedPose?artReview.selectedPose:pose;
  const candidatePreview=Boolean(artReview.enabled&&artReview.backgroundUrl);
  const anchorEditing=candidatePreview&&artReview.anchorEditing;
  const {status,progress}=useCharacterLife();
  const choice=progress.decisions['yuesha-first-visit'];
  const observed=progress.observations?.yuesha??[];
  useEffect(()=>{if(status==='ok')commitCharacterLife({type:'visit',id:'yuesha'});},[status]);
  const inspect=(item:Hotspot)=>{
    setHotspot(item);
    setReaction(roomSceneReaction('yuesha',item));
    setPose(roomObjectPose('yuesha',item));
    const result=commitCharacterLife({type:'inspect',id:'yuesha',item});
    setFeedback(result==='applied'?'你记下了这段细节。':result==='duplicate'?'这个物品你已经仔细看过了。':'人物观察记录暂时无法保存。');
  };
  const discuss=(value:YueshaChoice)=>{
    setPose(value==='transparent'?'warm':'attentive');
    const result=commitCharacterLife({type:'yuesha-choice',choice:value});
    setFeedback(result==='applied'?'月纱记住了你的选择。':result==='duplicate'?'这段初次谈话已经记录。':'人物档案无法写入，原存档未被覆盖。');
  };
  const revisit=(item:Hotspot)=>{
    // A replay is a presentation action, not another write to the lore save.
    if(!observed.includes(item))return;
    setHotspot(item);
    setReaction(roomSceneReaction('yuesha',item));
    setPose(roomObjectPose('yuesha',item));
    setFeedback('已重温这段收录的记忆。');
    stageRef.current?.scrollIntoView({block:'center',behavior:'auto'});
  };
  return <div className="min-w-0 flex-1 space-y-2" data-testid="yuesha-private-room"
    data-room-layout="scenic-left-rail-right" data-room-view={scenicMode?'scenic':'story'}>
    <div data-testid="room-scenic-layout" className={'grid min-w-0 gap-3 lg:items-start '+
      (scenicMode?'lg:grid-cols-1':'lg:grid-cols-[minmax(0,3fr)_minmax(265px,1fr)]')}>
    <div className="min-w-0 space-y-2">
    <div className={'relative h-[clamp(390px,68dvh,720px)] lg:aspect-video lg:h-auto overflow-hidden rounded-xl border border-gothic-brass/60 bg-gothic-night shadow-[0_16px_48px_#0009,inset_0_1px_#e9cfa523] '}
      data-testid="yuesha-room-stage" ref={stageRef}>
      <RoomScenicViewToggle scenic={scenicMode} blocked={Boolean(theater)} onToggle={()=>setScenicMode(previous=>!previous)}/>
      <RoomSceneBackdrop id="yuesha" scenic={scenicMode} previewUrl={artReview.backgroundUrl}
        cinematicPose={theater?pose:null}/>
      {!anchorEditing&&<RoomResidentSprite id="yuesha" name="月纱" reaction={scenicMode?"":reaction} pose={shownPose} previewBackground={Boolean(artReview.backgroundUrl)} previewPoseUrl={artReview.enabled?artReview.poseUrls[shownPose]??null:null}/>}
      {candidatePreview&&<RoomArtPropPreview stageSize={stageSize}
        anchors={artReview.anchorDraft} art={artReview.propArtwork}/>}
      {!candidatePreview&&<RoomSceneFocus id="yuesha" scenic={scenicMode} item={hotspot} pose={pose} stageSize={stageSize}/>}
      {!candidatePreview&&<RoomSceneHotspots scenic={scenicMode} characterName="月纱" roomId="yuesha" stageSize={stageSize}
        items={[{id:'seal',label:'月纹蜡封'},{id:'tea',label:'香料茶杯'},{id:'ledger',label:'旧账簿'}]}
        selected={hotspot} observed={observed} onInspect={inspect}
        description={hotspot==='seal'?'蜡封上的月纹，与旧公寓钥匙的纹样有些相似。月纱没有立即回答你的疑问。':
          hotspot==='tea'?'杯里有桂皮与温暖的香气。月纱说，做生意之前应该先好好喝一杯茶。':
          hotspot==='ledger'?'账簿封面有多年前的磨损痕迹。里面记着什么，目前还不能公开。':undefined}/>}
      {anchorEditing&&<RoomArtAnchorEditor stageSize={stageSize} selected={artReview.selectedAnchor}
        draft={artReview.anchorDraft} onPlace={artReview.placeAnchor}/>}
      {theater&&<RoomDialogueTheater key={theater.id} name="月纱" title={theater.title}
        response={theater.response} basePose={roomTopicPose('yuesha',theater.id)}
        onBeatPose={setPose} onClose={()=>{setTheater(null);setPose('idle');}}/>}
      <header className={"pointer-events-none absolute left-4 top-4 z-[5] max-w-[52%] text-shadow-md sm:left-6 sm:top-6"+(scenicMode?" lg:hidden":"")+(candidatePreview?" hidden":"")}>
        <span className="text-[9px] font-medium uppercase tracking-[.24em] text-[#e7c294]">PRIVATE SUITE / 月纱</span>
        <h3 className="mt-2 font-serif text-xl leading-tight tracking-[.04em] text-[#ffe7c5] sm:text-2xl">契约会客室</h3>
        <p className="mt-2 hidden text-xs leading-6 text-[#ead3bf] sm:block">月纹、旧契约和一杯香料茶</p>
      </header>
    </div>
      <RoomArtLocalPreviewPanel id="yuesha" name="月纱" review={artReview}/>

    </div>
    <div data-testid="room-story-rail" className={'min-w-0 space-y-4 rounded-xl border border-gothic-brass/40 bg-gothic-panel/90 p-3 lg:max-h-[min(68dvh,720px)] lg:overflow-y-auto lg:pr-3 [scrollbar-width:thin] '+(scenicMode?'lg:hidden':'')}>
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#ad89644a] bg-[#211520b8] px-3 py-2 text-xs" data-testid="yuesha-living-state">
      <span>今夜心情：{happiness>=70?'安心':'牵挂邻居'}</span>
      <span>公寓现住 {guests} 位邻居</span>
      <span>与你的关系：{choice==='transparent'?'认可公开负责':choice==='careful'?'认可谨慎守约':'初识 · 保持距离'}</span>
    </div>
    {status!=='ok'&&<p role="alert" data-testid="character-life-error" className="rounded-lg border border-[#b37f82] p-3 text-xs text-[#ffc5c5]">
      {status==='corrupt'?'人物档案存档损坏：已保留原数据，不会自动覆盖。':'浏览器未允许持久保存人物档案，本次无法记录选择。'}
    </p>}
    <div className="space-y-2">
      <span className="block text-xs text-[#f0c58e]">月纱的私人话题 · 选择一次，之后可以重访回忆</span>
      <p className="rounded-lg border border-[#ac886c55] bg-[#241520c7] px-3 py-2 text-sm leading-7 text-[#f4dcc8]"
        data-testid="yuesha-dialogue">{yueshaAfterChoice(choice)}</p>
      {!choice&&<div className="grid gap-2 sm:grid-cols-2">
        <button type="button" disabled={status!=='ok'} onClick={()=>discuss('transparent')}
          className="min-h-11 rounded-lg border border-[#a68a6b] bg-[#463140bd] px-3 py-2 text-left text-xs leading-5 hover:bg-[#634250] disabled:opacity-50"
          data-testid="yuesha-choice-transparent">“先把真实的合同与影响告诉东街。”</button>
        <button type="button" disabled={status!=='ok'} onClick={()=>discuss('careful')}
          className="min-h-11 rounded-lg border border-[#a68a6b] bg-[#463140bd] px-3 py-2 text-left text-xs leading-5 hover:bg-[#634250] disabled:opacity-50"
          data-testid="yuesha-choice-careful">“先稳定工坊生产，再作公开承诺。”</button>
      </div>}
      {choice&&<p className="text-[11px] text-[#f0c58e]">已记录的观点：{choice==='transparent'?'透明公开优先':'稳健交付优先'}。这是人物故事选择，不会直接修改订单和仓库。</p>}
      {feedback&&<p role="status" className="text-xs text-[#ebc79c]">{feedback}</p>}
    </div>
    <RoomConversationTopics id="yuesha" observed={observed} cinematicActive={Boolean(theater)}
      onSpeak={topic=>{
        const base=roomTopicPose('yuesha',topic.id);
          setPose(roomDialogueBeatPose(base,0,dialogueBeats(topic.response).length));
        setReaction('“原来你也在意这段往事。”月纱微笑着看向你。');
        setTheater(topic);
        stageRef.current?.scrollIntoView({block:'center',behavior:'auto'});
      }}/>
    <div className="space-y-2">
      <span className="text-xs text-[#f0c58e]">月纱的藏品 · 点击场景里的物品，查看她留下的线索</span>
      {observed.length>0&&<p className="text-[10px] text-gothic-muted">已记录 {observed.length}/3 件会客室物品</p>}
      {hotspot&&<p className="rounded-lg bg-[#382433a1] p-3 text-xs leading-6 text-[#f2d2b5]" data-testid="yuesha-hotspot-text">
        {hotspot==='seal'?'蜡封上的月纹，与旧公寓钥匙的纹样有些相似。月纱没有立即回答你的疑问。':
          hotspot==='tea'?'杯里有桂皮与温暖的香气。月纱说，做生意之前应该先好好喝一杯茶。':
          '账簿封面有多年前的磨损痕迹。里面记着什么，目前还不能公开。'}
      </p>}
    </div>
    {yueshaRoomEasterEgg(observed,choice)&&<p role="status" data-testid="yuesha-room-easter-egg"
      className="rounded-xl border border-[#dfb98690] bg-[#462439dc] px-4 py-3 text-xs leading-7 text-[#ffe3be]">
      ✦ 杯垫背面的密语 · {yueshaRoomEasterEgg(observed,choice)}
    </p>}
    {roomInvestigationConclusion(progress)&&<p data-testid="yuesha-four-room-memory"
      className="rounded-xl border border-[#d9a96880] bg-[#392633de] px-4 py-3 text-xs leading-7 text-[#ffe0b4]">
      ✦ 月纱翻开一本还未寄出的调查册：{roomInvestigationConclusion(progress)}
    </p>}
    </div>
    </div>
    <YueshaMemoryShelf progress={progress} onRevisit={revisit}/>
    <details data-testid="room-character-archive" className="group rounded-lg border border-[#ad885f50] bg-[#170e1ae6] px-3 py-2.5">
      <summary className="cursor-pointer select-none py-1 text-xs tracking-[.1em] text-[#e8c99e] focus-visible:outline-2 focus-visible:outline-[#e8c99e]">人物档案与能力 <span className="ml-2 text-[#a68b76] group-open:hidden">· 展开查看</span></summary>
      <div className="mt-3"><CharacterLifePortrait id="yuesha"/></div>
    </details>
  </div>;
}
