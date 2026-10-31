'use client';

import Link from 'next/link';
import {ArrowUpRight,BookOpen,ChevronRight,Crown,DoorOpen,Mail,MoonStar,Orbit,ScrollText} from 'lucide-react';
import {ReliableImage as Image} from '@/components/game/reliable-image';
import {AnimatePresence} from 'motion/react';
import {useMemo,useState} from 'react';
import {useWorkshopWorld} from '@/components/moonwork/world-save-react';
import moonveilAvatar from '../../../public/art/yuesha-avatar-v3.webp';
import moonveilBust from '../../../public/art/yuesha-bust-v3.webp';
import lobbyHero from '../../../public/art/lobby-hero-v3.webp';
import lobbyHeroBackup from '../../../public/art/lobby-hero-v2.webp';
import {newWorkshop} from '../../../v2/src/workshop-engine';
import {CHANGE_EVENT,commitWorldAction} from '@/lib/moonwork/world-store';
import {GothicAtmosphere} from './gothic-atmosphere';
import {GothicSceneIllumination} from './gothic-scene-illumination';
import {useGothicMotion} from '@/lib/game/gothic-motion';
import {GothicDock,GothicIconButton,GothicResourcePill,GothicModal,GothicPanelLink} from './gothic-hud';
import {WORLD_NAV} from '@/components/moonwork/world-navigation';
import {useGacha} from '@/lib/summon/use-gacha';
import {useCharacterCollection} from '@/lib/game/character-collection-store';
import {HEROINE_FACE_ART} from '@/components/summon/heroine-portrait-assets';
import {GAME_UI_RELEASE} from '@/core/game-release';
import './gothic-lobby.css';
import './gothic-polish.css';
import './gothic-reference-layout.css';

type Panel='profile'|'bond'|'updates'|'memories'|null;

export function GothicLobby(){
  const saved=useWorkshopWorld();
  const world=useMemo(()=>saved??newWorkshop(),[saved]);
  const orderTarget=Math.max(1,world.order.cores);
  const orderStock=world.warehouse.core;
  const orderProgress=Math.round(Math.min(100,Math.max(0,orderStock/orderTarget*100)));
  const orderReady=orderStock>=orderTarget;
  const [panel,setPanel]=useState<Panel>(null);
  const {state:gacha}=useGacha();
  const {collection,status:collectionStatus}=useCharacterCollection();
  const ownedContractCount=new Set(collection.draws).size;
  const firstContract=collectionStatus==='ok'&&gacha.totalSummons===0&&collection.draws.length===0;
  const [dialogue,setDialogue]=useState('');
  const {reduced:reducedMotion,toggle:toggleMotion}=useGothicMotion();
  const setOpen=(name:Panel)=>setPanel(existing=>existing===name?null:name);
  const talk=()=>{
    setPanel('bond');
    setDialogue(world.patron?.status==='offered'
      ?'你的第一批晶核已经准备好了吗？我的特别委托需要认真安排。'
      :'欢迎来到夜色公寓。我是月纱。先经营好工坊，交付第一批委托，我们就会有更多故事。');
  };
  const accept=()=>{
    const result=commitWorldAction(window.localStorage,'accept');
    if(result==='applied'){
      window.dispatchEvent(new Event(CHANGE_EVENT));
      setDialogue('契约已经成立。记得查看交付期限，别让我失望。');
    }else setDialogue('现在还无法接受这份委托，请先完成普通订单。');
  };
  const close=()=>setPanel(null);
  const moveLight=(event:React.PointerEvent<HTMLElement>)=>{
    if(reducedMotion||event.pointerType!=='mouse')return;
    const bounds=event.currentTarget.getBoundingClientRect();
    const dx=(event.clientX-bounds.left)/bounds.width-.5;
    const dy=(event.clientY-bounds.top)/bounds.height-.5;
    event.currentTarget.style.setProperty('--scene-x',Math.round(-dx*11)+'px');
    event.currentTarget.style.setProperty('--scene-y',Math.round(-dy*8)+'px');
  };
  const resetLight=(event:React.PointerEvent<HTMLElement>)=>{
    event.currentTarget.style.setProperty('--scene-x','0px');
    event.currentTarget.style.setProperty('--scene-y','0px');
  };
  return <main className={'gothic-lobby'+(reducedMotion?' gothic-lobby--still':'')}
    data-testid="gothic-lobby" aria-label="怪物公寓主大厅"
    onPointerMove={moveLight} onPointerLeave={resetLight}
    onKeyDown={event=>{if(event.key==='Escape')close();}}>
    <div className="gothic-lobby__stage" aria-hidden="true">
      <div className="gothic-lobby__fallback"/>
      <div className="gothic-lobby__painting">
        <Image src={lobbyHero} fallbackSrc={lobbyHeroBackup} fill sizes="100vw" priority unoptimized
          alt="" draggable={false} aria-hidden="true"
          data-testid="gothic-lobby-painting-image"
          className="select-none object-cover object-center"/>
      </div>
      <div className="gothic-lobby__light" aria-hidden="true" data-testid="gothic-light-layer"/>
      <div className="gothic-lobby__vignette"/>
      <div className="gothic-lobby__embers"/>
      <div className="gothic-lobby__mist" aria-hidden="true"/>
      <GothicSceneIllumination variant="lobby" paused={reducedMotion}/>
    </div>

    <GothicAtmosphere paused={reducedMotion}/>

    <div className="gothic-lobby__brand" aria-label="怪物公寓 · MONSTER APARTMENT">
      <MoonStar aria-hidden="true" className="gothic-lobby__brand-flourish" size={19} strokeWidth={1.4}/>
      <strong>怪物公寓</strong>
      <small data-testid="game-release">MONSTER APARTMENT · {GAME_UI_RELEASE}</small>
    </div>

    <header className="gothic-lobby__topbar absolute inset-x-0 top-0 z-[4] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-2 px-3 pt-3 sm:px-5 max-[840px]:grid-cols-[minmax(0,1fr)_auto]" aria-label="玩家与资源">
      <button type="button" className="flex min-h-12 w-max max-w-full items-center gap-2.5 bg-transparent text-left text-gothic-ivory focus-visible:outline-2 focus-visible:outline-gothic-glow"
        onClick={()=>setOpen('profile')} aria-label="打开玩家资料" aria-expanded={panel==='profile'}>
        <span className="gothic-lobby__avatar relative block size-[clamp(44px,4.4vw,73px)] shrink-0 overflow-hidden rounded-full border-2 border-[#e8c690] bg-[#362232] shadow-[0_0_0_3px_#171015bb,0_2px_18px_#0009]"><Image src={moonveilAvatar} alt="" fill unoptimized
          sizes="60px" className="gothic-lobby__avatar-image object-cover object-center"/></span>
        <span className="gothic-lobby__player-copy grid gap-1 whitespace-nowrap [text-shadow:0_2px_6px_#000]"><strong className="text-[clamp(13px,1.3vw,22px)] font-semibold">夜色蔷薇</strong><small className="text-[clamp(9px,.75vw,12px)] text-[#e3cbaa]">月光公寓 · 第 {world.day} 天</small></span>
      </button>
      <div className="flex items-center gap-1.5 pt-1 max-[840px]:col-span-2 max-[840px]:col-start-1 max-[840px]:row-start-2 max-[840px]:justify-center" aria-label="当前存档资源">
        <GothicResourcePill symbol="✦" amount={world.coins} label="星币" testId="lobby-coins"/>
        <GothicResourcePill symbol="◆" amount={world.warehouse.core} label="晶核" testId="lobby-cores"/>
      </div>
      <div className="gothic-lobby__top-actions flex justify-end gap-2 pt-1 max-[840px]:col-start-2 max-[840px]:row-start-1">
        <button type="button" onClick={()=>setOpen('updates')} aria-label="委托消息"
          aria-expanded={panel==='updates'} data-testid="gothic-commission-status"
          data-tooltip="查看本日委托"
          className="gothic-lobby__inbox">
          <Mail aria-hidden="true" size={17} strokeWidth={1.7}/>
          <span className="gothic-lobby__inbox-copy">委托<small>待交付 {Math.max(0,orderTarget-orderStock)} 枚</small></span>
        </button>
        <GothicIconButton label="切换动态特效" data-tooltip="切换动态特效" pressed={reducedMotion}
          onClick={toggleMotion}><Orbit aria-hidden="true" size={17} strokeWidth={1.7}/></GothicIconButton>
      </div>
    </header>

    {/* Design reference: four real residents in the LEFT portrait rail.
        These link to their existing rooms; no additional routes or invented status. */}
    <aside className="gothic-lobby__reference-roster" data-testid="gothic-design-roster"
      aria-label="公寓住客">
      <span className="gothic-lobby__reference-roster-title">公寓住客 <small>RESIDENTS</small></span>
      {([
        {id:'yuesha',name:'月纱',detail:'契约会客室'},
        {id:'brook',name:'泉泡',detail:'潮汐之室'},
        {id:'fern',name:'青枝',detail:'春芽之室'},
        {id:'cinder',name:'炽角',detail:'余烬之室'},
      ] as const).map(({id,name,detail})=>
        <Link href={id==='yuesha'?'/apartment/?visit=yuesha':'/characters/?visit='+id} key={id}
          className={'gothic-lobby__reference-resident'+(id==='yuesha'?' gothic-lobby__reference-resident--active':'')}
          data-testid={'gothic-resident-'+id}
          aria-label={'拜访'+name+'的私人房间'}>
          <Image src={HEROINE_FACE_ART[id]} alt="" width={52} height={52}
            sizes="52px" loading="eager" className="gothic-lobby__reference-avatar"/>
          <span><strong>{name}</strong><small>{detail}</small></span>
          <ChevronRight aria-hidden="true" size={15} strokeWidth={1.5}/>
        </Link>)}
    </aside>

    <section className="gothic-lobby__mission-rail" aria-label="当前主线与契约活动">
      <Link href={orderReady?'/orders/':'/workshop/'}
        aria-label={orderReady?'晶核已备齐，查看委托交期':'晶核不足，前往工坊生产'}
        data-testid="gothic-main-quest" className="gothic-lobby__mission-card gothic-lobby__mission-card--quest">
        <span className="gothic-lobby__card-kicker"><ScrollText className="gothic-lobby__card-icon" aria-hidden="true" size={15} strokeWidth={1.55}/>主线 · 月影之约 <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.7}/></span>
        <strong>{orderReady?'晶核已备齐 · 去委托核对交期':'与月纱一起筹备第一批晶核'}</strong>
        <span className="gothic-lobby__mission-detail">
          {orderReady?'下一步：确认交付和奖励':'去工坊生产 · 晶核 '+orderStock+' / '+orderTarget}
        </span>
        <span role="progressbar" aria-label="晶核收集进度"
          aria-valuemin={0} aria-valuemax={orderTarget}
          aria-valuenow={Math.min(orderStock,orderTarget)}
          data-testid="gothic-main-quest-progress"
          className="gothic-lobby__progress"><span style={{width:orderProgress+'%'}}/></span>
      </Link>
      <Link href="/characters/#summon-screen"
        className="gothic-lobby__mission-card gothic-lobby__mission-card--eclipse"
        data-testid="gothic-eclipse-feature" data-first-contract={firstContract?'true':'false'}
        aria-label={firstContract?'开始第一次契约召唤，收录你的人物卡':'前往契约召唤，收集更多人物'}>
        <span className="gothic-lobby__card-kicker"><Crown className="gothic-lobby__card-icon" aria-hidden="true" size={15} strokeWidth={1.55}/>{firstContract?'初次契约':'契约收藏'}
          <small className="gothic-lobby__chapter-mark" aria-hidden="true">月蚀誓约</small>
        </span>
        <span className="gothic-lobby__summon-illustration" aria-hidden="true">
          <Image src={moonveilBust} alt="" fill sizes="220px" className="object-cover object-[center_20%]"/>
        </span>
        <strong data-testid="lobby-summon-guide-title">{collectionStatus==='ok'?'神话 · 月蚀':'人物契约需检查'}</strong>
        <span className="gothic-lobby__mission-detail" data-testid="lobby-summon-guide-detail">
          {firstContract?`拥有 ${gacha.tickets} 张召唤券 · 开启初次契约`:
            `已收录 ${ownedContractCount}/5 · 剩余 ${gacha.tickets} 张召唤券`}
        </span>
        <span className="gothic-lobby__summon-verse">月下的誓言，等待命定之人。</span>
        <div className="gothic-lobby__contract-faces" aria-hidden="true">
          {(['yuesha','brook','fern','cinder'] as const).map(id=>
            <span key={id} className="gothic-lobby__contract-face">
              <Image src={HEROINE_FACE_ART[id]} alt="" width={39} height={39} sizes="39px" loading="eager"/>
            </span>)}
          <ChevronRight className="gothic-lobby__contract-arrow" aria-hidden="true" size={20} strokeWidth={1.6}/>
        </div>
      </Link>
    </section>

    <button type="button" className="gothic-lobby__character-hit absolute z-[1] border-0! bg-transparent! inset-[15%_46%_16%_20%] max-[700px]:inset-[22%_27%_24%_25%] cursor-pointer focus-visible:outline-2 focus-visible:outline-gothic-glow"
      onClick={talk} aria-label="与月纱互动" data-tooltip="与月纱互动"/>

    {/* One true speech interaction in the open space beside the heroine.
        Unlike a screenshot click map, it is accessible and backed by story state. */}
    <button type="button" className="gothic-lobby__dialogue-invite"
      data-testid="gothic-character-talk" onClick={talk} aria-label="与月纱交谈">
      <span className="gothic-lobby__dialogue-speaker">月纱 <small>MOONVEIL</small></span>
      <span>……你来了？</span><span>今晚，想听听我的故事吗？</span>
    </button>

    {/* Large illustrated destination tiles on the RIGHT, like approved art. */}
    <aside className="gothic-lobby__reference-right" data-testid="gothic-design-right"
      aria-label="公寓世界场景入口">
      <Link href="/workshop/" data-testid="gothic-reference-workshop"
        className="gothic-lobby__reference-postcard">
        <Image src={lobbyHero} fill alt="" sizes="320px" className="gothic-lobby__reference-postcard-img gothic-lobby__reference-postcard-img--workshop"/>
        <span><strong>工坊</strong><small>打造专属装备</small></span>
        <ChevronRight aria-hidden="true" size={18}/>
      </Link>
      <Link href="/town/" data-testid="gothic-reference-town"
        className="gothic-lobby__reference-postcard">
        <Image src={lobbyHeroBackup} fill alt="" sizes="320px" className="gothic-lobby__reference-postcard-img gothic-lobby__reference-postcard-img--town"/>
        <span><strong>月光街</strong><small>探索夜色街区</small></span>
        <ChevronRight aria-hidden="true" size={18}/>
      </Link>
      <button type="button" className="gothic-lobby__reference-postcard"
        onClick={()=>setOpen('memories')} data-testid="gothic-right-memories"
        aria-label="剧情回顾">
        <Image src={moonveilBust} fill alt="" sizes="320px" className="gothic-lobby__reference-postcard-img gothic-lobby__reference-postcard-img--gallery"/>
        <span><strong>剧情回顾</strong><small>重温她们的故事</small></span>
        <BookOpen aria-hidden="true" size={18}/>
      </button>
    </aside>

    {/* Mobile keeps the compact verified actions rather than desktop posters. */}
    <aside className="gothic-lobby__character-actions" aria-label="月纱人物互动">
      <button type="button" onClick={talk} aria-label="与月纱交谈" data-testid="gothic-character-talk-mobile">
        <Image src={moonveilAvatar} alt="" width={62} height={62} unoptimized/>
        <span>月纱<small>与她交谈</small></span>
      </button>
      <Link href="/apartment/?visit=yuesha" data-testid="gothic-character-room">
        <DoorOpen aria-hidden="true" size={25} strokeWidth={1.55} className="gothic-lobby__action-glyph"/>
        <span>拜访房间<small>探索她的秘密</small></span>
      </Link>
      <button type="button" className="gothic-lobby__desktop-action" onClick={()=>setOpen('memories')}
        data-testid="gothic-right-memories-mobile" aria-label="剧情回顾">
        <BookOpen aria-hidden="true" size={28} strokeWidth={1.4} className="gothic-lobby__action-glyph"/>
        <span>剧情回顾<small>重温公寓故事</small></span>
      </button>
    </aside>
    <div className="gothic-lobby__character-caption pointer-events-none absolute z-[1] bottom-[clamp(106px,16vh,158px)] left-1/2 flex -translate-x-1/2 flex-col items-center gap-0.5 text-[#f6d9b8] [text-shadow:0_3px_12px_#000]" aria-hidden="true"><span className="text-[13px] tracking-[.23em]">月纱</span><small className="text-[10px] text-[#d0b298]">暗夜公寓的女主人</small></div>



    <GothicDock items={WORLD_NAV.map(n=>({href:n.href,icon:n.glyph,label:n.label,ariaLabel:n.full,description:n.purpose}))}
      label="主要游戏功能" activeHref="/" compact className="gothic-dock--cinematic"/>

    <AnimatePresence mode="wait">
    {panel&&<GothicModal key={panel} title={panel==='bond'?'与月纱交谈':panel==='profile'?'玩家资料':panel==='memories'?'剧情回顾':'委托消息'}
      onClose={close} wide={panel==='bond'||panel==='memories'}>
      {panel==='bond'&&<div className="gothic-lobby__story-scene" data-testid="gothic-story-dialogue">
        <div className="gothic-lobby__story-visual gothic-lobby__story-visual--portrait">
          <Image src={moonveilBust} fallbackSrc={moonveilAvatar}
            alt="月纱的烛光肖像" fill unoptimized priority sizes="(max-width:640px) 90vw, 250px"
            className="gothic-lobby__story-painting"/>
          <span className="gothic-lobby__story-visual-signature">月纱 <small>月下契约</small></span>
        </div>
        <section className="gothic-lobby__story-content">
          <span className="gothic-lobby__story-eyebrow">MOONVEIL · PRIVATE AUDIENCE</span>
          <h2>今晚，想和我聊些什么？</h2>
          <span className="gothic-lobby__story-rule" aria-hidden="true"/>
          <p className="gothic-lobby__story-quote" role="status">“{dialogue||'月光街的灯已经亮起，我正在等你。'}”</p>
          {world.patron?.status==='offered'&&<button type="button" onClick={accept}
            className="gothic-lobby__story-accept">
            接受月纱的特别委托
          </button>}
          <GothicPanelLink href="/orders/">查看委托与契约 ›</GothicPanelLink>
        </section>
      </div>}
      {panel==='profile'&&<div className="min-w-0 flex-1 space-y-3 pr-5">
        <span className="text-[10px] tracking-widest text-gothic-gold">YOUR RESIDENCE</span>
        <h2 className="text-2xl font-semibold">夜色蔷薇</h2>
        <p className="text-sm leading-7 text-gothic-muted">第 {world.day} 天 · 星币 {world.coins} · 晶核 {world.warehouse.core}</p>
        <p className="text-sm leading-7 text-gothic-muted">累计交付 {world.completed} 单 · 街区互助 {world.residentsHelped??0} 次</p>
        <GothicPanelLink href="/workshop/">进入晶核工坊 ›</GothicPanelLink>
      </div>}
      {panel==='memories'&&<div className="gothic-lobby__story-scene" data-testid="gothic-memories-content">
        <div className="gothic-lobby__story-visual gothic-lobby__story-visual--scene">
          <Image src={lobbyHero} fallbackSrc={lobbyHeroBackup} fill unoptimized
            alt="月色下的哥特公寓绘景" sizes="(max-width:640px) 90vw, 260px"
            className="gothic-lobby__story-painting"/>
          <span className="gothic-lobby__story-visual-signature">月影之约 <small>公寓手记</small></span>
        </div>
        <section className="gothic-lobby__story-content">
          <span className="gothic-lobby__story-eyebrow">CHAPTER I · THE MOONLIT VOW</span>
          <h2>月影之约 · 公寓手记</h2>
          <span className="gothic-lobby__story-rule" aria-hidden="true"/>
          <p className="gothic-lobby__story-quote">你已在公寓度过 {world.day} 天，累计完成 {world.completed} 单委托，收录 {ownedContractCount} 位不同人物。</p>
          <p className="gothic-lobby__story-detail">{world.completed>0?'完成交付的回响已经写进契约簿。':'第一章的线索：准备晶核并履行委托，月纱才会讲述更多秘密。'}</p>
          <GothicPanelLink href="/apartment/?visit=yuesha">拜访月纱 · 继续故事 ›</GothicPanelLink>
        </section>
      </div>}
      {panel==='updates'&&<div className="min-w-0 flex-1 space-y-3 pr-5">
        <span className="text-[10px] tracking-widest text-gothic-gold">COMMISSION UPDATE</span>
        <h2 className="text-2xl font-semibold">今日委托</h2>
        <p className="text-sm leading-7 text-gothic-muted">第 {world.day} 天 · 需在第 {world.order.due} 天交付 {world.order.cores} 枚晶核。</p>
        <p className="text-sm leading-7 text-gothic-muted">库存 {world.warehouse.core} 枚 · 成功奖励 {world.order.reward} 星币。</p>
        <GothicPanelLink href="/orders/">管理委托 ›</GothicPanelLink>
      </div>}

    </GothicModal>}
    </AnimatePresence>

  </main>;
}
