'use client';
import Link from 'next/link';
import {WORLD_LINK_CLASS} from './world-primitives';
import {R12SceneHeroPainting} from '@/components/game/r12-scene-painting';
import {PATRON_IMPORT_PRICE,importPatronCore,forecastPatronCommission} from '../../../engine/src/workshop-engine';
import type {WorkshopState} from '../../../engine/src/workshop-engine';
import {Panel,Action} from './world-primitives';

/** Inventory rows are UI primitives, not hand-maintained CSS selectors. */
function WarehouseStockLine({label,amount}:{label:string;amount:number}){
  return <div className="flex items-center justify-between gap-3 border-b border-gothic-brass/30 py-4">
    <span className="text-[15px] text-gothic-ivory">{label}</span>
    <b className="font-[Georgia,serif] text-[32px] font-bold text-gothic-glow tabular-nums">{amount}</b>
  </div>;
}

export function Warehouse({s}:{s:WorkshopState}){
  const stored=(kind:'well'|'garden')=>s.tiles.filter(t=>t?.craft===kind).reduce((total,t)=>total+(t?.stored??0),0);
  const p=s.patron;
  const activePatron=p?.status==='active'&&s.day<=p.due?p:null;
  // This is an immediate inventory comparison, not a reservation or a
  // prediction of the automatic production engine.
  const orderDue=s.day<=s.order.due?s.order.cores:0;
  const patronDue=activePatron?.cores??0;
  const shortfall=Math.max(0,orderDue+patronDue-s.warehouse.core);
  // Reuse the authoritative pure reducer for purchase eligibility. The
  // actual button still commits through Action's locked save transaction.
  const purchased=importPatronCore(s);
  const canBuy=purchased!==s;
  const forecast=forecastPatronCommission(s);
  const purchasedForecast=canBuy&&forecast?forecastPatronCommission(purchased):null;
  const blockedReason=!p?'首次完成普通订单后，月纱才会开放采购。':
    !['offered','active'].includes(p.status)||s.day>p.due?'月纱委托已结束或过期，当前不能采购。':
    s.coins<PATRON_IMPORT_PRICE?'星币不足，还差 '+(PATRON_IMPORT_PRICE-s.coins)+' ✦。':
    '晶核库存已达到安全上限。';
  return <>
    <section className="mw-world-art-hero mw-warehouse-hero" data-testid="painted-warehouse-hero">
      <R12SceneHeroPainting area="warehouse" alt="魔法仓库环境绘景"/>
      <div className="mw-world-hero-copy">
        <span className="mw-eyebrow">SHARED MATERIALS · REAL ECONOMY</span>
        <h2>魔法仓库</h2>
        <p>水汽与孢子保存在各自设备内，晶核进入共享仓库；
          工坊、居民、市集和委托全部从这里影响实际物资。</p>
      </div>
      <Link href="/town/" className={WORLD_LINK_CLASS+' shrink-0'}>去月光街补货 ↗</Link>
    </section>
    <div className="mw-grid mw-columns mt-2.5 grid grid-cols-1 gap-2.5">
    <Panel title="⬡ 当前真实库存">
      <WarehouseStockLine label="✦ 共享晶核" amount={s.warehouse.core}/>
      <WarehouseStockLine label="◈ 水汽泵储水" amount={stored('well')}/>
      <WarehouseStockLine label="❀ 温室内孢子" amount={stored('garden')}/>
      <p>水和孢子仍存放在设备内；普通订单和月纱委托争夺同一批晶核。</p>
      <section aria-label="晶核需求" data-testid="warehouse-core-demand"
        className="mt-3 space-y-1.5 rounded-md border border-gothic-brass/40 p-3">
        <p>普通订单需求：{orderDue} 枚</p>
        <p>已接受的月纱委托需求：{patronDue} 枚</p>
        <p data-testid="warehouse-core-shortfall" aria-live="polite">即时合计缺口：{shortfall} 枚</p>
        <p>仅比较现有库存与未到期的已接受订单，不预扣材料，也不包含未来生产。</p>
        {p?.status==='offered'&&s.day<=p.due&&<p>月纱尚有 {p.cores} 枚晶核的待接受委托，未计入上方合计。</p>}
        <Link href="/orders/" className={WORLD_LINK_CLASS}>查看委托与交期 ↗</Link>
      </section>
    </Panel>
    <Panel title="☽ 月夜商人采购">
      <p>采购一枚晶核需要 ✦{PATRON_IMPORT_PRICE}，直接扣除真实星币并增加共享仓库库存。仅在月纱委托有效期内可购买。</p>
      {forecast&&<p data-testid="warehouse-patron-forecast">
        按当前排班进行生产日推演{p?.status==='offered'?'（假设接受委托）':''}：月纱委托预计缺 {forecast.deficit} 枚。
        {purchasedForecast&&'采购一枚后预计缺 '+purchasedForecast.deficit+' 枚。'}
        实际结果取决于后续操作与生产。
      </p>}
      {canBuy?<><p data-testid="warehouse-purchase-preview">采购后：剩余 {purchased.coins} 星币 · 库存 {purchased.warehouse.core} 枚晶核</p>
        <Action type="import">付费采购 +1 晶核</Action></>:<p data-testid="warehouse-purchase-blocked">{blockedReason}</p>}
    </Panel>
    </div>
  </>;
}
