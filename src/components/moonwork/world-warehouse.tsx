'use client';
import Link from 'next/link';
import {WORLD_LINK_CLASS} from './world-primitives';
import Image from 'next/image';
import moonWorkshopPainting from '../../../v2/art/moon-workshop.avif';
import kilnPainted from '../../../v2/art/kiln-art-review.avif';
import {PATRON_IMPORT_PRICE} from '../../../v2/src/workshop-engine';
import type {WorkshopState} from '../../../v2/src/workshop-engine';
import {Panel,Action} from './world-primitives';

/** Inventory rows are UI primitives, not hand-maintained CSS selectors. */
function WarehouseStockLine({label,amount}:{label:string;amount:number}){
  return <div className="flex items-center justify-between gap-3 border-b border-[#7186976a] py-4">
    <span className="text-[15px] text-[#d6dbdc]">{label}</span>
    <b className="font-[Georgia,serif] text-[32px] font-bold text-[#ffdb9e] tabular-nums">{amount}</b>
  </div>;
}

export function Warehouse({s}:{s:WorkshopState}){
  const stored=(kind:'well'|'garden')=>s.tiles.filter(t=>t?.craft===kind).reduce((total,t)=>total+(t?.stored??0),0);
  const p=s.patron;const canBuy=!!p&&['offered','active'].includes(p.status)&&s.day<=p.due&&s.coins>=PATRON_IMPORT_PRICE;
  return <>
    <section className="mw-world-art-hero mw-warehouse-hero" data-testid="painted-warehouse-hero">
      <Image src={moonWorkshopPainting} fill unoptimized sizes="(max-width: 760px) 100vw, 1200px"
        className="mw-world-hero-painting" alt="月光工坊仓储背景绘景"/>
      <Image src={kilnPainted} width={180} height={180} unoptimized
        className="mw-warehouse-art" alt="月光晶核熔炉绘景"/>
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
    </Panel>
    <Panel title="☽ 月夜商人采购">
      <p>采购一枚晶核需要 ✦{PATRON_IMPORT_PRICE}，直接扣除真实星币并增加共享仓库库存。仅在月纱委托有效期内可购买。</p>
      {canBuy?<Action type="import">付费采购 +1 晶核</Action>:<p>当前无法采购：尚未解锁访客、委托结束或余额不足。</p>}
    </Panel>
    </div>
  </>;
}
