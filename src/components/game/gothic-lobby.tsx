'use client';

import Link from 'next/link';
import Image from 'next/image';
import {AnimatePresence} from 'motion/react';
import {useMemo,useState} from 'react';
import {useWorkshopWorld} from '@/components/moonwork/world-save-react';
import moonveilAvatar from '../../../public/art/yuesha-avatar-v3.webp';
import moonveilBust from '../../../public/art/yuesha-bust-v3.webp';
import lobbyHero from '../../../public/art/lobby-hero-v3.webp';
import {newWorkshop} from '../../../v2/src/workshop-engine';
import {CHANGE_EVENT,commitWorldAction} from '@/lib/moonwork/world-store';
import {GothicAtmosphere} from './gothic-atmosphere';
import {GothicSceneIllumination} from './gothic-scene-illumination';
import {useGothicMotion} from '@/lib/game/gothic-motion';
import {GothicDock,GothicIconButton,GothicResourcePill,GothicModal,GothicPanelLink} from './gothic-hud';
import {WORLD_NAV} from '@/components/moonwork/world-navigation';
import './gothic-lobby.css';
import './gothic-polish.css';

type Panel='profile'|'bond'|'updates'|null;

export function GothicLobby(){
  const saved=useWorkshopWorld();
  const world=useMemo(()=>saved??newWorkshop(),[saved]);
  const orderTarget=Math.max(1,world.order.cores);
  const orderStock=world.warehouse.core;
  const orderProgress=Math.round(Math.min(100,Math.max(0,orderStock/orderTarget*100)));
  const orderReady=orderStock>=orderTarget;
  const [panel,setPanel]=useState<Panel>(null);
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
        <Image src={lobbyHero} fill sizes="100vw" priority unoptimized
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

    <header className="absolute inset-x-0 top-0 z-[4] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-2 px-3 pt-3 sm:px-5 max-[840px]:grid-cols-[minmax(0,1fr)_auto]" aria-label="玩家与资源">
      <button type="button" className="flex min-h-12 w-max max-w-full items-center gap-2.5 bg-transparent text-left text-gothic-ivory focus-visible:outline-2 focus-visible:outline-gothic-glow"
        onClick={()=>setOpen('profile')} aria-label="打开玩家资料" aria-expanded={panel==='profile'}>
        <span className="gothic-lobby__avatar relative block size-[clamp(44px,4.4vw,73px)] shrink-0 overflow-hidden rounded-full border-2 border-[#e8c690] bg-[#362232] shadow-[0_0_0_3px_#171015bb,0_2px_18px_#0009]"><Image src={moonveilAvatar} alt="" fill unoptimized
          sizes="60px" className="gothic-lobby__avatar-image object-cover object-center"/></span>
        <span className="gothic-lobby__player-copy grid gap-1 whitespace-nowrap [text-shadow:0_2px_6px_#000]"><strong className="text-[clamp(13px,1.3vw,22px)] font-semibold">夜色蔷薇</strong><small className="text-[clamp(9px,.75vw,12px)] text-[#e3cbaa]">月光公寓 · 第 {world.day} 天</small></span>
      </button>
      <div className="flex items-center gap-1.5 pt-1 max-[840px]:col-span-2 max-[840px]:col-start-1 max-[840px]:row-start-2 max-[840px]:justify-center" aria-label="当前存档资源">
        <GothicResourcePill symbol="✦" amount={world.coins} label="星币" testId="lobby-coins"/>
        <GothicResourcePill symbol="◆" amount={world.warehouse.core} label="晶核" testId="lobby-cores"/>
        <GothicResourcePill symbol="☾" amount={world.day} label="生产日"/>
      </div>
      <div className="flex justify-end gap-1.5 pt-1 max-[840px]:col-start-2 max-[840px]:row-start-1">
        <GothicIconButton label="委托消息" data-tooltip="委托消息" onClick={()=>setOpen('updates')}>✉</GothicIconButton>
        <GothicIconButton label="切换动态特效" data-tooltip="切换动态特效" pressed={reducedMotion}
          onClick={toggleMotion}>⚜</GothicIconButton>
      </div>
    </header>

    <aside className="absolute left-3 top-[17%] z-[2] flex max-w-[min(245px,37vw)] flex-col items-start gap-1.5 border-l border-gothic-gold/70 bg-[linear-gradient(90deg,#180d1dc7,transparent)] px-3 py-2.5 text-shadow-[0_2px_12px_#000] sm:left-6 sm:gap-2 sm:py-3"
      aria-label="剧情焦点">
      <span className="text-[9px] tracking-[.18em] text-gothic-muted">MOONLIGHT APARTMENT</span>
      <strong className="text-base leading-snug font-semibold tracking-wide text-gothic-ivory drop-shadow-[0_2px_8px_#000] sm:text-xl">月纱 · 夜色邀约</strong>
      <small className="hidden text-[11px] leading-relaxed text-gothic-muted sm:block">夜幕降临，她在大厅等你。</small>
      <button type="button" onClick={talk} aria-label="与月纱交谈"
        className="mt-1 rounded border border-gothic-brass/80 bg-[linear-gradient(125deg,#704b39c9,#25151fdb)] px-3 py-2 text-[11px] text-gothic-ivory shadow-[inset_0_1px_#ffdda831,0_4px_12px_#0008] transition-[border-color,transform] hover:translate-x-1 hover:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow motion-reduce:transition-none">
        开启对话 <span className="pl-2" aria-hidden="true">›</span>
      </button>
    </aside>



    <button type="button" className="gothic-lobby__character-hit absolute z-[1] border-0! bg-transparent! inset-[15%_46%_16%_20%] max-[700px]:inset-[22%_27%_24%_25%] cursor-pointer focus-visible:outline-2 focus-visible:outline-gothic-glow"
      onClick={talk} aria-label="与月纱互动" data-tooltip="与月纱互动"/>
    <div className="gothic-lobby__character-caption pointer-events-none absolute z-[1] bottom-[clamp(106px,16vh,158px)] left-1/2 flex -translate-x-1/2 flex-col items-center gap-0.5 text-[#f6d9b8] [text-shadow:0_3px_12px_#000]" aria-hidden="true"><span className="text-[13px] tracking-[.23em]">月纱</span><small className="text-[10px] text-[#d0b298]">暗夜公寓的女主人</small></div>

    <Link href="/orders/" aria-label="查看当前主线任务" data-testid="gothic-main-quest"
      className="group absolute bottom-[86px] left-3 z-[3] flex w-[min(310px,68vw)] items-center gap-2 rounded-lg border border-gothic-brass/55 border-l-2 border-l-gothic-gold/90 bg-[linear-gradient(105deg,#231625e8,#211622c7)] px-3 py-2.5 text-[11px] leading-snug text-gothic-ivory shadow-[0_5px_16px_#0009,inset_0_1px_#ffe0a21c] transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-gothic-glow hover:shadow-[0_7px_20px_#000a,0_0_14px_#edc99023] focus-visible:outline-2 focus-visible:outline-gothic-glow motion-reduce:transition-none sm:bottom-[106px] sm:left-6">
      <span className="shrink-0 text-base text-gothic-gold" aria-hidden="true">{orderReady?'✦':'◇'}</span>
      <span className="grid min-w-0 flex-1 gap-1.5">
        <span className="truncate font-medium tracking-[.045em]">
          {orderReady?'委托 · 备齐晶核，查看交期':'当前目标 · 生产晶核 '+orderStock+' / '+orderTarget}
        </span>
        <span role="progressbar" aria-label="晶核收集进度"
          aria-valuemin={0} aria-valuemax={orderTarget}
          aria-valuenow={Math.min(orderStock,orderTarget)}
          data-testid="gothic-main-quest-progress"
          className="block h-[3px] w-full overflow-hidden rounded-full bg-[#8e6b5357]">
          <span className={'block h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none '+(orderReady?'bg-[#abe1b5]':'bg-[#edc990]')}
            style={{width:orderProgress+'%'}}/>
        </span>
      </span>
      <span className="shrink-0 text-lg leading-none text-gothic-gold transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true">›</span>
    </Link>

    <GothicDock items={WORLD_NAV.map(n=>({href:n.href,icon:n.glyph,label:n.label,ariaLabel:n.full,description:n.purpose}))}
      label="主要游戏功能" activeHref="/" compact/>

    <AnimatePresence mode="wait">
    {panel&&<GothicModal key={panel} title={panel==='bond'?'与月纱交谈':panel==='profile'?'玩家资料':'委托消息'}
      onClose={close} wide={panel==='bond'}>
      {panel==='bond'&&<>
        <div className="relative hidden min-h-[210px] w-[125px] shrink-0 overflow-hidden rounded-md border border-gothic-brass/50 bg-gothic-panel sm:block">
          <Image src={moonveilBust} alt="月纱" fill unoptimized sizes="130px"
            className="object-cover object-[48%_45%]"/>
        </div>
        <div className="min-w-0 flex-1 space-y-2 pr-5">
          <span className="text-[10px] tracking-[.17em] text-gothic-gold">SPECIAL GUEST · 月纱</span>
          <h2 className="text-xl font-semibold leading-snug text-gothic-ivory sm:text-2xl">今晚，想和我聊些什么？</h2>
          <p role="status" className="text-sm leading-7 text-gothic-muted">“{dialogue||'月光街的灯已经亮起，我正在等你。'}”</p>
          {world.patron?.status==='offered'&&<button type="button" onClick={accept}
            className="mt-3 rounded-md border border-gothic-gold bg-gothic-wine/85 px-3 py-2.5 text-xs text-gothic-ivory transition-colors hover:border-gothic-glow hover:bg-gothic-wine focus-visible:outline-2 focus-visible:outline-gothic-glow">
            接受月纱的特别委托
          </button>}
          <div><GothicPanelLink href="/orders/">查看委托与契约 ›</GothicPanelLink></div>
        </div>
      </>}
      {panel==='profile'&&<div className="min-w-0 flex-1 space-y-3 pr-5">
        <span className="text-[10px] tracking-widest text-gothic-gold">YOUR RESIDENCE</span>
        <h2 className="text-2xl font-semibold">夜色蔷薇</h2>
        <p className="text-sm leading-7 text-gothic-muted">第 {world.day} 天 · 星币 {world.coins} · 晶核 {world.warehouse.core}</p>
        <p className="text-sm leading-7 text-gothic-muted">累计交付 {world.completed} 单 · 街区互助 {world.residentsHelped??0} 次</p>
        <GothicPanelLink href="/workshop/">进入晶核工坊 ›</GothicPanelLink>
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
