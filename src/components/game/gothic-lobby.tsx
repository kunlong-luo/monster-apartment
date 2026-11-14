'use client';

import Link from 'next/link';
import {BookOpen,DoorOpen,Mail,MoonStar,Orbit} from 'lucide-react';
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
import {GAME_UI_RELEASE} from '@/core/game-release';
import {GothicLobbyResidents} from './gothic-lobby-residents';
import {GothicLobbyContracts} from './gothic-lobby-contracts';
import {GothicLobbyDestinations} from './gothic-lobby-destinations';
import './gothic-lobby.css';
import './gothic-polish.css';
import './gothic-reference-layout.css';
import './gothic-lobby-navigation.css';

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
  const [accepting,setAccepting]=useState(false);
  const accept=async()=>{
    if(accepting)return;
    setAccepting(true);
    const result=await commitWorldAction(
      window.localStorage,'accept',navigator.locks,
      ()=>window.dispatchEvent(new Event(CHANGE_EVENT))
    );
    setDialogue(result==='applied'
      ?'契约已经成立。记得查看交付期限，别让我失望。'
      :result==='unavailable'
        ?'当前无法安全写入存档，请使用支持 Web Locks 的浏览器。'
        :'现在还无法接受这份委托，请先完成普通订单。');
    setAccepting(false);
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
    <GothicLobbyResidents/>

    <GothicLobbyContracts
      orderReady={orderReady} orderTarget={orderTarget} orderStock={orderStock}
      orderProgress={orderProgress} firstContract={firstContract}
      collectionStatus={collectionStatus} tickets={gacha.tickets}
      ownedContractCount={ownedContractCount}/>

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
    <GothicLobbyDestinations onOpenMemories={()=>setOpen('memories')}/>

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
      label="主要游戏功能" activeHref="/" compact className="gothic-dock--r12"/>

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
          {world.patron?.status==='offered'&&<button type="button" onClick={accept} disabled={accepting}
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
