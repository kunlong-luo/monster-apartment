'use client';
import Link from 'next/link';
import {useEffect} from 'react';
import {useWorkshopWorld} from './world-save-react';
import {GothicDock,GothicResourcePill} from '@/components/game/gothic-hud';
import {WORLD_NAV} from './world-navigation';
import {newWorkshop} from '../../../v2/src/workshop-engine';
import {SAVE_KEY,CHANGE_EVENT} from '@/lib/moonwork/world-store';
import {Panel,WorkshopLink} from './world-primitives';
import {Town} from './world-town';
import {Orders} from './world-orders';
import {Characters} from './world-characters';
import {Warehouse} from './world-warehouse';

export type WorldArea='town'|'orders'|'characters'|'warehouse';

export function MoonworkWorld({area}:{area:WorldArea}){
  const s=useWorkshopWorld();
  useEffect(()=>{
    // The world must exist whether a new player enters via town or workshop.
    // Missing is not the same as corrupted: never overwrite an existing key,
    // even if its value is invalid, without the player's consent.
    try{
      if(window.localStorage.getItem(SAVE_KEY)===null){
        window.localStorage.setItem(SAVE_KEY,JSON.stringify(newWorkshop()));
        window.dispatchEvent(new Event(CHANGE_EVENT));
      }
    }catch{/* Storage may be unavailable; keep the no-save recovery screen. */}
  },[]);
  const title={town:'月光街',orders:'委托大厅',characters:'角色图鉴',warehouse:'魔法仓库'}[area];
  return <main className="mw mw-gothic" data-testid="moonwork-world" data-area={area}>
    <div className="mw-gothic-scene" aria-hidden="true" style={{backgroundImage:'url('+'../lobby-hero.webp'+')'}}/>
    <div className="mw-gothic-shadow" aria-hidden="true"/>
    <Link href="/"
      className="absolute left-3 top-3 z-[8] flex h-9 items-center gap-2 rounded-full border border-gothic-brass/70 bg-gothic-panel/85 px-3 text-xs text-gothic-ivory shadow-[0_6px_20px_#0007] backdrop-blur-md transition-colors hover:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow sm:left-5"
      aria-label="返回哥特公寓大厅">⌂ <span className="hidden sm:inline">返回大厅</span>
    </Link>
    <Link href="/orders/" className="mw-gothic-character" title="与月纱相见"
      aria-label="前往月纱委托"><span className="mw-gothic-character-label">月纱 · 特别委托</span>
    </Link>
    <header className="pointer-events-none absolute inset-x-0 top-0 z-[5] flex min-h-[70px] justify-end gap-2 bg-[linear-gradient(#110914cd,transparent)] px-3 py-3 sm:px-6">
      <div className="pointer-events-auto flex flex-wrap items-start justify-end gap-1.5 sm:gap-2" aria-label="工坊真实资源">
        <GothicResourcePill symbol="☾" amount={s?.day??'—'} label="天数" testId="world-day"/>
        <GothicResourcePill symbol="✦" amount={s?.coins??'—'} label="星币" testId="world-coins"/>
        <GothicResourcePill symbol="◆" amount={s?.warehouse.core??'—'} label="晶核" testId="world-cores"/>
      </div>
    </header>
    <GothicDock label="月光工坊世界" activeHref={'/'+area+'/'}
      items={WORLD_NAV.map(n=>({href:n.href,icon:n.glyph,label:n.label,ariaLabel:n.full}))}/>

    <div className="mw-main">
      <p className="mw-eyebrow">MOONLIGHT RESIDENCE / {title}</p>
      <h1>{title}</h1>
      {!s?<Panel title="尚无可用的 V2 工坊存档">
        <p>月光街还没有记录你的生产旅程。进入工坊，摆放设备、安排工匠并完成第一张委托；这些场景会自动呈现你的经营成果。</p>
        <WorkshopLink className="mw-button">进入工坊开始经营</WorkshopLink>
      </Panel>:area==='town'?<Town s={s}/>:area==='orders'?<Orders s={s}/>:area==='characters'?<Characters s={s}/>:<Warehouse s={s}/>}
    </div>
    <footer className="mw-footer">✦ 夜色公寓 · 你的选择影响每一位住客</footer>
  </main>;
}
