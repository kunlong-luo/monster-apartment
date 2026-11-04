'use client';

import './character-gallery-scene.css';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import type {CSSProperties} from 'react';
import {motion,useReducedMotion} from 'motion/react';
import {Archive,BookOpen,Brain,Crown,DoorOpen,Dumbbell,Eye,Flame,Focus,Gem,HandHeart,Heart,HeartPulse,Hourglass,Image as ImageIcon,Leaf,Mail,MessageCircle,MoonStar,Palette,Shield,Swords,Waves} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import {GothicResourcePill,GothicModal} from '@/components/game/gothic-hud';
import {ReliableImage} from '@/components/game/reliable-image';
import {CharacterLifePortrait} from '@/components/game/character-life-portrait';
import {RoomInvestigationJournal} from '@/components/game/room-investigation-journal';
import {RoomMemoryGallery} from '@/components/game/room-memory-gallery';
import {WorkerPrivateRoom} from '@/components/game/worker-private-room';
import {SummonCollectionArchive} from '@/components/summon/summon-collection-archive';
import {HEROINE_FACE_ART,getCardFace,getCardPortraitFallback,getCardPortraitKind,getCollectibleCardArt} from '@/components/summon/heroine-portrait-assets';
import {useCharacterCollection} from '@/lib/game/character-collection-store';
import {siteAssetUrl} from '@/lib/game/site-asset-url';
import {ensureWorkshopWorld} from '@/lib/moonwork/world-state';
import {useWorkshopWorld} from './world-save-react';
import {CharacterGalleryArtwork} from './character-gallery-artwork';
import {CharacterGalleryPetals} from './character-gallery-petals';
import hallBackdrop from '../../../public/art/world-scenes/workshop-gothic-hall.webp';
import {CHARACTER_CARDS,FORGE_RECIPES,characterAbilities} from '@/core/character-collection';
import type {CardKey} from '@/core/character-collection';
import {ABILITY_LABELS,CHARACTER_PROFILES} from '@/core/character-life';
import type {AbilityKey} from '@/core/character-life';
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
const CARD_SEAL={
  'yuesha-eclipse':Crown,
  'yuesha-vow':MoonStar,
  'brook-tide':Waves,
  'fern-spring':Leaf,
  'cinder-ember':Flame,
} as const;

/** Abilities, not fictional leveled combat skills. Icons are intentionally
 * distinct across each character's four actual strengths. */
const STRENGTH_ICON:Partial<Record<AbilityKey,LucideIcon>>={
  wisdom:Brain,memory:BookOpen,communication:MessageCircle,focus:Focus,
  spirit:Waves,vitality:HeartPulse,perception:Eye,empathy:HandHeart,
  creativity:Palette,strength:Swords,physique:Dumbbell,endurance:Hourglass,
};


export function CharacterGalleryScene(){
  const world=useWorkshopWorld();
  const {collection,status}=useCharacterCollection();
  const [selectedKey,setSelectedKey]=useState<CardKey>('yuesha-eclipse');
  const [detailTab,setDetailTab]=useState<'attributes'|'story'|'training'>('attributes');
  const [overlay,setOverlay]=useState<'memories'|'art'|null>(null);
  const [archiveOpen,setArchiveOpen]=useState(false);
  const [visiting,setVisiting]=useState<WorkerCharacterId|null>(null);
  const prefersReducedMotion=useReducedMotion();

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
  // Alternate covenants may have different visual forms: keep YueSha's
  // mythic-eclipse art on the hero panel whenever its approved preview exists.
  const detailPortrait=getCollectibleCardArt(selected.key)??HEROINE_FACE_ART[selected.character];
  const equippedSlots=collection.equipped[selected.character]??{};
  const installed=Object.values(equippedSlots)
    .map(id=>FORGE_RECIPES.find(item=>item.id===id)?.name)
    .filter(Boolean);
  const workshopSlot=world&&selected.character!=='yuesha'
    ?world.tiles.findIndex(tile=>tile?.worker===selected.character):-1;
  const enterRoom=(id:WorkerCharacterId)=>setVisiting(id);
  const roomUrl=selected.character==='yuesha'?'/apartment/?visit=yuesha':
    '/characters/?visit='+selected.character;

  return <main className="cg-scene" data-testid="moonwork-world" data-area="characters">
    <div className="cg-scene__background" aria-hidden="true"
      style={{backgroundImage:"url("+JSON.stringify(hallBackdrop.src)+")"}}/>
    <div className="cg-scene__vignette" aria-hidden="true"/>
    <div className="cg-scene__tracery" data-testid="a05-tracery" aria-hidden="true"
      style={{backgroundImage:'url('+JSON.stringify(siteAssetUrl('/art/a05/moonlight-tracery.svg'))+')'}}/>
    <div className="cg-scene__ornaments" data-testid="a05-foreground-ornaments" aria-hidden="true"
      style={{backgroundImage:'url('+JSON.stringify(siteAssetUrl('/art/a05/foreground-ornaments.svg'))+')'}}/>
    <CharacterGalleryPetals reducedMotion={Boolean(prefersReducedMotion)}/>
    <header className="cg-topbar">
      <div className="cg-brand" aria-label="怪物公寓">
        <span className="cg-brand__title">怪物公寓</span>
        <span className="cg-brand__subtitle">MONSTER APARTMENT</span>
      </div>
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
      <nav className="cg-sidebar" aria-label="图鉴快捷功能">
        <span className="cg-sidebar__ornament" aria-hidden="true">❦</span>
        <span className="cg-sidebar__heading">契约档案</span>
        <a href={siteAssetUrl('/characters/#summon-screen')} data-testid="open-cinematic-summon"
          className="cg-sidebar__item"><Gem size={20}/>契约召唤</a>
        <button type="button" className="cg-sidebar__item" onClick={()=>setOverlay('memories')}>
          <Heart size={20}/>羁绊故事
        </button>
        <button type="button" className="cg-sidebar__item" onClick={()=>setArchiveOpen(true)}>
          <Archive size={20}/>CG 收藏
        </button>
      </nav>

      <section className="cg-gallery" aria-label="A05 人物立绘全集">
        <header className="cg-heading" data-testid="character-gallery-header">
          <h1>A05 人物立绘全集 <span>({collectedCount}/5)</span></h1>
          <p>主要角色 · 契约鉴赏 · 人物档案</p>
          {status!=='ok'&&<p role="alert" className="cg-storage-error">
            人物收藏存档暂不可读取，未修改原有数据。</p>}
        </header>
        <div className="cg-cards" data-testid="painted-worker-gallery">
          {cards.map((card,index)=>{
            const art=getCardFace(card.key,'feature');
            const collected=owned.has(card.key);
            // The 512px square face images are honest portraits, never stretched into
            // a tall full-body painting. Only the reviewed preview/production art
            // receives the full-height composition.
            const fullFigure=Boolean(getCollectibleCardArt(card.key));
            const CardSeal=CARD_SEAL[card.key];
            return <article key={card.key}
              className={'cg-card cg-card--'+CARD_CLASS[card.key]+(selectedKey===card.key?' cg-card--selected':'')}
              data-art-layout={fullFigure?'figure':'portrait'}
              data-testid={card.character==='yuesha'?'gallery-card-'+card.key:'worker-card-'+card.character}
              data-owned={collected}>
              <button type="button" className="cg-card__select"
                aria-pressed={selectedKey===card.key}
                data-card-key={card.key}
                aria-label={'选择'+card.title+' · '+(collected?'已收录':'尚未收录')}
                onClick={()=>{setSelectedKey(card.key);setDetailTab('attributes');}}
                onKeyDown={event=>{
                  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
                  event.preventDefault();
                  const next=event.key==='Home'?0:event.key==='End'?cards.length-1:
                    (index+(event.key==='ArrowRight'?1:cards.length-1))%cards.length;
                  setSelectedKey(cards[next].key);
                  setDetailTab('attributes');
                  event.currentTarget.closest('.cg-cards')
                    ?.querySelectorAll<HTMLButtonElement>('.cg-card__select')[next]?.focus();
                }}>
                <div className="cg-card__art">
                  {!fullFigure&&art&&<div className="cg-card__ambient-art" aria-hidden="true">
                    <ReliableImage src={art}
                      fallbackSrc={getCardPortraitFallback(card.key)??undefined}
                      fill unoptimized sizes="(max-width:900px) 46vw, 15vw"
                      className="cg-card__ambient-image" alt=""/>
                  </div>}
                  <div className={'cg-card__portrait-window '+(fullFigure
                    ?'cg-card__portrait-window--figure':'cg-card__portrait-window--portrait')}>
                    {art&&<ReliableImage src={art} fallbackSrc={getCardPortraitFallback(card.key)??undefined}
                      fill unoptimized priority={index<2}
                      sizes="(max-width:700px) 45vw, (max-width:1050px) 22vw, 14vw"
                      className="cg-card__image" alt={card.title+'人物肖像'}
                      data-art-kind={getCardPortraitKind(card.key)}/>}
                  </div>
                  {!fullFigure&&<div className="cg-card__portrait-insignia" aria-hidden="true">
                    <span className="cg-card__portrait-rule"/>
                    <CardSeal size={30} strokeWidth={1.25}/>
                    <span className="cg-card__portrait-kicker">{CHARACTER_PROFILES[card.character].title}</span>
                    <span className="cg-card__portrait-rule"/>
                  </div>}
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

      <aside className={'cg-detail cg-detail--'+CARD_CLASS[selected.key]}
        aria-label="当前选中人物资料">
        <header className={'cg-detail__hero cg-detail__hero--'+CARD_CLASS[selected.key]}>
          <div className="cg-detail__hero-text">
            <small>人物契约 · A05 角色名录</small>
            <h2>{selected.title}</h2>
            <strong>{CARD_RARITY[selected.key]}</strong>
            <p>{person.description}</p>
          </div>
          <motion.div key={selected.key} className="cg-detail__hero-art"
            initial={prefersReducedMotion?false:{opacity:0,scale:1.04}}
            animate={{opacity:1,scale:1}} transition={{duration:prefersReducedMotion?0:0.28,ease:'easeOut'}}>
            <ReliableImage src={detailPortrait} fallbackSrc={HEROINE_FACE_ART[selected.character]}
              alt="" fill unoptimized priority sizes="240px" className="cg-detail__hero-img"/>
          </motion.div>
        </header>
        <div className="cg-detail__tabs" role="tablist" aria-label="人物资料栏目">
          {([['attributes','属性'],['story','详情'],['training','养成']] as const).map(([id,label])=>
            <button key={id} type="button" role="tab" id={'cg-tab-'+id}
              aria-controls="cg-detail-tabpanel" aria-selected={detailTab===id}
              tabIndex={detailTab===id?0:-1}
              className={detailTab===id?'cg-tab cg-tab--active':'cg-tab'}
              onClick={()=>setDetailTab(id)}
              onKeyDown={event=>{
                const tabIds=['attributes','story','training'] as const;
                const current=tabIds.indexOf(id);
                const next=event.key==='Home'?0:event.key==='End'?2:
                  event.key==='ArrowRight'?(current+1)%3:
                  event.key==='ArrowLeft'?(current+2)%3:-1;
                if(next<0)return;
                event.preventDefault();
                setDetailTab(tabIds[next]);
                document.getElementById('cg-tab-'+tabIds[next])?.focus();
              }}>{label}</button>)}
        </div>
        <div className="cg-detail__body" id="cg-detail-tabpanel" role="tabpanel"
          aria-labelledby={'cg-tab-'+detailTab} tabIndex={0}>
          {detailTab==='attributes'&&<>
            <div className="cg-stats" aria-label="真实人物能力值">
              {(['vitality','strength','physique','spirit','speed','affinity'] as const).map(k=>
                <div className="cg-stat" key={k} aria-label={ABILITY_LABELS[k]+' '+abilities[k]+' / 100'}>
                  <span>{ABILITY_LABELS[k]}</span><strong>{abilities[k]}</strong>
                  <span className="cg-stat__track" aria-hidden="true">
                    <span style={{width:Math.min(100,Math.max(0,abilities[k]))+'%'}}/>
                  </span>
                </div>)}
            </div>
            <h3 className="cg-section-title">人物专长</h3>
            <div className="cg-skills" aria-label="四项真实专长能力">
              {person.strengths.map(key=>{
                const Icon=STRENGTH_ICON[key]??Gem;
                return <div className="cg-skill" key={key}
                  aria-label={ABILITY_LABELS[key]+'专长，能力 '+abilities[key]+' / 100'}>
                  <span className="cg-skill__icon"
                    style={{'--cg-skill-progress':abilities[key]+'%'} as CSSProperties}>
                    <Icon size={24} strokeWidth={1.5} aria-hidden="true"/>
                  </span>
                  <span className="cg-skill__label">{ABILITY_LABELS[key]}</span>
                  <small>{abilities[key]} / 100</small>
                </div>;
              })}
            </div>
            <h3 className="cg-section-title">装备</h3>
            <div className="cg-equipment" aria-label="已装备首饰与防具">
              {([['equipment','装备'],['jewelry','首饰']] as const).map(([slot,label])=>{
                const recipe=FORGE_RECIPES.find(item=>item.id===equippedSlots[slot]);
                const SlotIcon=slot==='equipment'?Shield:Gem;
                return <button key={slot} type="button"
                  className={'cg-equipment__slot '+(recipe?'cg-equipment__slot--filled':'')}
                  onClick={()=>setArchiveOpen(true)}
                  aria-label={label+'：'+(recipe?.name??'空位')+'，前往装备与锻造'}
                  data-testid={'cg-equipped-'+slot}>
                  <span className="cg-equipment__icon"><SlotIcon size={24} strokeWidth={1.65}/></span>
                  <span className="cg-equipment__name"><strong>{label}</strong>
                    <small>{recipe?.name??'可锻造'}</small>
                  </span>
                </button>;
              })}
            </div>
          </>}
          {detailTab==='story'&&<div className="cg-detail__scroll">
            <CharacterLifePortrait id={selected.character}/>
            <p className="cg-detail__flavor">{person.goal}</p>
          </div>}
          {detailTab==='training'&&<div className="cg-detail__scroll">
            <p>已收录：{owned.has(selected.key)?'当前契约已获得':'此契约尚未获得'}</p>
            <p>已穿戴装备：{installed.join('、')||'暂无'}</p>
            {selected.character!=='yuesha'&&<>
              <p data-testid="character-workshop-assignment">
                工坊状态：{workshopSlot>=0?'正在 '+String(workshopSlot+1).padStart(2,'0')+' 号工位':'目前待派工'}
              </p>
              <Link href={'/workshop/?worker='+selected.character} className="cg-detail__inline-action">
                安排{person.name}到工坊
              </Link>
            </>}
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
    {overlay==='memories'&&<GothicModal title="月光记忆与人物故事" onClose={()=>setOverlay(null)} wide>
      <div className="cg-overlay-stack">
        <h2>羁绊故事 · 月光记忆</h2>
        <RoomMemoryGallery/><RoomInvestigationJournal/>
      </div>
    </GothicModal>}
    {overlay==='art'&&<GothicModal title={selected.title+'画作鉴赏'} onClose={()=>setOverlay(null)} immersive>
      <CharacterGalleryArtwork cards={cards} selectedKey={selected.key}
        collectedKeys={collection.draws} reducedMotion={Boolean(prefersReducedMotion)}
        onSelect={key=>{setSelectedKey(key);setDetailTab('attributes');}}/>
    </GothicModal>}
    <SummonCollectionArchive open={archiveOpen} collection={collection}
      collectionStatus={status} onClose={()=>setArchiveOpen(false)}/>
    {world&&visiting&&<WorkerPrivateRoom id={visiting}
      working={world.tiles.some(tile=>tile?.worker===visiting)} onClose={closeVisit}/>}
  </main>;
}
