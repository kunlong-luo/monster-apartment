'use client';
import Link from 'next/link';
import {useMemo,useState,useSyncExternalStore} from 'react';
import type {ReactNode} from 'react';
import {WORKERS,MACHINES,workshopRank,forecastPatronCommission,PATRON_IMPORT_PRICE} from '../../../v2/src/workshop-engine';
import type {WorkshopState,WorkerId} from '../../../v2/src/workshop-engine';
import {SAVE_KEY,CHANGE_EVENT,parseSavedWorld,commitWorldAction} from '@/lib/moonwork/world-store';

export type WorldArea='town'|'orders'|'characters'|'warehouse';
const nav=[
  {id:'town',label:'月光街',href:'/town/'},
  {id:'orders',label:'委托大厅',href:'/orders/'},
  {id:'characters',label:'角色图鉴',href:'/characters/'},
  {id:'warehouse',label:'魔法仓库',href:'/warehouse/'},
] as const;
const ids=['brook','fern','cinder'] as const;
function subscribe(cb:()=>void){
  const onStorage=(e:StorageEvent)=>{if(e.key===SAVE_KEY||e.key===null)cb();};
  window.addEventListener('storage',onStorage);
  window.addEventListener(CHANGE_EVENT,cb);
  window.addEventListener('pageshow',cb);
  return ()=>{window.removeEventListener('storage',onStorage);
    window.removeEventListener(CHANGE_EVENT,cb);window.removeEventListener('pageshow',cb);};
}
function rawSave(){try{return localStorage.getItem(SAVE_KEY);}catch{return null;}}
function useSave(){
  const raw=useSyncExternalStore(subscribe,rawSave,()=>null);
  return useMemo(()=>parseSavedWorld(raw),[raw]);
}
const WorkshopLink=({children,className='mw-link'}:{children:ReactNode;className?:string})=>
  <a href="../workshop/" className={className}>{children}</a>;
function Panel({title,children}:{title:string;children:ReactNode}){
  return <section className="mw-panel"><h2>{title}</h2>{children}</section>;
}
function Action({type,children}:{type:'accept'|'import';children:ReactNode}){
  const [message,setMessage]=useState('');
  return <div><button type="button" className="mw-action-button" onClick={()=>{
    const outcome=commitWorldAction(window.localStorage,type);
    if(outcome==='applied')window.dispatchEvent(new Event(CHANGE_EVENT));
    setMessage(({applied:'操作完成，工坊存档已更新。',
      missing:'没有可用的工坊存档。',unavailable:'当前不可进行此操作。',
      error:'本地存储不可写入。'} as const)[outcome]);
  }}>{children}</button>{message&&<p role="status" className="mw-message">{message}</p>}</div>;
}
function Town({s}:{s:WorkshopState}){
  const rank=workshopRank(s.completed);
  return <>
    <section className="mw-hero">
      <span className="mw-eyebrow">MOONLIT DISTRICT · 月光街</span>
      <h2>从一座工坊，点亮整条月光街。</h2>
      <p>真正的世界从你的每次生产和交付开始。月光街展示实时进度，所有星币与资源都来自同一份工坊存档。</p>
      <WorkshopLink className="mw-button">进入工坊 · 继续生产</WorkshopLink>
      <span className="mw-moon" aria-hidden="true">☽</span>
    </section>
    <div className="mw-stat-grid">
      <Panel title="当前工坊"><strong>{rank.zh}</strong></Panel>
      <Panel title="已建设设备"><strong>{s.tiles.filter(Boolean).length} / 15</strong></Panel>
      <Panel title="已交付订单"><strong>{s.completed} 单</strong></Panel>
    </div>
    <div className="mw-grid">
      <Link className="mw-tile" href="/orders/"><b>◇ 委托大厅</b><span>期限、库存需求与月纱的特别委托</span></Link>
      <Link className="mw-tile" href="/characters/"><b>♟ 角色图鉴</b><span>查看工匠技能、岗位和访客状态</span></Link>
      <Link className="mw-tile" href="/warehouse/"><b>⬡ 魔法仓库</b><span>查看产线原料和共享晶核</span></Link>
    </div>
  </>;
}
function Orders({s}:{s:WorkshopState}){
  const p=s.patron;
  const forecast=forecastPatronCommission(s);
  return <div className="mw-grid mw-columns">
    <Panel title="◇ 正式委托">
      <p className="mw-eyebrow">CURRENT ORDER</p>
      <p className="mw-big">{s.warehouse.core} <small>/ {s.order.cores} 晶核</small></p>
      <div className="mw-meter"><i style={{width:Math.min(100,100*s.warehouse.core/s.order.cores)+'%'}}/></div>
      <p>第 {s.order.due} 天交付 · 剩余 {Math.max(0,s.order.due-s.day+1)} 个生产日</p>
      <p>奖励 ✦{s.order.reward} · {s.warehouse.core>=s.order.cores?'当前库存已足够':'还缺 '+(s.order.cores-s.warehouse.core)+' 枚晶核'}</p>
      <WorkshopLink>前往工坊生产</WorkshopLink>
    </Panel>
    <Panel title="☽ 月纱的特别委托">
      {!p?<p>首次交付普通订单之后，28 岁的魔女商人月纱才会到访。她的订单与普通订单共享真实库存。</p>:
      <>
        <p>目标 {p.cores} 枚 · 截止第 {p.due} 天 · 奖励 ✦{p.reward} · 违约损失 ✦20</p>
        <p>当前状态：{({offered:'待接受',active:'进行中',completed:'交付完成',missed:'未能如约交付',expired:'邀请已过期'} as const)[p.status]}</p>
        {forecast&&<p>当前排班预测 {forecast.available}/{forecast.required}，{forecast.deficit?'仍缺 '+forecast.deficit+' 枚':'有望如期完成'}。普通订单{forecast.nextNormalOrder==='missed'?'可能逾期':'仍需留意'}。</p>}
        {p.status==='offered'&&<Action type="accept">接受月纱委托</Action>}
      </>}
    </Panel>
  </div>;
}
function Characters({s}:{s:WorkshopState}){
  return <>
    <div className="mw-grid">
      {ids.map((id:WorkerId)=>{
        const w=WORKERS[id];const plot=s.tiles.findIndex(t=>t?.worker===id);
        return <Panel key={id} title={w.zh+' · '+w.en}>
          <p className="mw-character-icon" aria-hidden="true">{id==='brook'?'◈':id==='fern'?'❀':'✷'}</p>
          <p>专长：{w.skill==='water'?'水汽制造':w.skill==='plant'?'孢子种植':'晶核锻造'}。</p>
          <p>{plot<0?'目前待派工':'正在 '+String(plot+1).padStart(2,'0')+' 号工位 · '+MACHINES[s.tiles[plot]!.craft].zh}</p>
        </Panel>;
      })}
    </div>
    <Panel title="☽ 月纱 · 28 岁成年月夜魔女">
      <p>月纱是一位有真实商业委托的商人，不是仅供展示的角色。{s.patron?'当前委托状态：'+s.patron.status:'首张正式订单完成后解锁。'}</p>
      <Link className="mw-link" href="/orders/">查看月纱的委托</Link>
    </Panel>
  </>;
}
function Warehouse({s}:{s:WorkshopState}){
  const stored=(kind:'well'|'garden')=>s.tiles.filter(t=>t?.craft===kind).reduce((total,t)=>total+(t?.stored??0),0);
  const p=s.patron;const canBuy=!!p&&['offered','active'].includes(p.status)&&s.day<=p.due&&s.coins>=PATRON_IMPORT_PRICE;
  return <div className="mw-grid mw-columns">
    <Panel title="⬡ 当前真实库存">
      <div className="mw-stock"><span>✦ 共享晶核</span><b>{s.warehouse.core}</b></div>
      <div className="mw-stock"><span>◈ 水汽泵储水</span><b>{stored('well')}</b></div>
      <div className="mw-stock"><span>❀ 温室内孢子</span><b>{stored('garden')}</b></div>
      <p>水和孢子仍存放在设备内；普通订单和月纱委托争夺同一批晶核。</p>
    </Panel>
    <Panel title="☽ 月夜商人采购">
      <p>采购一枚晶核需要 ✦{PATRON_IMPORT_PRICE}，直接扣除真实星币并增加共享仓库库存。仅在月纱委托有效期内可购买。</p>
      {canBuy?<Action type="import">付费采购 +1 晶核</Action>:<p>当前无法采购：尚未解锁访客、委托结束或余额不足。</p>}
      <WorkshopLink>返回工坊</WorkshopLink>
    </Panel>
  </div>;
}
export function MoonworkWorld({area}:{area:WorldArea}){
  const s=useSave();
  const title={town:'月光街',orders:'委托大厅',characters:'角色图鉴',warehouse:'魔法仓库'}[area];
  return <main className="mw" data-testid="moonwork-world" data-area={area}>
    <header className="mw-header">
      <Link href="/town/" className="mw-logo">☽ 月光工坊 <small>V2.2</small></Link>
      <div className="mw-stats">
        <span>第 <b data-testid="world-day">{s?.day??'—'}</b> 天</span>
        <span>✦ <b data-testid="world-coins">{s?.coins??'—'}</b></span>
        <span>晶核 <b data-testid="world-cores">{s?.warehouse.core??'—'}</b></span>
      </div>
    </header>
    <nav className="mw-nav" aria-label="月光工坊世界">
      {nav.map(n=><Link href={n.href} key={n.id} aria-current={n.id===area?'page':undefined} className={n.id===area?'selected':''}>{n.label}</Link>)}
      <WorkshopLink>工坊实景</WorkshopLink>
    </nav>
    <div className="mw-main">
      <p className="mw-eyebrow">MOONLIGHT WORKSHOP / {title}</p>
      <h1>{title}</h1>
      {!s?<Panel title="尚无可用的 V2 工坊存档">
        <p>这里不会虚构星币与库存。请先进入真实工坊开始建造或生产，四个场景便能读取相同存档。</p>
        <WorkshopLink className="mw-button">进入工坊开始经营</WorkshopLink>
      </Panel>:area==='town'?<Town s={s}/>:area==='orders'?<Orders s={s}/>:area==='characters'?<Characters s={s}/>:<Warehouse s={s}/>}
    </div>
    <footer className="mw-footer">同一份 V2 存档 · 无服务器静态运行 · 保留现有 PixiJS 工坊</footer>
  </main>;
}
