'use client';

import './character-gallery-scene.css';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {Archive,BookOpen,DoorOpen,Gem,Heart,Image as ImageIcon,Mail,ScrollText,Volume2} from 'lucide-react';
import {GothicDock,GothicResourcePill,GothicModal} from '@/components/game/gothic-hud';
import {ReliableImage} from '@/components/game/reliable-image';
import {CharacterLifePortrait} from '@/components/game/character-life-portrait';
import {RoomInvestigationJournal} from '@/components/game/room-investigation-journal';
import {RoomMemoryGallery} from '@/components/game/room-memory-gallery';
import {WorkerPrivateRoom} from '@/components/game/worker-private-room';
import {SummonCollectionArchive} from '@/components/summon/summon-collection-archive';
import {getCardFace,getCardPortraitFallback,getCardPortraitKind} from '@/components/summon/heroine-portrait-assets';
import {useCharacterCollection} from '@/lib/game/character-collection-store';
import {siteAssetUrl} from '@/lib/game/site-asset-url';
import {ensureWorkshopWorld} from '@/lib/moonwork/world-state';
import {useWorkshopWorld} from './world-save-react';
import hallBackdrop from '../../../public/art/world-scenes/workshop-gothic-hall.webp';
import {WORLD_NAV} from './world-navigation';
import {CHARACTER_CARDS,FORGE_RECIPES,characterAbilities} from '@/core/character-collection';
import type {CardKey} from '@/core/character-collection';
import {ABILITY_LABELS,CHARACTER_PROFILES} from '@/core/character-life';
import type {WorkerCharacterId} from '@/core/character-life';

const CARD_ORDER:readonly CardKey[]=[
  'yuesha-eclipse','yuesha-vow','brook-tide','fern-spring','cinder-ember',
];
const CARD_SUBTITLE:Record<CardKey,string>={
  'yuesha-eclipse':'神话月蚀',
  'yuesha-vow':'月下誓约',
  'brook-tide':'泉泡',
  'fern-spring':'青枝',
  'cinder-ember':'炽角',
};
const CARD_CLASS:Record<CardKey,string>={
  'yuesha-eclipse':'mythic','yuesha-vow':'legend',
  'brook-tide':'tide','fern-spring':'forest','cinder-ember':'ember',
};
const CARD_RARITY:Record<CardKey,string>={
  'yuesha-eclipse':'SSR · 神话月蚀',
  'yuesha-vow':'SSR · 传说',
  'brook-tide':'N · 普通',
  'fern-spring':'R · 稀有',
  'cinder-ember':'SR · 史诗',
};
const cards=CARD_ORDER.map(key=>CHARACTER_CARDS.find(card=>card.key===key)!);

export function CharacterGalleryScene(){
  const world=useWorkshopWorld();
  const {collection,status}=useCharacterCollection();
  const [selectedKey,setSelectedKey]=useState<CardKey>('yuesha-eclipse');
  const [detailTab,setDetailTab]=useState<'attributes'|'story'|'training'>('attributes');
  const [overlay,setOverlay]=useState<'memories'|'art'|null>(null);
  const [archiveOpen,setArchiveOpen]=useState(false);
  const [visiting,setVisiting]=useState<WorkerCharacterId|null>(null);

  useEffect(()=>{void ensureWorkshopWorld();},[]);
  useEffect(()=>{
    const target=new URLSearchParams(window.location.search).get('visit');
    if(target==='brook'||target==='fern'||target==='cinder'){
      const id=window.requestAnimationFrame(()=>setVisiting(target));
      return ()=>window.cancelAnimationFrame(id);
    }
  },[]);
  const closeVisit=()=>{
    setVisiting(null);
    const url=new URL(window.location.href);
    if(url.searchParams.has('visit')){
      url.searchParams.delete('visit');
      window.history.replaceState(window.history.state,'',url.pathname+url.search+url.hash);
    }
  };
  const selected=cards.find(card=>card.key===selectedKey)!;
  const person=CHARACTER_PROFILES[selected.character];
  const abilities=status==='ok'?characterAbilities(selected.character,collection):person.abilities;
  const owned=new Set(collection.draws);
  const collectedCount=owned.size;
  const portrait=getCardFace(selected.key,'feature');
  const installed=Object.values(collection.equipped[selected.character]??{})
    .map(id=>FORGE_RECIPES.find(item=>item.id===id)?.name)
    .filter(Boolean);
  const enterRoom=(id:WorkerCharacterId)=>setVisiting(id);
  const roomUrl=selected.character==='yuesha'?'/apartment/?visit=yuesha':
    '/characters/?visit='+selected.character;

  return <main className="cg-scene" data-testid="moonwork-world" data-area="characters">
    <div className="cg-scene__background" aria-hidden="true"
      style={{backgroundImage:"url("+JSON.stringify(hallBackdrop.src)+")"}}/>
    <div className="cg-scene__vignette" aria-hidden="true"/>
    <header className="cg-topbar">
      <Link href="/" className="cg-brand" aria-label="怪物公寓 · 返回大厅">
        <span className="cg-brand__title">怪物公寓</span>
        <span className="cg-brand__subtitle">MONSTER APARTMENT</span>
      </Link>
      <div className="cg-topbar__resource" aria-label="游戏实际资源">
        <GothicResourcePill symbol="☾" amount={world?.day??'—'} label="天数" testId="world-day"/>
        <GothicResourcePill symbol="◇" amount={world?.warehouse.core??'—'} label="晶核" testId="world-cores"/>
        <GothicResourcePill symbol="◈" amount={world?.coins??'—'} label="星币" testId="world-coins"/>
        <Link href="/orders/" className="cg-topbar__mail" title="打开委托大厅" aria-label="打开委托大厅">
          <Mail size={23} strokeWidth={1.7}/>
        </Link>
      </div>
    </header>

    <div className="cg-layout">
      <nav className="cg-sidebar" aria-label="人物图鉴功能">
        <span className="cg-sidebar__ornament" aria-hidden="true">❦</span>
        <span className="cg-sidebar__item cg-sidebar__item--active" aria-current="page">
          <BookOpen size={20}/>角色图鉴
        </span>
        <a href={siteAssetUrl('/characters/#summon-screen')} data-testid="open-cinematic-summon"
          className="cg-sidebar__item"><Gem size={20}/>契约召唤</a>
        <button type="button" className="cg-sidebar__item" onClick={()=>setOverlay('memories')}>
          <Heart size={20}/>羁绊故事
        </button>
        {selected.character==='yuesha'
          ?<Link className="cg-sidebar__item" href="/apartment/?visit=yuesha">
            <DoorOpen size={20}/>个人房间</Link>
          :<button type="button" className="cg-sidebar__item"
            onClick={()=>enterRoom(selected.character as WorkerCharacterId)}>
            <DoorOpen size={20}/>个人房间</button>}
        <button type="button" className="cg-sidebar__item" onClick={()=>setOverlay('art')}>
          <ImageIcon size={20}/>立绘欣赏
        </button>
        <button type="button" className="cg-sidebar__item" onClick={()=>setArchiveOpen(true)}>
          <Archive size={20}/>CG 收藏
        </button>
        <span className="cg-sidebar__item cg-sidebar__item--unavailable" aria-label="语音档案尚未开放">
          <Volume2 size={20}/>语音档案
          <small>待开放</small>
        </span>
      </nav>

      <section className="cg-gallery" aria-label="A05 人物立绘全集">
        <header className="cg-heading" data-testid="character-gallery-header">
          <h1>A05 人物立绘全集 <span>({collectedCount}/5)</span></h1>
          <p>主要角色 · 正式立绘 · 契约档案</p>
          {status!=='ok'&&<p role="alert" className="cg-storage-error">
            人物收藏存档暂不可读取，未修改原有数据。</p>}
        </header>
        <div className="cg-cards" data-testid="painted-worker-gallery">
          {cards.map((card,index)=>{
            const art=getCardFace(card.key,'feature');
            const collected=owned.has(card.key);
            return <article key={card.key}
              className={'cg-card cg-card--'+CARD_CLASS[card.key]+(selectedKey===card.key?' cg-card--selected':'')}
              data-testid={card.character==='yuesha'?'gallery-card-'+card.key:'worker-card-'+card.character}
              data-owned={collected}>
              <button type="button" className="cg-card__select"
                aria-pressed={selectedKey===card.key}
                aria-label={'选择'+card.title+' · '+(collected?'已收录':'尚未收录')}
                onClick={()=>{setSelectedKey(card.key);setDetailTab('attributes');}}>
                <div className="cg-card__art">
                  {art&&<ReliableImage src={art} fallbackSrc={getCardPortraitFallback(card.key)??undefined}
                    fill unoptimized priority={index<2} sizes="(max-width:700px) 68vw, (max-width:1050px) 24vw, 14vw"
                    className="cg-card__image" alt={card.title+'人物肖像'}
                    data-art-kind={getCardPortraitKind(card.key)}/>}
                  <span className="cg-card__halo" aria-hidden="true"/>
                  {!collected&&<span className="cg-card__lock">尚未收录</span>}
                </div>
                <span className="cg-card__caption">
                  <strong>{CARD_SUBTITLE[card.key]}</strong>
                  <small>{CARD_RARITY[card.key]}</small>
                </span>
              </button>
              {card.character!=='yuesha'&&<button type="button"
                className="cg-card__quick-room" title={'拜访'+CHARACTER_PROFILES[card.character].name+'的房间'}
                data-testid={'visit-worker-room-'+card.character}
                aria-label={'拜访'+CHARACTER_PROFILES[card.character].name+'的房间'}
                onClick={()=>enterRoom(card.character as WorkerCharacterId)}>
                <DoorOpen size={15}/>
              </button>}
            </article>;
          })}
        </div>
        <footer className="cg-progress">
          <strong>A05 收集进度</strong>
          <div className="cg-progress__track" role="progressbar" aria-label="A05 收集进度"
            aria-valuenow={collectedCount} aria-valuemin={0} aria-valuemax={5}>
            <span style={{width:(collectedCount/5*100)+'%'}}/>
          </div>
          <span data-testid="gallery-collected-count">{collectedCount}/5</span>
          <span className="cg-progress__status">{collectedCount===5?'收集完成':'继续召唤收集'}</span>
        </footer>
      </section>

      <aside className="cg-detail" aria-label="当前选中人物资料">
        <header className={'cg-detail__hero cg-detail__hero--'+CARD_CLASS[selected.key]}>
          <div className="cg-detail__hero-text">
            <small>人物契约 · A05 角色名录</small>
            <h2>{selected.title}</h2>
            <strong>{CARD_RARITY[selected.key]}</strong>
            <p>{person.description}</p>
          </div>
          {portrait&&<div className="cg-detail__hero-art">
            <ReliableImage src={portrait} fallbackSrc={getCardPortraitFallback(selected.key)??undefined}
              alt="" fill unoptimized priority sizes="240px" className="cg-detail__hero-img"/>
          </div>}
        </header>
        <div className="cg-detail__tabs" role="tablist" aria-label="人物资料栏目">
          {([['attributes','属性'],['story','详情'],['training','养成']] as const).map(([id,label])=>
            <button key={id} type="button" role="tab" aria-selected={detailTab===id}
              className={detailTab===id?'cg-tab cg-tab--active':'cg-tab'}
              onClick={()=>setDetailTab(id)}>{label}</button>)}
        </div>
        <div className="cg-detail__body">
          {detailTab==='attributes'&&<>
            <div className="cg-stats" aria-label="真实人物能力值">
              {(['vitality','strength','physique','spirit','speed','affinity'] as const).map(k=>
                <div key={k}><span>{ABILITY_LABELS[k]}</span><strong>{abilities[k]}</strong></div>)}
            </div>
            <h3 className="cg-section-title">专长技能</h3>
            <div className="cg-skills">{person.strengths.map((key,i)=>
              <div className="cg-skill" key={key}>
                <span className="cg-skill__icon">{i%2===0?<Gem size={21}/>:<Heart size={21}/>}</span>
                <span>{ABILITY_LABELS[key]}</span>
                <small>能力 {abilities[key]}</small>
              </div>)}</div>
            <h3 className="cg-section-title">装备</h3>
            <div className="cg-gear">
              {installed.length>0?installed.map(name=><span key={name}>{name}</span>):<span>尚未装备 · 可在收藏中锻造</span>}
            </div>
          </>}
          {detailTab==='story'&&<div className="cg-detail__scroll">
            <CharacterLifePortrait id={selected.character}/>
            <p className="cg-detail__flavor">{person.goal}</p>
          </div>}
          {detailTab==='training'&&<div className="cg-detail__scroll">
            <p>已收录：{owned.has(selected.key)?'当前契约已获得':'此契约尚未获得'}</p>
            <p>已穿戴装备：{installed.join('、')||'暂无'}</p>
            <button type="button" className="cg-detail__inline-action" onClick={()=>setArchiveOpen(true)}>
              进入真实装备锻造与养成
            </button>
          </div>}
        </div>
        <div className="cg-detail__bottom">
          <p className="cg-detail__bond"><Heart size={17}/>契约状态
            <strong>{owned.has(selected.key)?'已收录':'尚未收录'}</strong>
            <span>{collectedCount}/5</span></p>
          <div className="cg-detail__actions">
            <button type="button" onClick={()=>setOverlay('memories')}>
              <ScrollText size={18}/>查看故事</button>
            {selected.character==='yuesha'
              ?<Link href={roomUrl}><DoorOpen size={18}/>进入房间</Link>
              :<button type="button" onClick={()=>enterRoom(selected.character as WorkerCharacterId)}>
                <DoorOpen size={18}/>进入房间</button>}
            <button type="button" className="cg-detail__primary" onClick={()=>setOverlay('art')}>
              <ImageIcon size={18}/>欣赏立绘</button>
          </div>
        </div>
      </aside>
    </div>
    <GothicDock label="月光工坊世界" activeHref="/characters/" className="cg-dock"
      items={WORLD_NAV.map(item=>({href:item.href,icon:item.glyph,label:item.label,description:item.purpose,ariaLabel:item.full}))}/>
    {overlay==='memories'&&<GothicModal title="月光记忆与人物故事" onClose={()=>setOverlay(null)} wide>
      <div className="cg-overlay-stack">
        <h2>羁绊故事 · 月光记忆</h2>
        <RoomMemoryGallery/><RoomInvestigationJournal/>
      </div>
    </GothicModal>}
    {overlay==='art'&&<GothicModal title={selected.title+'立绘欣赏'} onClose={()=>setOverlay(null)} wide>
      <div className="cg-art-view">
        <h2>{selected.title}</h2>
        <p>{owned.has(selected.key)?'已收录的契约插画':'人物预览 · 召唤后可收录契约'}</p>
        {portrait&&<div className="cg-art-view__image">
          <ReliableImage src={portrait} fallbackSrc={getCardPortraitFallback(selected.key)??undefined}
            alt={selected.title+'人物画作'} fill unoptimized sizes="(max-width:640px) 85vw, 540px"
            className="object-contain"/>
        </div>}
      </div>
    </GothicModal>}
    <SummonCollectionArchive open={archiveOpen} collection={collection}
      collectionStatus={status} onClose={()=>setArchiveOpen(false)}/>
    {world&&visiting&&<WorkerPrivateRoom id={visiting}
      working={world.tiles.some(tile=>tile?.worker===visiting)} onClose={closeVisit}/>}
  </main>;
}
