'use client';

import Link from 'next/link';
import Image from 'next/image';
import {useMemo,useState,useSyncExternalStore} from 'react';
import moonveilPortrait from '../../../v2/art/moonveil-portrait.avif';
import workshopPainting from '../../../v2/art/moon-workshop.avif';
import {newWorkshop} from '../../../v2/src/workshop-engine';
import {SAVE_KEY,CHANGE_EVENT,parseSavedWorld,commitWorldAction} from '@/lib/moonwork/world-store';
import './gothic-lobby.css';

type Panel='profile'|'bond'|'updates'|'menu'|null;
const links=[
  {href:'/apartment/',symbol:'♜',label:'公寓',description:'经营住客与房间'},
  {href:'/characters/',symbol:'♟',label:'住客',description:'查看工匠与角色'},
  {href:'/orders/',symbol:'❦',label:'羁绊',description:'月纱的特别委托'},
  {href:'/town/',symbol:'✧',label:'探索',description:'月光街'},
  {href:'/warehouse/',symbol:'♧',label:'商店',description:'兑换生产材料'},
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

    <header className="gothic-lobby__hud" aria-label="玩家与资源">
      <button type="button" className="gothic-lobby__player" onClick={()=>setOpen('profile')}
        aria-label="打开玩家资料" aria-expanded={panel==='profile'}>
        <span className="gothic-lobby__avatar"><Image src={moonveilPortrait} alt="" fill
          sizes="60px" className="gothic-lobby__avatar-image"/></span>
        <span className="gothic-lobby__player-copy"><strong>夜色蔷薇</strong><small>月光公寓 · 第 {world.day} 天</small></span>
      </button>
      <div className="gothic-lobby__resources" aria-label="当前存档资源">
        <span title="工坊真实星币余额"><b aria-hidden="true">✦</b><strong data-testid="lobby-coins">{world.coins}</strong><small>星币</small></span>
        <span title="工坊真实晶核库存"><b aria-hidden="true">◆</b><strong data-testid="lobby-cores">{world.warehouse.core}</strong><small>晶核</small></span>
        <span title="当前生产日"><b aria-hidden="true">☾</b><strong>{world.day}</strong><small>生产日</small></span>
      </div>
      <div className="gothic-lobby__top-actions">
        <button type="button" title="委托消息" aria-label="委托消息"
          onClick={()=>setOpen('updates')}>✉</button>
        <button type="button" title="收起或展开动作特效" aria-label="切换动态特效"
          aria-pressed={reducedMotion} onClick={()=>setReducedMotion(value=>!value)}>✧</button>
        <button type="button" title="全部功能" aria-label="全部功能"
          aria-expanded={panel==='menu'} onClick={()=>setOpen('menu')}>☰</button>
      </div>
    </header>

    <aside className="gothic-lobby__feature" aria-label="剧情焦点">
      <span>MOONLIGHT APARTMENT</span>
      <strong>月纱 · 夜色邀约</strong>
      <small>夜幕降临，她在大厅等你。</small>
      <button type="button" onClick={talk} aria-label="与月纱交谈">开启对话 <span aria-hidden="true">›</span></button>
    </aside>

    <nav className="gothic-lobby__side" aria-label="快捷功能">
      <Link href="/orders/" title="委托任务"><span aria-hidden="true">☷</span><small>任务</small></Link>
      <Link href="/workshop/" title="晶核工坊"><span aria-hidden="true">⚒</span><small>工坊</small></Link>
      <Link href="/town/" title="月光街探索"><span aria-hidden="true">✧</span><small>街区</small></Link>
    </nav>

    <button type="button" className="gothic-lobby__character-hit"
      onClick={talk} aria-label="与月纱互动" title="与月纱互动"/>
    <div className="gothic-lobby__character-caption" aria-hidden="true"><span>月纱</span><small>暗夜公寓的女主人</small></div>

    <Link href="/orders/" className="gothic-lobby__quest" aria-label="查看当前主线任务">
      <b aria-hidden="true">◇</b><span>主线 · 交付 {world.warehouse.core} / {world.order.cores} 晶核</span>
      <strong aria-hidden="true">›</strong>
    </Link>

    <nav className="gothic-lobby__bottom" aria-label="主要游戏功能">
      {links.map(item=><Link key={item.href} href={item.href}
        aria-label={item.label+' · '+item.description}
        className="gothic-lobby__nav-entry" title={item.description}>
        <span className="gothic-lobby__nav-glyph" aria-hidden="true">{item.symbol}</span>
        <span>{item.label}</span>
      </Link>)}
    </nav>

    {panel&&<div className="gothic-lobby__overlay" onMouseDown={event=>{
      if(event.target===event.currentTarget)close();
    }}>
      <section className="gothic-lobby__dialog" role="dialog" aria-modal="true"
        aria-label={panel==='bond'?'与月纱交谈':panel==='menu'?'所有功能':panel==='profile'?'玩家资料':'委托消息'}>
        <button type="button" className="gothic-lobby__close" aria-label="关闭面板"
          onClick={close}>×</button>
        {panel==='bond'&&<>
          <div className="gothic-lobby__dialog-portrait">
            <Image src={moonveilPortrait} alt="月纱" fill sizes="130px"/>
          </div>
          <div className="gothic-lobby__dialog-text">
            <span className="gothic-lobby__eyebrow">SPECIAL GUEST · 月纱</span>
            <h2>今晚，想和我聊些什么？</h2>
            <p role="status">“{dialogue||'月光街的灯已经亮起，我正在等你。'}”</p>
            {world.patron?.status==='offered'&&
              <button type="button" className="gothic-lobby__gold-action"
                onClick={accept}>接受月纱的特别委托</button>}
            <Link href="/orders/" className="gothic-lobby__text-link">查看委托与契约 →</Link>
          </div>
        </>}
        {panel==='profile'&&<div className="gothic-lobby__dialog-text">
          <span className="gothic-lobby__eyebrow">YOUR RESIDENCE</span>
          <h2>夜色蔷薇</h2>
          <p>第 {world.day} 天 · 星币 {world.coins} · 晶核 {world.warehouse.core}</p>
          <p>累计交付 {world.completed} 单 · 街区互助 {world.residentsHelped??0} 次</p>
          <Link href="/workshop/" className="gothic-lobby__text-link">进入晶核工坊 →</Link>
        </div>}
        {panel==='updates'&&<div className="gothic-lobby__dialog-text">
          <span className="gothic-lobby__eyebrow">COMMISSION UPDATE</span>
          <h2>今日委托</h2>
          <p>第 {world.day} 天 · 需在第 {world.order.due} 天交付 {world.order.cores} 枚晶核。</p>
          <p>库存 {world.warehouse.core} 枚 · 成功奖励 {world.order.reward} 星币。</p>
          <Link href="/orders/" className="gothic-lobby__text-link">管理委托 →</Link>
        </div>}
        {panel==='menu'&&<div className="gothic-lobby__dialog-text">
          <span className="gothic-lobby__eyebrow">ALL DESTINATIONS</span>
          <h2>公寓地图</h2>
          <div className="gothic-lobby__menu-grid">
            {[...links,{href:'/workshop/',symbol:'⚒',label:'晶核工坊',description:'生产与派工'},
              {href:'/orders/',symbol:'◇',label:'委托大厅',description:'契约与交付'}]
              .map(item=><Link href={item.href} key={item.href} onClick={close}>
                <b>{item.symbol}</b><span>{item.label}</span><small>{item.description}</small>
              </Link>)}
          </div>
        </div>}
      </section>
    </div>}
  </main>;
}
