'use client';
import Link from 'next/link';
import './world.css';
import '@/components/game/gothic-world.css';
import {useEffect} from 'react';
import {useWorkshopWorld} from './world-save-react';
import {GothicDock,GothicResourcePill} from '@/components/game/gothic-hud';
import {WORLD_NAV} from './world-navigation';
import {newWorkshop} from '../../../v2/src/workshop-engine';
import lobbyHero from '../../../public/lobby-hero.webp';
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
  return <main className="mw mw-gothic relative isolate h-dvh min-h-[560px] overflow-hidden bg-[#100910] font-serif text-[#f3dcc2] max-[700px]:min-h-0" data-testid="moonwork-world" data-area={area}>
    <div className="mw-gothic-scene pointer-events-none absolute inset-0 -z-[3] bg-[#21151d] bg-cover bg-center" aria-hidden="true" style={{backgroundImage:'url('+JSON.stringify(lobbyHero.src)+')'}}/>
    <div className="mw-gothic-shadow pointer-events-none absolute inset-0 -z-[2] bg-[linear-gradient(180deg,#09070bd9_0%,transparent_22%,transparent_65%,#09070de8_100%),linear-gradient(90deg,#10091180,transparent_35%,#0c0713a8_75%,#07050cdd_100%)]" aria-hidden="true"/>
    <Link href="/"
      className="absolute left-3 top-3 z-[8] flex h-9 items-center gap-2 rounded-full border border-gothic-brass/70 bg-gothic-panel/85 px-3 text-xs text-gothic-ivory shadow-[0_6px_20px_#0007] backdrop-blur-md transition-colors hover:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow sm:left-5"
      aria-label="返回哥特公寓大厅">⌂ <span className="hidden sm:inline">返回大厅</span>
    </Link>
    <Link href="/orders/" className="mw-gothic-character group absolute top-[15%] left-[30%] z-0 h-[68%] w-[30%] cursor-pointer no-underline max-[700px]:top-[10%] max-[700px]:left-[17%] max-[700px]:h-[31%] max-[700px]:w-[64%]" title="与月纱相见"
      aria-label="前往月纱委托"><span className="mw-gothic-character-label absolute bottom-[4%] left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] tracking-[.12em] text-[#ffe5c2] opacity-0 [text-shadow:0_3px_9px_#000] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">月纱 · 特别委托</span>
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

    <div className="mw-main absolute top-[85px] right-[clamp(12px,2.4vw,42px)] bottom-[94px] z-[4] min-h-0 w-[clamp(330px,35vw,540px)] max-w-[calc(100vw-42px)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[18px] border border-[#b9946877] bg-[linear-gradient(135deg,#241721ed,#160f19e8_48%,#1e161bdc)] px-5 pt-[18px] pb-[25px] shadow-[0_18px_70px_#08040bc9,inset_0_1px_#f5e3c933] backdrop-blur-[17px] [scrollbar-color:#ab8258_#231521] [scrollbar-width:thin] max-[700px]:top-[44%] max-[700px]:right-[10px] max-[700px]:bottom-[80px] max-[700px]:left-[10px] max-[700px]:w-auto max-[700px]:max-w-none max-[700px]:rounded-[13px] max-[700px]:px-[13px] max-[700px]:pt-[13px] max-[700px]:pb-[19px]">
      <p className="mw-eyebrow font-serif text-[10px] tracking-[.14em] text-[#bc9e7e] uppercase">MOONLIGHT RESIDENCE / {title}</p>
      <h1 className="my-[3px] mb-4 text-[clamp(23px,2.5vw,34px)] leading-[1.2] tracking-[.12em] text-[#ffdeb1] max-[700px]:text-[21px]">{title}</h1>
      {!s?<Panel title="尚无可用的 V2 工坊存档">
        <p>月光街还没有记录你的生产旅程。进入工坊，摆放设备、安排工匠并完成第一张委托；这些场景会自动呈现你的经营成果。</p>
        <WorkshopLink>进入工坊开始经营</WorkshopLink>
      </Panel>:area==='town'?<Town s={s}/>:area==='orders'?<Orders s={s}/>:area==='characters'?<Characters s={s}/>:<Warehouse s={s}/>}
    </div>
    <footer className="mw-footer absolute bottom-2.5 left-0 z-[2] border-0 bg-transparent px-[15px] py-1 text-left text-[9px] text-[#ac8e78] max-[700px]:hidden">✦ 夜色公寓 · 你的选择影响每一位住客</footer>
  </main>;
}
