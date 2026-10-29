'use client';
import './world.css';
import '@/components/game/gothic-world.css';
import {useEffect,useState} from 'react';
import {ensureWorkshopWorld} from '@/lib/moonwork/world-state';
import {useWorkshopWorld} from './world-save-react';
import {GothicDock,GothicResourcePill} from '@/components/game/gothic-hud';
import {WORLD_NAV} from './world-navigation';
import lobbyHero from '../../../public/art/lobby-hero-v3.webp';
import {Panel,WorkshopLink} from './world-primitives';
import {Town} from './world-town';
import {Orders} from './world-orders';
import {Characters} from './world-characters';
import {WorkerPrivateRoom} from '@/components/game/worker-private-room';
import type {WorkerCharacterId} from '@/core/character-life';
import {Warehouse} from './world-warehouse';

export type WorldArea='town'|'orders'|'characters'|'warehouse';

export function MoonworkWorld({area}:{area:WorldArea}){
  const s=useWorkshopWorld();
  const [visiting,setVisiting]=useState<WorkerCharacterId|null>(null);
  useEffect(()=>{void ensureWorkshopWorld();},[]);
  const section=WORLD_NAV.find(destination=>destination.id===area)!;
  const title=section.full;
  return <main className="mw mw-gothic relative isolate h-dvh min-h-[560px] overflow-hidden bg-[#100910] font-serif text-[#f3dcc2] max-[700px]:min-h-0" data-testid="moonwork-world" data-area={area}>
    <div className="mw-gothic-scene pointer-events-none absolute inset-0 -z-[3] bg-[#21151d] bg-cover bg-center" aria-hidden="true" style={{backgroundImage:'url('+JSON.stringify(lobbyHero.src)+')'}}/>
    <div className="mw-gothic-shadow pointer-events-none absolute inset-0 -z-[2] bg-[linear-gradient(180deg,#09070bd9_0%,transparent_22%,transparent_65%,#09070de8_100%),linear-gradient(90deg,#10091180,transparent_35%,#0c0713a8_75%,#07050cdd_100%)]" aria-hidden="true"/>


    <header className="pointer-events-none absolute inset-x-0 top-0 z-[5] flex min-h-[70px] justify-end gap-2 bg-[linear-gradient(#110914cd,transparent)] px-3 py-3 sm:px-6">
      <div className="pointer-events-auto flex flex-wrap items-start justify-end gap-1.5 sm:gap-2" aria-label="工坊真实资源">
        <GothicResourcePill symbol="☾" amount={s?.day??'—'} label="天数" testId="world-day"/>
        <GothicResourcePill symbol="✦" amount={s?.coins??'—'} label="星币" testId="world-coins"/>
        <GothicResourcePill symbol="◆" amount={s?.warehouse.core??'—'} label="晶核" testId="world-cores"/>
      </div>
    </header>
    <GothicDock label="月光工坊世界" activeHref={'/'+area+'/'}
      items={WORLD_NAV.map(n=>({href:n.href,icon:n.glyph,label:n.label,ariaLabel:n.full,description:n.purpose}))}/>

    <div className={'mw-main '+(area==='characters'?'mw-main--summon ':'')+'absolute top-[85px] right-[clamp(12px,2.4vw,42px)] bottom-[94px] z-[4] min-h-0 w-[clamp(330px,35vw,540px)] max-w-[calc(100vw-42px)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[18px] border border-[#b9946877] bg-[linear-gradient(135deg,#241721ed,#160f19e8_48%,#1e161bdc)] px-5 pt-[18px] pb-[25px] shadow-[0_18px_70px_#08040bc9,inset_0_1px_#f5e3c933] backdrop-blur-[17px] [scrollbar-color:#ab8258_#231521] [scrollbar-width:thin] max-[700px]:top-[44%] max-[700px]:right-[10px] max-[700px]:bottom-[80px] max-[700px]:left-[10px] max-[700px]:w-auto max-[700px]:max-w-none max-[700px]:rounded-[13px] max-[700px]:px-[13px] max-[700px]:pt-[13px] max-[700px]:pb-[19px]'}>
      <p className="mw-eyebrow font-serif text-[10px] tracking-[.14em] text-[#bc9e7e] uppercase"
        data-testid="game-location">大厅 / {title}</p>
      <h1 className="my-[3px] text-[clamp(23px,2.5vw,34px)] leading-[1.2] tracking-[.12em] text-[#ffdeb1] max-[700px]:text-[21px]">{title}</h1>
      <p data-testid="game-page-purpose" className="mb-4 text-xs leading-relaxed text-[#e4c9a8]">{section.purpose}</p>
      {!s?<Panel title="尚无可用的 V2 工坊存档">
        <p>月光街还没有记录你的生产旅程。进入工坊，摆放设备、安排工匠并完成第一张委托；这些场景会自动呈现你的经营成果。</p>
        <WorkshopLink>进入工坊开始经营</WorkshopLink>
      </Panel>:area==='town'?<Town s={s}/>:area==='orders'?<Orders s={s}/>:area==='characters'?<Characters s={s} onVisit={id=>setVisiting(id)}/>:<Warehouse s={s}/>}
    </div>
    {area==='characters'&&s&&visiting&&<WorkerPrivateRoom id={visiting}
      working={s.tiles.some(tile=>tile?.worker===visiting)}
      onClose={()=>setVisiting(null)}/>}
    <footer className="mw-footer absolute bottom-2.5 left-0 z-[2] border-0 bg-transparent px-[15px] py-1 text-left text-[9px] text-[#ac8e78] max-[700px]:hidden">✦ 夜色公寓 · 你的选择影响每一位住客</footer>
  </main>;
}
