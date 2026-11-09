'use client';

import './workshop-cinematic.css';
import Image from 'next/image';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {motion} from 'motion/react';
import {ArrowUpRight,Grid3X3,MoveRight} from 'lucide-react';
import {MACHINES,WORKERS,projectMachineProduction} from '../../../v2/src/workshop-engine';
import {presentWorkshopStations} from '../../../v2/src/workshop-station-presenter';
import type {Craft,DailyProduction,WorkshopState} from '../../../v2/src/workshop-engine';
import type {WorkshopAction} from '../../../v2/src/workshop-runtime-contract';
import {workshopAssetRoot} from '@/lib/moonwork/asset-root';
import {
  approvedMachineUrls,workerPaintingUrls,
  type ApprovedMachineUrls,type WorkerPaintingUrls
} from '@/lib/moonwork/workshop-machine-art-index';
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
function allowSceneMotion(){
  if(typeof window==='undefined')return false;
  try{
    if(window.localStorage.getItem('monster-apartment:gothic-motion-reduced')==='1')
      return false;
  }catch{/* Storage can be unavailable; system preference still applies. */}
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function subscribeSceneMotion(onChange:()=>void){
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change',onChange);
  window.addEventListener('monster-apartment:motion-changed',onChange);
  window.addEventListener('storage',onChange);
  return ()=>{
    media.removeEventListener('change',onChange);
    window.removeEventListener('monster-apartment:motion-changed',onChange);
    window.removeEventListener('storage',onChange);
  };
}

/** Three oversized scene props are a VIEW of the real WorkshopState, not a new
 * game board. The fixed 15-tile Pixi board remains mounted underneath.
 * This view never mutates saves or simulates production. */
export function WorkshopCinematicStage({
  world,worldReady,selectedPlot,onAction,onOpenGrid,
}:{
  world:WorkshopState;
  worldReady:boolean;
  selectedPlot:number|null;
  onAction:(action:WorkshopAction)=>void;
  onOpenGrid:()=>void;
}){
  const base=useSyncExternalStore(subscribeReview,getReviewBase,()=> '');
  const motionEnabled=useSyncExternalStore(subscribeSceneMotion,allowSceneMotion,()=>false);
  const [reviewCandidate,setReviewCandidate]=useState(true);
  const [failedImages,setFailedImages]=useState<Partial<Record<Craft,boolean>>>({});
  const [failedReadyImages,setFailedReadyImages]=useState<Partial<Record<Craft,boolean>>>({});
  const [approvedPaintings,setApprovedPaintings]=useState<ApprovedMachineUrls>({});
  const [workerPaintings,setWorkerPaintings]=useState<{
    ready:WorkerPaintingUrls;review:WorkerPaintingUrls
  }>({ready:{},review:{}});
  const [failedWorkerImages,setFailedWorkerImages]=useState<Record<string,boolean>>({});
  const [openCraft,setOpenCraft]=useState<Craft|null>(null);
  useEffect(()=>{
    let active=true;
    // Production and Pixi share the audited READY-only index. Legacy AVIFs
    // remain when no painting has passed human QA or a fetch/decode fails.
    const root=workshopAssetRoot(window.location.href);
    void fetch(new URL('assets/machine-art-index.json',root),{cache:'no-store'})
      .then(response=>{
        if(!response.ok)throw Error('Machine art index unavailable');
        return response.json() as Promise<unknown>;
      })
      .then(index=>{
        if(!active)return;
        setApprovedPaintings(approvedMachineUrls(index,root));
        setWorkerPaintings({
          ready:workerPaintingUrls(index,root,'ready'),
          review:workerPaintingUrls(index,root,'review')
        });
      })
      .catch(()=>{
        if(!active)return;
        setApprovedPaintings({});
        setWorkerPaintings({ready:{},review:{}});
      });
    return ()=>{active=false;};
  },[]);
  // A transient VIEW of an actual completed shift. Initial hydration must not
  // replay the persisted last report as if production just happened.
  const observedDay=useRef<number|null>(null);
  const [settledShift,setSettledShift]=useState<{
    day:number;report:DailyProduction
  }|null>(null);
  useEffect(()=>{
    // Connect the real persisted world before tracking days. Otherwise the
    // initial fallback newWorkshop() -> hydrated day N looks like an earned shift.
    if(!worldReady){
      observedDay.current=null;
      return;
    }
    const previous=observedDay.current;
    observedDay.current=world.day;
    if(previous!==null&&world.day>previous&&world.last)
      setSettledShift({day:world.day,report:world.last});
    else if(previous!==null&&world.day<previous)
      setSettledShift(null);
  },[worldReady,world.day,world.last]);
  const stations=presentWorkshopStations(world,selectedPlot).groups;
  // Use the exact deterministic settlement projection; never calculate a
  // second fake visual throughput. No economy mutation or animation ticker.
  const production=projectMachineProduction(world);
  const waterLinked=production.cycles.some(c=>c.craft==='garden'&&c.amount>0&&c.sourceIndex!==null);
  const fiberLinked=production.cycles.some(c=>c.craft==='kiln'&&c.amount>0&&c.sourceIndex!==null);

  return <div className="workshop-cinematic" data-testid="workshop-cinematic-scene"
    data-motion={motionEnabled?'running':'paused'}
    aria-label="月光工坊，三台主设备与真实生产工位"
    style={{backgroundImage:'linear-gradient(90deg,#0c0816b0,#14091660 48%,#0b0716b2),url('+JSON.stringify(hall.src)+')'}}>
    <div className="workshop-cinematic__topline">
      <span className="workshop-cinematic__eyebrow">MOONWORK · THE GRAND ATELIER</span>
      {base&&<div className="workshop-cinematic__art-compare"
        data-testid="workshop-art-compare" role="group" aria-label="设备候选与旧画对照">
        <span>仅供原画审查</span>
        <button type="button" aria-pressed={!reviewCandidate}
          data-testid="workshop-art-compare-legacy"
          onClick={()=>setReviewCandidate(false)}>旧版</button>
        <button type="button" aria-pressed={reviewCandidate}
          data-testid="workshop-art-compare-review"
          onClick={()=>setReviewCandidate(true)}>512px 候选</button>
      </div>}
      <span className="workshop-cinematic__chapter">第 {world.day} 日 · 月光工坊</span>
    </div>

    <span className="sr-only" aria-live="polite" aria-atomic="true"
      data-testid="workshop-cinematic-shift-announcement">
      {settledShift&&'第'+(settledShift.day-1)+'日生产完成，'+
        '水汽 '+settledShift.report.water+'，孢子 '+settledShift.report.fiber+
        '，晶核 '+settledShift.report.cores}
    </span>
    <div className="workshop-cinematic__stations" role="group" aria-label="真实工坊设备">
      {CRAFTS.map(craft=>{
        const group=stations[craft];
        const candidates=group.instances;
        const station=group.featured;
        const level=station?.level??1;
        const worker=station?.machine.worker??null;
        // Never display an unapproved worker in normal gameplay. Review
        // paintings are eligible only on the explicit ?machine-art=review
        // route, and that route's "旧版" toggle returns to the portrait.
        const workerTier=base?(reviewCandidate?'review':null):'ready';
        const candidateWorkerArt=worker&&workerTier
          ?workerPaintings[workerTier][worker]:undefined;
        const fullWorkerArt=worker&&workerTier&&
          !failedWorkerImages[workerTier+':'+worker]
          ?candidateWorkerArt:undefined;
        const status=station?.signal.state??null;
        const cycle=production.cycles.find(c=>c.index===station?.plot);
        const shiftedOutput=settledShift
          ?(craft==='well'?settledShift.report.water:
            craft==='garden'?settledShift.report.fiber:settledShift.report.cores)
          :0;
        const outputName=craft==='well'?'水汽':craft==='garden'?'孢子':'晶核';
        const statusText=status==='working'?'生产运行中':
          status==='blocked'?'材料供应受阻':station?'等待工匠派驻':'尚未建造';
        const reviewArt=base&&reviewCandidate&&!failedImages[craft]
          ?new URL('assets/review/machines/'+craft+'/lv'+level+'.webp',base).href
          :null;
        const readyArt=!base&&!failedReadyImages[craft]
          ?approvedPaintings[craft]?.[String(level) as '1'|'2'|'3']
          :null;
        const art=reviewArt??readyArt??DEFAULT_ART[craft];
        const isReview=Boolean(reviewArt);
        const isReady=Boolean(readyArt);
        const legend=LEGEND[craft];
        return <div key={craft} className="workshop-cinematic__station-slot">
          <button type="button"
          data-testid={'workshop-cinematic-machine-'+craft}
          data-plot={station?.plot??'unbuilt'}
          data-level={level}
          data-state={status??'unbuilt'}
          data-art-tier={isReview?'review':isReady?'ready':'legacy'}
          aria-pressed={station?.plot===selectedPlot}
          aria-label={station
            ?'选择'+MACHINES[craft].zh+'，'+String(station.plot+1).padStart(2,'0')+'号工位，Lv.'+level+'，'+statusText+'，'+(worker?'工匠'+WORKERS[worker].zh:'未派工')
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
            <Image
              key={isReview?'review-'+craft+'-'+level:
                isReady?'ready-'+craft+'-'+level:'legacy-'+craft}
              src={art} fill alt="" aria-hidden="true"
              unoptimized={isReview||isReady}
              onError={()=>{
                if(isReview)setFailedImages(old=>({...old,[craft]:true}));
                else if(isReady)setFailedReadyImages(old=>({...old,[craft]:true}));
              }}
              sizes="(min-width:1600px) 350px, 29vw"
              className={isReview?'object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,.8)]':
                'object-contain opacity-90 drop-shadow-[0_12px_15px_rgba(0,0,0,.85)]'}
            />
            {shiftedOutput>0&&<motion.span
              key={settledShift!.day+'-'+craft}
              data-testid={'workshop-shift-output-'+craft}
              className="workshop-cinematic__shift-output"
              initial={motionEnabled?{opacity:0,y:12}:{opacity:1,y:0}}
              animate={motionEnabled
                ?{opacity:[0,1,1,0],y:[12,0,-2,-20]}
                :{opacity:1,y:0}}
              transition={motionEnabled
                ?{duration:3.1,times:[0,.15,.76,1],ease:'easeOut'}
                :{duration:0}}
              onAnimationComplete={()=>{
                if(motionEnabled)
                  setSettledShift(current=>current?.day===settledShift?.day?null:current);
              }}
            >
              <span className="workshop-cinematic__shift-caption">本班合计</span>
              <strong>{outputName} +{shiftedOutput}</strong>
            </motion.span>}
          </div>
          <div className="workshop-cinematic__identity">
            <span className="workshop-cinematic__identity-title">
              <span>{MACHINES[craft].zh}</span><span className="workshop-cinematic__level">Lv.{level}</span>
            </span>
            <span className="workshop-cinematic__identity-detail">{legend.material}</span>
            <span className={'workshop-cinematic__state'+(status==='working'?' workshop-cinematic__state--active':status==='blocked'?' workshop-cinematic__state--blocked':' workshop-cinematic__state--idle')}>
              <i aria-hidden="true"/>{statusText}
              {station&&<span> · {String(station.plot+1).padStart(2,'0')}号地块</span>}
              <ArrowUpRight size={13} aria-hidden="true"/>
            </span>
            {station&&<span className="workshop-cinematic__stock"
              data-testid={'workshop-cinematic-stock-'+craft}>
              {craft==='kiln'?'晶核直入仓库':'设备暂存 '}
              {craft!=='kiln'&&<strong>{station.machine.stored}</strong>}
              <span className="workshop-cinematic__forecast"
                data-testid={'workshop-cinematic-forecast-'+craft}>
                本班预计 +{cycle?.amount??0}
              </span>
            </span>}
          </div>
          {worker&&<span className="workshop-cinematic__worker"
            data-testid={'workshop-cinematic-worker-'+craft}
            data-state={status??'idle'}
            data-art-tier={fullWorkerArt?workerTier:'portrait'}>
            <Image
              key={fullWorkerArt?workerTier+'-'+worker:'portrait-'+worker}
              data-testid={'workshop-cinematic-worker-img-'+craft}
              src={fullWorkerArt??WORKER_ART[worker]} alt="" aria-hidden="true"
              unoptimized={Boolean(fullWorkerArt)}
              width={fullWorkerArt?512:72} height={fullWorkerArt?768:88}
              sizes={fullWorkerArt?'(min-width:1600px) 128px, 10vw':'72px'}
              onError={()=>{
                if(fullWorkerArt&&workerTier)
                  setFailedWorkerImages(old=>({...old,[workerTier+':'+worker]:true}));
              }}
            />
            <span className="workshop-cinematic__worker-label">{WORKERS[worker].zh}</span>
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
        <span>水汽</span>
        <MoveRight size={13} aria-hidden="true" data-testid="workshop-route-water"
          data-active={waterLinked?'true':'false'}/>
        <span>孢子</span>
        <MoveRight size={13} aria-hidden="true" data-testid="workshop-route-fiber"
          data-active={fiberLinked?'true':'false'}/>
        <span>晶核</span>
      </span>
      <button type="button" className="workshop-cinematic__grid-button"
        data-testid="workshop-cinematic-open-grid" onClick={onOpenGrid}>
        <Grid3X3 size={14} aria-hidden="true"/>打开 15 格建造棋盘
      </button>
    </div>
  </div>;
}
