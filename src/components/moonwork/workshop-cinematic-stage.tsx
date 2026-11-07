'use client';

import './workshop-cinematic.css';
import Image from 'next/image';
import {useState,useSyncExternalStore} from 'react';
import {ArrowUpRight,Grid3X3,MoveRight} from 'lucide-react';
import {MACHINES,WORKERS} from '../../../v2/src/workshop-engine';
import {presentWorkshopStations} from '../../../v2/src/workshop-station-presenter';
import type {Craft,WorkshopState} from '../../../v2/src/workshop-engine';
import type {WorkshopAction} from '../../../v2/src/workshop-runtime-contract';
import {workshopAssetRoot} from '@/lib/moonwork/asset-root';
import hall from '../../../public/art/world-scenes/workshop-gothic-hall.webp';
import wellLegacy from '../../../v2/art/well-art-review.avif';
import gardenLegacy from '../../../v2/art/garden-art-review.avif';
import kilnLegacy from '../../../v2/art/kiln-art-review.avif';
import brook from '../../../public/art/beauty-beasts/characters/brook/face.webp';
import fern from '../../../public/art/beauty-beasts/characters/fern/face.webp';
import cinder from '../../../public/art/beauty-beasts/characters/cinder/face.webp';

const CRAFTS=['well','garden','kiln'] as const;
const DEFAULT_ART={well:wellLegacy,garden:gardenLegacy,kiln:kilnLegacy};
const WORKER_ART={brook,fern,cinder} as const;
const LEGEND={
  well:{serial:'I',caption:'月井水脉',material:'水汽净化与抽提'},
  garden:{serial:'II',caption:'银叶苗床',material:'孢子培植与纤维'},
  kiln:{serial:'III',caption:'晶核熔炼',material:'秘银火焰与晶核'},
} as const;

function subscribeReview(callback:()=>void){
  window.addEventListener('popstate',callback);
  return ()=>window.removeEventListener('popstate',callback);
}
function getReviewBase(){
  if(typeof window==='undefined')return '';
  return new URLSearchParams(window.location.search).get('machine-art')==='review'
    ?workshopAssetRoot(window.location.href):'';
}

/** Three oversized scene props are a VIEW of the real WorkshopState, not a new
 * game board. The fixed 15-tile Pixi board remains mounted underneath.
 * This view never mutates saves or simulates production. */
export function WorkshopCinematicStage({
  world,selectedPlot,onAction,onOpenGrid,
}:{
  world:WorkshopState;
  selectedPlot:number|null;
  onAction:(action:WorkshopAction)=>void;
  onOpenGrid:()=>void;
}){
  const base=useSyncExternalStore(subscribeReview,getReviewBase,()=> '');
  const [failedImages,setFailedImages]=useState<Partial<Record<Craft,boolean>>>({});
  const [openCraft,setOpenCraft]=useState<Craft|null>(null);
  const stations=presentWorkshopStations(world,selectedPlot).groups;

  return <div className="workshop-cinematic" data-testid="workshop-cinematic-scene"
    aria-label="月光工坊，三台主设备与真实生产工位"
    style={{backgroundImage:'linear-gradient(90deg,#0c0816b0,#14091660 48%,#0b0716b2),url('+JSON.stringify(hall.src)+')'}}>
    <div className="workshop-cinematic__topline">
      <span className="workshop-cinematic__eyebrow">MOONWORK · THE GRAND ATELIER</span>
      <span className="workshop-cinematic__chapter">第 {world.day} 日 · 月光工坊</span>
    </div>

    <div className="workshop-cinematic__stations" role="group" aria-label="真实工坊设备">
      {CRAFTS.map(craft=>{
        const group=stations[craft];
        const candidates=group.instances;
        const station=group.featured;
        const level=station?.level??1;
        const worker=station?.machine.worker??null;
        const status=station?.signal.state??null;
        const statusText=status==='working'?'生产运行中':
          status==='blocked'?'材料供应受阻':station?'等待工匠派驻':'尚未建造';
        const art=base&&!failedImages[craft]
          ?new URL('assets/review/machines/'+craft+'/lv'+level+'.webp',base).href
          :DEFAULT_ART[craft];
        const isReview=typeof art==='string';
        const legend=LEGEND[craft];
        return <div key={craft} className="workshop-cinematic__station-slot">
          <button type="button"
          data-testid={'workshop-cinematic-machine-'+craft}
          data-plot={station?.plot??'unbuilt'}
          data-level={level}
          data-state={status??'unbuilt'}
          data-art-tier={isReview?'review':'legacy'}
          aria-pressed={station?.plot===selectedPlot}
          aria-label={station
            ?'选择'+MACHINES[craft].zh+'，'+String(station.plot+1).padStart(2,'0')+'号工位，Lv.'+level
            :'建设'+MACHINES[craft].zh+'，打开建造棋盘'}
          onClick={()=>{
            if(station){
              onAction({type:'select-plot',index:station.plot});
              setOpenCraft(previous=>candidates.length>1&&previous!==craft?craft:null);
            }else{onAction({type:'choose-machine',machine:craft});onOpenGrid();}
          }}
          className={'workshop-cinematic__station workshop-cinematic__station--'+craft}
        >
          <div className="workshop-cinematic__station-halo" aria-hidden="true"/>
          <span className="workshop-cinematic__ordinal" aria-hidden="true">{legend.serial}</span>
          <div className="workshop-cinematic__machine-art">
            <Image src={art} fill alt="" aria-hidden="true"
              unoptimized={isReview}
              onError={()=>{if(isReview)setFailedImages(old=>({...old,[craft]:true}));}}
              sizes="(min-width:1600px) 350px, 29vw"
              className={isReview?'object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,.8)]':
                'object-contain opacity-90 drop-shadow-[0_12px_15px_rgba(0,0,0,.85)]'}
            />
          </div>
          <div className="workshop-cinematic__identity">
            <span className="workshop-cinematic__identity-title">
              <span>{MACHINES[craft].zh}</span><span className="workshop-cinematic__level">Lv.{level}</span>
            </span>
            <span className="workshop-cinematic__identity-detail">{legend.material}</span>
            <span className={'workshop-cinematic__state'+(status==='working'?' workshop-cinematic__state--active':'')}>
              <i aria-hidden="true"/>{statusText}
              {station&&<span> · {String(station.plot+1).padStart(2,'0')}号地块</span>}
              <ArrowUpRight size={13} aria-hidden="true"/>
            </span>
          </div>
          {worker&&<span className="workshop-cinematic__worker">
            <Image src={WORKER_ART[worker]} alt="" aria-hidden="true" width={30} height={30}/>
            <span>{WORKERS[worker].zh}</span>
          </span>}
          {candidates.length>1&&<span className="workshop-cinematic__count">
            共 {candidates.length} 台 · 点击切换工位
          </span>}
          </button>
          {openCraft===craft&&candidates.length>1&&
            <div className="workshop-cinematic__station-picker"
              role="group" aria-label={MACHINES[craft].zh+'的全部工位'}
              data-testid={'workshop-cinematic-picker-'+craft}>
              {candidates.map(candidate=>
                <button type="button" key={candidate.plot}
                  data-testid={'workshop-cinematic-choice-'+craft+'-'+candidate.plot}
                  aria-pressed={selectedPlot===candidate.plot}
                  aria-label={'选择'+MACHINES[craft].zh+' '+String(candidate.plot+1).padStart(2,'0')+'号工位，Lv.'+candidate.level}
                  onClick={()=>{
                    onAction({type:'select-plot',index:candidate.plot});
                    setOpenCraft(null);
                  }}>
                  {String(candidate.plot+1).padStart(2,'0')} · Lv.{candidate.level}
                </button>
              )}
            </div>}
        </div>;
      })}
    </div>

    <div className="workshop-cinematic__bottomline">
      <span className="workshop-cinematic__route" aria-label="生产路线">
        <span>水汽</span><MoveRight size={13} aria-hidden="true"/>
        <span>孢子</span><MoveRight size={13} aria-hidden="true"/>
        <span>晶核</span>
      </span>
      <button type="button" className="workshop-cinematic__grid-button"
        data-testid="workshop-cinematic-open-grid" onClick={onOpenGrid}>
        <Grid3X3 size={14} aria-hidden="true"/>打开 15 格建造棋盘
      </button>
    </div>
  </div>;
}
