'use client';
import Link from 'next/link';
import {WORLD_LINK_CLASS} from './world-primitives';
import Image from 'next/image';
import moonWorkshopPainting from '../../../v2/art/moon-workshop.avif';
import {forecastPatronCommission,forecastOrderChoice,PREMIUM_EXTRA_CORES,PREMIUM_EXTRA_REWARD,PREMIUM_ORDER_PENALTY,STANDARD_ORDER_PENALTY} from '../../../v2/src/workshop-engine';
import type {WorkshopState} from '../../../v2/src/workshop-engine';
import {Panel,Action,WorkshopLink} from './world-primitives';

export function Orders({s}:{s:WorkshopState}){
  const p=s.patron;
  const forecast=forecastPatronCommission(s);
  const choice=forecastOrderChoice(s);
  return <>
    <section className="mw-world-art-hero mw-order-hero" data-testid="painted-order-hero">
      <Image src={moonWorkshopPainting} fill unoptimized sizes="(max-width: 760px) 100vw, 1200px"
        className="mw-world-hero-painting" alt="月夜工坊绘制场景"/>
      <div className="mw-world-hero-copy">
        <span className="mw-eyebrow">MOONLIT COMMISSION GUILD</span>
        <h2>月夜委托所</h2>
        <p>你的订单和月纱契约使用同一份晶核库存。
          高额订单可以多赚星币，也可能抢走本该留给居民的材料。</p>
      </div>
    </section>
    <div className="mw-grid mw-columns mt-2.5 grid grid-cols-1 gap-2.5">
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
      <div className="flex flex-wrap items-center gap-2"><WorkshopLink>前往工坊调整产线</WorkshopLink>
        <Link className={WORLD_LINK_CLASS} href="/warehouse/">去仓库查看材料 ↗</Link></div>
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
    </div>
  </>;
}
