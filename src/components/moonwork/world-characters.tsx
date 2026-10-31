'use client';
import Link from 'next/link';
import {WORLD_LINK_CLASS} from './world-primitives';
import Image from 'next/image';
import moonveilPortrait from '../../../public/art/yuesha-portrait-v3.webp';
import {WORKERS,MACHINES} from '../../../v2/src/workshop-engine';
import type {WorkshopState,WorkerId} from '../../../v2/src/workshop-engine';
import {HEROINE_FACE_ART} from '@/components/summon/heroine-portrait-assets';
import {CharacterLifePortrait} from '@/components/game/character-life-portrait';
import {useCharacterCollection} from '@/lib/game/character-collection-store';
import {CHARACTER_CARDS} from '@/core/character-collection';
import {siteAssetUrl} from '@/lib/game/site-asset-url';
import {CharacterAdornment} from '@/components/game/character-adornment';
import {RoomInvestigationJournal} from '@/components/game/room-investigation-journal';
import {RoomMemoryGallery} from '@/components/game/room-memory-gallery';
const ids=['brook','fern','cinder'] as const;
const faces={
  brook:'heart-wide-almond',fern:'diamond-cat-freckles',cinder:'square-heavy-brow-scar',
} as const;
/** Large-format adult-heroine gallery art. The separate Pixi workshop actor
 * remains a functional animated worker until real per-character sprites arrive. */
function WorkerPainting({id,label,working}:{
  id:WorkerId;label:string;working:boolean;
}){
  return <div className={'mw-worker-portrait mw-worker-portrait--'+id}
    data-figure-kind="humanoid" data-art-source="dedicated-heroine-portrait">
    <Image src={HEROINE_FACE_ART[id]} fill loading="eager"
      sizes="(max-width:700px) 92vw, (max-width:1050px) 47vw, 31vw"
      alt={label+'的独立人像绘景'}
      className="mw-worker-portrait-photo" data-art-source="dedicated-heroine-face"
      data-face-morphology={faces[id]}/>
    <CharacterAdornment id={id}/>
    {working&&<span className="mw-worker-on-duty" aria-label="正在工坊值班">值班中</span>}
    <span className="mw-worker-role">
      {id==='brook'?'水系术师':id==='fern'?'精灵植物学家':'赤金锻造师'}
    </span>
  </div>;
}

export function Characters({s,onVisit}:{s:WorkshopState;onVisit:(id:WorkerId)=>void}){
  const {status,collection}=useCharacterCollection();
  const collectedCount=new Set(collection.draws).size;
  return <>
    <section className="mw-art-gallery-intro mt-6" data-testid="character-gallery-header">
      <span className="mw-eyebrow">WORKER ROSTER · THE PEOPLE OF MOONLIGHT WORKSHOP</span>
      <h2>四位成年人物，各有自己的契约与秘密。</h2>
      <p>月纱、泉泡、青枝与炽角均为成年人物。召唤契约提升人物潜力，打造装备后提升属性；拜访私人房间可以发现新的故事线索。</p>
      <div className="mw-persona-quick-nav">
        <span data-testid="gallery-collected-count">{status==='ok'?'已收录人物契约 '+collectedCount+'/5':'人物收藏存档需要处理'}</span>
        {/* Native same-page hash navigation is intentional: the router listens for hashchange.\n            Prefix it for GitHub Pages; Next Link pushState may not fire hashchange. */}
        <a href={siteAssetUrl('/characters/#summon-screen')} data-testid="open-cinematic-summon" className="mw-persona-summon-link">进入契约召唤</a>
      </div>
    </section>
    <div className="mw-worker-grid" data-testid="painted-worker-gallery">
      {ids.map((id:WorkerId,i)=>{
        const w=WORKERS[id];const plot=s.tiles.findIndex(t=>t?.worker===id);
        const working=plot>=0;
        const isCollected=CHARACTER_CARDS.some(card=>
          card.character===id&&collection.draws.includes(card.key));
        return <section key={id} className={'mw-worker-card '+(working?'on-duty':'off-duty')}
          data-testid={'worker-card-'+id}>
          <WorkerPainting id={id} label={w.zh} working={working}/>
          <div className="mw-worker-details">
            <p className="mw-eyebrow">GUILD PERSONNEL · {String(i+1).padStart(2,'0')}</p>
            <h2>{w.zh} <small>{w.en}</small></h2>
            <span data-testid={'character-contract-status-'+id}
              className={'inline-flex w-fit rounded border px-2 py-1 text-[11px] '+(isCollected
                ?'border-[#dcb277] bg-[#55304a] text-[#ffe0b2]'
                :'border-[#87755a] bg-[#1b1920] text-[#c5b4a3]')}>
              {isCollected?'✦ 契约已收录':'剧情相识 · 契约待召唤'}
            </span>
            <p className="mw-worker-job">{w.skill==='water'?'水汽制造':w.skill==='plant'?'孢子种植':'晶核锻造'}专长</p>
            <p className="mw-worker-assignment">{working
              ?'正在 '+String(plot+1).padStart(2,'0')+' 号工位 · '+MACHINES[s.tiles[plot]!.craft].zh
              :'目前待派工'}</p>
            <CharacterLifePortrait id={id} activity={working?'在工坊值守':'目前待派工 · 可以休息'}/>
            <button type="button" onClick={()=>onVisit(id)}
              data-testid={'visit-worker-room-'+id}
              className="mt-2 min-h-11 rounded-lg border border-gothic-gold/70 bg-gothic-wine/60 px-4 py-2 text-xs text-gothic-ivory hover:border-gothic-glow hover:bg-gothic-wine focus-visible:outline-2 focus-visible:outline-gothic-glow">
              拜访{w.zh}的私人房间 ↗
            </button>
            <Link href={'/workshop/?worker='+id} className={WORLD_LINK_CLASS+' mt-auto w-full max-[620px]:px-2 max-[620px]:text-[11px]'}
              aria-label={'安排'+w.zh+'到工坊'}>前往工坊安排岗位 ↗</Link>
          </div>
        </section>;
      })}
    </div>
    <RoomInvestigationJournal/>
    <RoomMemoryGallery/>
    <section className="mw-witch-banner">
      <div className="mw-witch-painting">
        <Image src={moonveilPortrait} fill unoptimized sizes="150px"
          alt="成年魔女商人月纱的绘制立绘"/>
        <CharacterAdornment id="yuesha" compact/>
      </div>
      <div><p className="mw-eyebrow">MOONLIT COMMISSIONS · THE MERCHANT</p>
        <h2>月纱 · 28 岁月夜魔女</h2>
        <p>她的委托从真实库存扣除晶核，并与普通订单竞争交付资源。
          {s.patron?'当前委托状态：'+s.patron.status:'首张正式订单完成后解锁。'}</p>
        <CharacterLifePortrait id="yuesha"/>
        <div className="flex flex-wrap gap-2">
          <Link className={WORLD_LINK_CLASS} href="/apartment/?visit=yuesha">拜访月纱会客室 ↗</Link>
          <Link className={WORLD_LINK_CLASS} href="/orders/">进入委托大厅 ↗</Link>
        </div>
      </div>
    </section>
  </>;
}
