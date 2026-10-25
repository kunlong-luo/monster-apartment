'use client';
import Link from 'next/link';
import Image from 'next/image';
import moonWorkshopPainting from '../../../v2/art/moon-workshop.avif';
import moonveilPortrait from '../../../v2/art/moonveil-portrait.avif';
import {useMemo,useState,useSyncExternalStore} from 'react';
import type {ReactNode} from 'react';
import {WORKERS,MACHINES,workshopRank,forecastPatronCommission,forecastOrderChoice,
  PATRON_IMPORT_PRICE,PREMIUM_EXTRA_CORES,PREMIUM_EXTRA_REWARD,
  PREMIUM_ORDER_PENALTY,STANDARD_ORDER_PENALTY,
  TOWN_MARKET,townMarketAvailable,TOWN_RESIDENTS,residentForDay,
  residentRequestStock,residentRequestAvailable} from '../../../v2/src/workshop-engine';
import type {WorkshopState,WorkerId} from '../../../v2/src/workshop-engine';
import {SAVE_KEY,CHANGE_EVENT,parseSavedWorld,commitWorldAction} from '@/lib/moonwork/world-store';

export type WorldArea='town'|'orders'|'characters'|'warehouse';
const nav=[
  {id:'town',label:'月光街',full:'月光街',glyph:'✦',href:'/town/'},
  {id:'workshop',label:'工坊',full:'工坊',glyph:'⚒',href:'/workshop/'},
  {id:'orders',label:'委托',full:'委托大厅',glyph:'◇',href:'/orders/'},
  {id:'characters',label:'角色',full:'角色图鉴',glyph:'♟',href:'/characters/'},
  {id:'warehouse',label:'仓库',full:'魔法仓库',glyph:'⬡',href:'/warehouse/'},
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
  <Link href="/workshop/" className={className}>{children}</Link>;
function Panel({title,children}:{title:string;children:ReactNode}){
  return <section className="mw-panel"><h2>{title}</h2>{children}</section>;
}
function Action({type,children}:{type:'accept'|'import'|'premium'|'marketWater'|'marketFiber'|'marketCore'|'resident';children:ReactNode}){
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
  const offers=[
    {kind:'water' as const,action:'marketWater' as const,icon:'◈',place:'泉眼补给站'},
    {kind:'fiber' as const,action:'marketFiber' as const,icon:'❀',place:'孢子植物摊'},
    {kind:'core' as const,action:'marketCore' as const,icon:'✦',place:'晶核商行'},
  ];
  const marketUsed=s.market?.day===s.day;
  const residentKind=residentForDay(s.day);
  const resident=TOWN_RESIDENTS[residentKind];
  const availableStock=residentRequestStock(s);
  const canHelp=residentRequestAvailable(s);
  const [localVisit,setLocalVisit]=useState<string>('');
  const visitComplete=s.market?.day===s.day&&s.market.kind===residentKind;
  return <>
    <div className="mw-town-focus">
    <section className="mw-town-scene" aria-label="月光街的炼金商区" data-testid="moonlit-town-scene">
      <Image src={moonWorkshopPainting} alt="月光工坊内的魔法灯与建筑绘景"
        fill unoptimized sizes="(max-width: 760px) 100vw, 800px"
        className="mw-town-painting" data-testid="town-painting"/>
      <div className="mw-town-scrim" aria-hidden="true"/>
      <div className="mw-town-banner">
        <p className="mw-eyebrow">MOONLIT DISTRICT · AFTER DARK</p>
        <h2>月光街 · 夜间商区</h2>
        <p>选一家店进入，所有交易与工坊生产都使用同一份真实库存。</p>
      </div>
      <nav className="mw-town-portals" aria-label="月光街建筑入口">
        <Link href="/workshop/" aria-label="晶核工坊" className="mw-town-portal">
          <span className="mw-portal-glyph" aria-hidden="true">⚒</span>
          <span><strong>晶核工坊</strong><small>派工 · 生产</small></span>
        </Link>
        <Link href="/orders/" aria-label="月夜委托所" className="mw-town-portal">
          <span className="mw-portal-glyph" aria-hidden="true">◇</span>
          <span><strong>月夜委托所</strong><small>委托 · 交付</small></span>
        </Link>
        <Link href="/warehouse/" aria-label="物资仓库" className="mw-town-portal">
          <span className="mw-portal-glyph" aria-hidden="true">⬡</span>
          <span><strong>物资仓库</strong><small>材料 · 采购</small></span>
        </Link>
      </nav>
      <div className="mw-town-scene-credit">✦ 月光工坊 · 绘制场景预览</div>
    </section>
    <section className="mw-town-resident" data-testid="town-resident" aria-label="今日街头居民">
      <div className="mw-resident-character" aria-label="月纱为你带来街头居民消息">
        <Image src={moonveilPortrait} alt="月纱，来自工坊的魔法商人"
          fill unoptimized sizes="(max-width: 760px) 140px, 220px"
          className="mw-guide-painting" data-testid="town-guide-painting"/>
        <span className="mw-resident-guide-label">月纱 · 街区向导</span>
      </div>
      <div className="mw-resident-dialogue">
        <p className="mw-eyebrow">月纱带来的消息 · DAY {s.day}</p>
        <h2>{resident.name} <small>{resident.age} 岁 · {resident.job}</small></h2>
        <p className="mw-resident-quote">“{resident.story}”</p>
        <div className="mw-resident-deal">
          <span>需要 {resident.amount} {resident.resource==='water'?'水汽':resident.resource==='fiber'?'孢子':'晶核'}
          （现有可用 {availableStock}）</span><strong>获得 ✦{resident.reward} 星币</strong>
        </div>
        <p className="mw-resident-explanation">交出的材料将从真实设备或仓库扣除。
          与市集采购共享每日交易次数，无法两边都领。</p>
        <button type="button" className="mw-action-button" data-testid="resident-deliver"
          disabled={!canHelp} onClick={()=>{
            const status=commitWorldAction(window.localStorage,'resident');
            if(status==='applied'){
              setLocalVisit(resident.after);
              window.dispatchEvent(new Event(CHANGE_EVENT));
            }else setLocalVisit(status==='error'?'存档写入失败':'当前库存或交易机会不足');
          }}>{visitComplete?'已帮助居民':marketUsed?'今天已在市集交易':canHelp?'交付材料 · 完成街头委托':'材料不足 · 去工坊生产'}</button>
        {visitComplete&&<p className="mw-visit-result" role="status">{localVisit||resident.after}</p>}
        {!visitComplete&&localVisit&&<p className="mw-visit-result" role="status">{localVisit}</p>}
        <p className="mw-resident-reputation">累计帮助街区居民 {s.residentsHelped??0} 次</p>
      </div>
    </section>
    </div>
    <div className="mw-stat-grid">
      <Panel title="当前工坊"><strong>{rank.zh}</strong></Panel>
      <Panel title="已建设设备"><strong>{s.tiles.filter(Boolean).length} / 15</strong></Panel>
      <Panel title="已交付订单"><strong>{s.completed} 单</strong></Panel>
    </div>
    <section className="mw-market" aria-label="月夜市集" data-testid="moonlit-market">
      <div className="mw-market-header">
        <div>
          <p className="mw-eyebrow">ONCE PER DAY · TRUE INVENTORY</p>
          <h2>月夜市集</h2>
          <p>每天只能在市集购买一批货，或者帮助一位居民。生产日推进后才有下一次机会；水汽和孢子进入现有设备，晶核进入共享仓库。</p>
        </div>
        <span className="mw-market-ticket" data-testid="market-status">
          {marketUsed?'今日交易已完成 · 明日再来':'第 '+s.day+' 天 · 可采购一批（市集与居民二选一）'}
        </span>
      </div>
      <div className="mw-market-offers">
        {offers.map(offer=>{
          const deal=TOWN_MARKET[offer.kind];
          const available=townMarketAvailable(s,offer.kind);
          const missing=offer.kind!=='core'&&
            !s.tiles.some(tile=>tile?.craft===(offer.kind==='water'?'well':'garden'));
          return <article key={offer.kind} className={'mw-market-offer mw-offer-'+offer.kind}
            data-testid={'town-offer-'+offer.kind}>
            <span className="mw-market-icon" aria-hidden="true">{offer.icon}</span>
            <div className="mw-market-detail">
              <small>{offer.place}</small>
              <h3>{deal.zh}</h3>
              <p>+{deal.amount} {offer.kind==='water'?'水汽':offer.kind==='fiber'?'孢子':'晶核'} · {deal.hint}</p>
              <p className="mw-market-price">花费 ✦{deal.cost} 星币</p>
              {missing&&<p className="mw-market-warning">先在工坊建设对应设备</p>}
              <button type="button" className="mw-action-button"
                disabled={!available}
                onClick={()=>{
                  const result=commitWorldAction(window.localStorage,offer.action);
                  if(result==='applied')window.dispatchEvent(new Event(CHANGE_EVENT));
                }}>{marketUsed?'今日已采购':available?'购买本日货箱':'当前无法采购'}</button>
            </div>
          </article>;
        })}
      </div>
    </section>
    <div className="mw-town-next">
      <Link href="/characters/" className="mw-link">查看工匠配置 ↗</Link>
      <Link href="/orders/" className="mw-link">确认订单缺口 ↗</Link>
      <WorkshopLink>返回工坊投产 ↗</WorkshopLink>
    </div>
  </>;
}
function Orders({s}:{s:WorkshopState}){
  const p=s.patron;
  const forecast=forecastPatronCommission(s);
  const choice=forecastOrderChoice(s);
  return <div className="mw-grid mw-columns">
    <Panel title="◇ 正式委托">
      <p className="mw-eyebrow">CURRENT ORDER</p>
      <p className="mw-big">{s.warehouse.core} <small>/ {s.order.cores} 晶核</small></p>
      <div className="mw-meter"><i style={{width:Math.min(100,100*s.warehouse.core/s.order.cores)+'%'}}/></div>
      <p>第 {s.order.due} 天交付 · 剩余 {Math.max(0,s.order.due-s.day+1)} 个生产日</p>
      <p>奖励 ✦{s.order.reward} · {s.warehouse.core>=s.order.cores?'当前库存已足够':'还缺 '+(s.order.cores-s.warehouse.core)+' 枚晶核'}</p>
      <p>未交付违约损失 ✦{s.order.premium?PREMIUM_ORDER_PENALTY:STANDARD_ORDER_PENALTY} · {s.order.premium?'高额订单已接受':'普通交付'}</p>
      {choice&&<div className="mw-risk-choice" data-testid="world-premium-offer">
        <strong>高额大宗订单 · 可选</strong>
        <p>本期追加 {PREMIUM_EXTRA_CORES} 枚晶核、成功多赚 ✦{PREMIUM_EXTRA_REWARD}；
        原交期不变，违约损失增至 ✦{PREMIUM_ORDER_PENALTY}。一经接受不可撤回。</p>
        <p data-testid="world-premium-forecast" className={choice.premium==='missed'?'mw-risk-high':'mw-risk-safe'}>
          当前排班推演：普通{choice.standard==='fulfilled'?'可交付':'可能违约'}；
          大宗{choice.premium==='fulfilled'?'可交付':'可能违约'}。
          {s.patron?.status==='active'&&choice.patronIfPremium==='missed'?'同时可能导致月纱委托失败。':''}
        </p>
        <Action type="premium">接受高额大宗订单</Action>
      </div>}
      <div className="mw-context-links"><WorkshopLink>前往工坊调整产线</WorkshopLink>
        <Link className="mw-link" href="/warehouse/">去仓库查看材料 ↗</Link></div>
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
          <WorkshopLink>去工坊安排岗位 ↗</WorkshopLink>
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
      <div className="mw-context-links"><WorkshopLink>回工坊继续生产</WorkshopLink>
        <Link className="mw-link" href="/orders/">查看订单需求 ↗</Link></div>
    </Panel>
  </div>;
}
export function MoonworkWorld({area}:{area:WorldArea}){
  const s=useSave();
  const title={town:'月光街',orders:'委托大厅',characters:'角色图鉴',warehouse:'魔法仓库'}[area];
  return <main className="mw" data-testid="moonwork-world" data-area={area}>
    <header className="mw-header">
      <Link href="/town/" className="mw-logo">☽ 月光工坊 <small>MOONLIT DISTRICT</small></Link>
      <div className="mw-stats">
        <span>第 <b data-testid="world-day">{s?.day??'—'}</b> 天</span>
        <span>✦ <b data-testid="world-coins">{s?.coins??'—'}</b></span>
        <span>晶核 <b data-testid="world-cores">{s?.warehouse.core??'—'}</b></span>
      </div>
    </header>
    <nav className="mw-nav" aria-label="月光工坊世界">
      {nav.map(n=><Link href={n.href} key={n.id} aria-label={n.full} aria-current={n.id===area?'page':undefined} className={n.id===area?'selected':''}>
        <span aria-hidden="true" className="world-nav-glyph">{n.glyph}</span><span>{n.label}</span>
      </Link>)}
    </nav>
    <div className="mw-main">
      <p className="mw-eyebrow">MOONLIGHT WORKSHOP / {title}</p>
      <h1>{title}</h1>
      {!s?<Panel title="尚无可用的 V2 工坊存档">
        <p>月光街还没有记录你的生产旅程。进入工坊，摆放设备、安排工匠并完成第一张委托；这些场景会自动呈现你的经营成果。</p>
        <WorkshopLink className="mw-button">进入工坊开始经营</WorkshopLink>
      </Panel>:area==='town'?<Town s={s}/>:area==='orders'?<Orders s={s}/>:area==='characters'?<Characters s={s}/>:<Warehouse s={s}/>}
    </div>
    <footer className="mw-footer">✦ 月光街 · 你的每一次生产与交付，都在改变这座工坊</footer>
  </main>;
}
