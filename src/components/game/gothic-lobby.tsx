'use client';

import Link from 'next/link';
import Image from 'next/image';
import {useMemo,useState,useSyncExternalStore} from 'react';
import moonveilPortrait from '../../../v2/art/moonveil-portrait.avif';
import workshopPainting from '../../../v2/art/moon-workshop.avif';
import {newWorkshop} from '../../../v2/src/workshop-engine';
import {SAVE_KEY,CHANGE_EVENT,parseSavedWorld,commitWorldAction} from '@/lib/moonwork/world-store';
import {GothicAtmosphere} from './gothic-atmosphere';
import {GothicDock,GothicIconButton,GothicResourcePill,GothicModal,GothicPanelLink} from './gothic-hud';
import './gothic-lobby.css';

type Panel='profile'|'bond'|'updates'|'menu'|null;
const links=[
  {href:'/apartment/',icon:'♜',label:'公寓',description:'经营住客与房间'},
  {href:'/characters/',icon:'♟',label:'住客',description:'查看工匠与角色'},
  {href:'/orders/',icon:'❦',label:'羁绊',description:'月纱的特别委托'},
  {href:'/town/',icon:'✧',label:'探索',description:'月光街'},
  {href:'/warehouse/',icon:'♧',label:'商店',description:'兑换生产材料'},
];
function subscribe(onChange:()=>void){
  const storage=(event:StorageEvent)=>{if(!event.key||event.key===SAVE_KEY)onChange();};
  window.addEventListener('storage',storage);
  window.addEventListener(CHANGE_EVENT,onChange);
  window.addEventListener('pageshow',onChange);
  return ()=>{
    window.removeEventListener('storage',storage);
    window.removeEventListener(CHANGE_EVENT,onChange);
    window.removeEventListener('pageshow',onChange);
  };
}
function currentSave(){
  try{return localStorage.getItem(SAVE_KEY);}catch{return null;}
}
const emptyServerSave=()=>null;
export function GothicLobby(){
  const raw=useSyncExternalStore(subscribe,currentSave,emptyServerSave);
  const world=useMemo(()=>parseSavedWorld(raw)??newWorkshop(),[raw]);
  const [panel,setPanel]=useState<Panel>(null);
  const [dialogue,setDialogue]=useState('');
  const [reducedMotion,setReducedMotion]=useState(false);
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
    if(event.pointerType!=='mouse')return;
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
      <div className="gothic-lobby__fallback" style={{backgroundImage:'url('+workshopPainting.src+')'}}/>
      <div className="gothic-lobby__painting" style={{backgroundImage:"url("+'./lobby-hero.webp'+")"}}/>
      <div className="gothic-lobby__light" aria-hidden="true" data-testid="gothic-light-layer"/>
      <div className="gothic-lobby__vignette"/>
      <div className="gothic-lobby__embers"/>
      <div className="gothic-lobby__mist" aria-hidden="true"/>
    </div>

    <GothicAtmosphere paused={reducedMotion}/>

    <header className="absolute inset-x-0 top-0 z-[4] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-2 px-3 pt-3 sm:px-5 max-[840px]:grid-cols-[minmax(0,1fr)_auto]" aria-label="玩家与资源">
      <button type="button" className="flex min-h-12 w-max max-w-full items-center gap-2.5 bg-transparent text-left text-gothic-ivory focus-visible:outline-2 focus-visible:outline-gothic-glow"
        onClick={()=>setOpen('profile')} aria-label="打开玩家资料" aria-expanded={panel==='profile'}>
        <span className="gothic-lobby__avatar"><Image src={moonveilPortrait} alt="" fill
          sizes="60px" className="gothic-lobby__avatar-image"/></span>
        <span className="gothic-lobby__player-copy"><strong>夜色蔷薇</strong><small>月光公寓 · 第 {world.day} 天</small></span>
      </button>
      <div className="flex items-center gap-1.5 pt-1 max-[840px]:col-span-2 max-[840px]:col-start-1 max-[840px]:row-start-2 max-[840px]:justify-center" aria-label="当前存档资源">
        <GothicResourcePill symbol="✦" amount={world.coins} label="星币" testId="lobby-coins"/>
        <GothicResourcePill symbol="◆" amount={world.warehouse.core} label="晶核" testId="lobby-cores"/>
        <GothicResourcePill symbol="☾" amount={world.day} label="生产日"/>
      </div>
      <div className="flex justify-end gap-1.5 pt-1 max-[840px]:col-start-2 max-[840px]:row-start-1">
        <GothicIconButton label="委托消息" title="委托消息" onClick={()=>setOpen('updates')}>✉</GothicIconButton>
        <GothicIconButton label="切换动态特效" title="切换动态特效" pressed={reducedMotion}
          onClick={()=>setReducedMotion(value=>!value)}>✧</GothicIconButton>
        <GothicIconButton label="全部功能" title="全部功能" expanded={panel==='menu'}
          onClick={()=>setOpen('menu')}>☰</GothicIconButton>
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

    <nav className="absolute right-2 top-[28%] z-[3] grid justify-items-center gap-3 sm:right-5 sm:gap-5" aria-label="快捷功能">
      {[
        {href:'/orders/',icon:'☷',label:'任务'},
        {href:'/workshop/',icon:'⚒',label:'工坊'},
        {href:'/town/',icon:'✧',label:'街区'}
      ].map(item=><Link href={item.href} key={item.href} title={item.label}
        className="group grid min-w-12 justify-items-center gap-1 text-[10px] tracking-wide text-gothic-ivory drop-shadow-[0_3px_6px_#000] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-gothic-glow">
        <span aria-hidden="true" className="grid size-10 place-items-center rounded-xl border border-gothic-brass/75 bg-[linear-gradient(145deg,#49303cdd,#140d18ed)] text-[23px] text-gothic-gold shadow-[inset_0_1px_#ffe9ac35,0_6px_15px_#0008] transition-colors group-hover:border-gothic-glow">{item.icon}</span>
        <span>{item.label}</span>
      </Link>)}
    </nav>

    <button type="button" className="gothic-lobby__character-hit"
      onClick={talk} aria-label="与月纱互动" title="与月纱互动"/>
    <div className="gothic-lobby__character-caption" aria-hidden="true"><span>月纱</span><small>暗夜公寓的女主人</small></div>

    <Link href="/orders/" aria-label="查看当前主线任务"
      className="absolute bottom-[104px] left-3 z-[3] flex max-w-[min(310px,68vw)] items-center gap-2 rounded-lg border border-gothic-brass/60 border-l-[3px] border-l-gothic-gold/90 bg-gothic-panel/85 px-3 py-2 text-[11px] leading-snug text-gothic-ivory shadow-[0_5px_20px_#0009] backdrop-blur-lg transition-[border-color,transform] hover:-translate-y-0.5 hover:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow sm:bottom-[120px] sm:left-6">
      <span className="text-gothic-gold" aria-hidden="true">◇</span>
      <span>主线 · 交付 {world.warehouse.core} / {world.order.cores} 晶核</span>
      <span className="ml-auto text-lg leading-none" aria-hidden="true">›</span>
    </Link>

    <GothicDock items={links} label="主要游戏功能"/>

    {panel&&<GothicModal title={panel==='bond'?'与月纱交谈':panel==='menu'?'所有功能':panel==='profile'?'玩家资料':'委托消息'}
      onClose={close} wide={panel==='bond'}>
      {panel==='bond'&&<>
        <div className="relative hidden min-h-[210px] w-[125px] shrink-0 overflow-hidden rounded-md border border-gothic-brass/50 bg-gothic-panel sm:block">
          <Image src={moonveilPortrait} alt="月纱" fill sizes="130px" className="object-cover"/>
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
      {panel==='menu'&&<div className="min-w-0 flex-1 space-y-3 pr-5">
        <span className="text-[10px] tracking-widest text-gothic-gold">ALL DESTINATIONS</span>
        <h2 className="text-2xl font-semibold">公寓地图</h2>
        <div className="grid grid-cols-2 gap-2">
          {[...links,{href:'/workshop/',icon:'⚒',label:'晶核工坊',description:'生产与派工'},
            {href:'/orders/',icon:'◇',label:'委托大厅',description:'契约与交付'}]
            .map(item=><Link href={item.href} key={item.href} onClick={close}
              className="flex min-h-20 flex-col gap-1 rounded-md border border-gothic-brass/60 bg-gothic-panel/70 p-2.5 text-gothic-ivory transition-colors hover:border-gothic-glow hover:bg-gothic-wine/60 focus-visible:outline-2 focus-visible:outline-gothic-glow">
              <b className="text-2xl font-normal leading-none text-gothic-gold">{item.icon}</b>
              <span className="text-xs font-medium">{item.label}</span>
              <small className="text-[10px] leading-snug text-gothic-muted">{item.description}</small>
            </Link>)}
        </div>
      </div>}
    </GothicModal>}

  </main>;
}
