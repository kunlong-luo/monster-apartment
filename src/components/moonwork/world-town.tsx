'use client';
import Link from 'next/link';
import {WORLD_LINK_CLASS} from './world-primitives';
import Image from 'next/image';
import {useState} from 'react';
import moonWorkshopPainting from '../../../v2/art/moon-workshop.avif';
import moonveilPortrait from '../../../v2/art/moonveil-portrait.avif';
import {workshopRank,TOWN_MARKET,townMarketAvailable,TOWN_RESIDENTS,residentForDay,residentRequestStock,residentRequestAvailable} from '../../../v2/src/workshop-engine';
import type {WorkshopState} from '../../../v2/src/workshop-engine';
import {WorkshopLink,Action} from './world-primitives';

export function Town({s}:{s:WorkshopState}){
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
  const visitComplete=s.market?.day===s.day && s.market.kind===residentKind;
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
        <Action type="resident" testId="resident-deliver" disabled={!canHelp}
          onApplied={()=>setLocalVisit(resident.after)}>
          {visitComplete?'已帮助居民':marketUsed?'今日交易机会已使用':canHelp?'交付材料 · 完成街头委托':'材料不足 · 去工坊生产'}
        </Action>
        {visitComplete&&<p className="mw-visit-result" role="status">{localVisit||resident.after}</p>}
        {!visitComplete&&localVisit&&<p className="mw-visit-result" role="status">{localVisit}</p>}
        <p className="mw-resident-reputation">累计帮助街区居民 {s.residentsHelped??0} 次</p>
      </div>
    </section>
    </div>
    <div aria-label="街区经营概况" className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-gothic-muted">
      <span className="rounded-full border border-gothic-brass/35 bg-gothic-panel/70 px-2.5 py-1">✦ {rank.zh}</span>
      <span className="rounded-full border border-gothic-brass/35 bg-gothic-panel/70 px-2.5 py-1">设备 {s.tiles.filter(Boolean).length}/15</span>
      <span className="rounded-full border border-gothic-brass/35 bg-gothic-panel/70 px-2.5 py-1">已交付 {s.completed} 单</span>
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
              <Action type={offer.action} disabled={!available}>
                {marketUsed?'今日已采购':available?'购买本日货箱':'当前无法采购'}
              </Action>
            </div>
          </article>;
        })}
      </div>
    </section>
    <div className="mw-town-next">
      <Link href="/characters/" className={WORLD_LINK_CLASS}>查看工匠配置 ↗</Link>
      <Link href="/orders/" className={WORLD_LINK_CLASS}>确认订单缺口 ↗</Link>
      <WorkshopLink>返回工坊投产 ↗</WorkshopLink>
    </div>
  </>;
}
