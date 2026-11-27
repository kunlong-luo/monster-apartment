'use client';
import Image from 'next/image';
import {useRouter,useSearchParams} from 'next/navigation';
import {ScrollText,X} from 'lucide-react';
import {AnimatePresence} from 'motion/react';
import {useEffect,useState} from 'react';
import moonveil from '../../../public/art/characters/yuesha/yuesha-avatar-v3.webp';
import moonveilBust from '../../../public/art/characters/yuesha/yuesha-bust-v3.webp';
import lobbyHero from '../../../public/art/world-scenes/lobby/lobby-hero-v3.webp';
import {moonveilFirstChapter} from '../../../engine/src/workshop-guidance';
import {useWorkshopWorld} from '@/components/moonwork/world-save-react';
import {ensureWorkshopWorld} from '@/lib/moonwork/world-state';
import {R12SceneBackdrop} from './r12-scene-painting';
import {R12ApartmentDoorReview} from './r12-apartment-door-review';
import {GothicAtmosphere} from './gothic-atmosphere';
import {GothicSceneIllumination} from './gothic-scene-illumination';
import {useGothicMotion} from '@/lib/game/gothic-motion';
import {GothicIconButton,GothicResourcePill,GothicModal,GothicPanelLink} from './gothic-hud';
import {GothicRoomDoors} from './gothic-room-doors';
import {YueshaPrivateRoom} from './yuesha-private-room';
import './gothic-apartment.css';

// The retired V1 housing simulation is never initialized, ticked or written.
// Preserve its exact payload for player-controlled export and rollback.
const RETIRED_HOUSING_KEY='monster-apartment:cozy:v1';
export function GothicApartment(){
  const router=useRouter();
  const searchParams=useSearchParams();
  const visitingYuesha=searchParams.get('visit')==='yuesha';
  const withVisit=new URLSearchParams(searchParams.toString());
  withVisit.set('visit','yuesha');
  const roomHref='/apartment/?'+withVisit.toString();
  const withoutVisit=new URLSearchParams(searchParams.toString());
  withoutVisit.delete('visit');
  const remaining=withoutVisit.toString();
  const exitHref='/apartment/'+(remaining?'?'+remaining:'');
  const world=useWorkshopWorld();
  const [bootFinished,setBootFinished]=useState(false);
  const [notices,setNotices]=useState(false);
  const [talkOpen,setTalkOpen]=useState(false);
  const [exportMessage,setExportMessage]=useState('');
  const {reduced:reducedMotion}=useGothicMotion();
  useEffect(()=>{
    let active=true;
    void ensureWorkshopWorld().then(()=>{if(active)setBootFinished(true);},
      ()=>{if(active)setBootFinished(true);});
    return ()=>{active=false;};
  },[]);
  const chapter=world?moonveilFirstChapter(world):null;
  const witchOpen=talkOpen||visitingYuesha;
  const exportRetiredSave=()=>{
    try{
      const raw=window.localStorage.getItem(RETIRED_HOUSING_KEY);
      if(raw===null){setExportMessage('没有旧版公寓经营记录。');return;}
      const url=URL.createObjectURL(new Blob([raw],{type:'application/octet-stream'}));
      const link=document.createElement('a');
      link.href=url;link.download='monster-apartment-retired-housing-v1.json';
      document.body.append(link);link.click();link.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),1000);
      setExportMessage('已请求导出原始记录，未修改任何存档。');
    }catch{setExportMessage('无法读取旧记录，请检查浏览器存储权限。');}
  };
  const closeTalk=()=>{setTalkOpen(false);if(visitingYuesha)router.replace(exitHref);};
  return <main className={reducedMotion?'ga ga--still ga--red-gold':'ga ga--red-gold'} data-testid="gothic-apartment" aria-label="怪物公寓人物居所"
    onKeyDown={event=>{if(event.key==='Escape'){closeTalk();setNotices(false);}}}>
    <R12SceneBackdrop area="apartment" className="ga-backdrop" fallbackSrc={lobbyHero}
      renderDoorReview={(kind,mode)=><R12ApartmentDoorReview kind={kind} mode={mode}/>}/>
    <div className="ga-light" aria-hidden="true"/>
    <div className="ga-shade" aria-hidden="true"/>
    <div className="ga-dust" aria-hidden="true"/>
    <GothicSceneIllumination variant="apartment" paused={reducedMotion}/>
    <GothicAtmosphere paused={reducedMotion}/>
    <header className="ga-red-gold-header absolute inset-x-0 top-0 z-[5] flex min-h-[56px] items-start gap-1.5 bg-[linear-gradient(#08060ad3,transparent)] px-2 py-2.5 max-[700px]:flex-wrap max-[700px]:gap-y-1 max-[700px]:pb-2 sm:gap-3 sm:px-6" aria-label="公寓资源与操作">
      <span className="flex min-h-9 shrink-0 items-center rounded-full border border-gothic-brass/50 bg-gothic-panel/80 px-3 text-xs text-gothic-ivory max-[700px]:order-1"
        data-testid="game-location" aria-label="当前位置：大厅 / 公寓">公寓 · 人物居所</span>
      <div className="ml-auto flex items-start gap-1 sm:gap-2 max-[700px]:order-3 max-[700px]:ml-0 max-[700px]:w-full max-[700px]:min-w-0 max-[700px]:justify-between" aria-label="公寓真实存档">
        <GothicResourcePill symbol="☾" amount={world?.day??'—'} label="游戏天数" testId="ga-day"/>
        <GothicResourcePill symbol="✦" amount={world?.coins??'—'} label="星币" testId="ga-coins"/>
        <GothicResourcePill symbol="◆" amount={world?.warehouse.core??'—'} label="晶核" testId="ga-cores"/>
        <GothicResourcePill symbol="✓" amount={world?.completed??'—'} label="已交付" testId="ga-completed"/>
      </div>
      <div className="flex shrink-0 gap-1 sm:gap-2 max-[700px]:order-2 max-[700px]:ml-auto">
        <GothicIconButton label="公寓日志" expanded={notices} onClick={()=>setNotices(x=>!x)}><ScrollText aria-hidden="true" size={17} strokeWidth={1.7}/></GothicIconButton>
      </div>
    </header>
    <GothicRoomDoors roomHref={roomHref}/>
    <button className="ga-witch" type="button" onClick={()=>setTalkOpen(true)}
      aria-label="与女主人月纱交流" data-tooltip="月纱 · 女主人"><span className="ga-witch-hud-label" aria-hidden="true">与月纱交谈</span></button>
    <div className="ga-witch-title" aria-hidden="true">月纱 <small>暗夜公寓的女主人</small></div>
    <section className="ga-lower" aria-label="人物与经营动态">
      <div className="ga-story">
        <span className="ga-micro">月影之约</span>
        <strong>{chapter?.text??(bootFinished?'经营记录暂不可用，可前往工坊处理。':'正在读取共享经营记录…')}</strong>
        {chapter?<GothicPanelLink href={chapter.href}>{chapter.label}</GothicPanelLink>:
          <GothicPanelLink href="/workshop/">查看工坊存档 ›</GothicPanelLink>}
      </div>
    </section>
    <AnimatePresence mode="wait">
    {witchOpen&&<GothicModal key="moonveil" title="与月纱交谈" closeLabel="关闭月纱对话"
      onClose={closeTalk} wide immersive={visitingYuesha}>
      {visitingYuesha?<div className="min-w-0 flex-1 space-y-3">
        <button type="button" onClick={()=>{setTalkOpen(true);router.replace(exitHref);}}
          className="min-h-9 rounded-full border border-gothic-brass/60 bg-gothic-panel/80 px-3 text-xs hover:border-gothic-glow">← 返回月纱对话</button>
        <YueshaPrivateRoom completed={world?.completed??null}/>
      </div>:<>
      <div className="relative hidden min-h-[215px] w-[120px] shrink-0 overflow-hidden rounded-md border border-gothic-brass/60 bg-gothic-panel sm:block">
        <Image src={moonveilBust} alt="月纱的绘制肖像" fill unoptimized sizes="130px" className="object-cover object-[48%_45%]"/>
      </div>
      <div className="min-w-0 flex-1 space-y-3 pr-4">
        <span className="text-[10px] leading-relaxed tracking-[.12em] text-gothic-gold">月纱 · 公寓女主人</span>
        <h2 className="text-xl font-semibold leading-snug text-gothic-ivory sm:text-2xl">今夜的公寓，如何了？</h2>
        <p className="text-sm leading-7 text-gothic-muted">“{chapter?.text??'先来坐一会儿。'}”</p>
        {world&&<p className="text-xs text-gothic-muted">累计交付 {world.completed} 单 · 晶核 {world.warehouse.core} 枚</p>}
        <button type="button" onClick={()=>router.push(roomHref)} data-testid="visit-yuesha-room"
          className="mt-2 inline-flex min-h-10 items-center rounded-lg border border-gothic-brass bg-gothic-wine/80 px-4 py-2 text-sm text-gothic-ivory hover:border-gothic-glow">拜访月纱会客室</button>
        {chapter&&<GothicPanelLink href={chapter.href}>{chapter.label}</GothicPanelLink>}
      </div></>}
    </GothicModal>}
    </AnimatePresence>
    {notices&&<div className="absolute right-3 top-[72px] z-20 w-[min(350px,92vw)] rounded-xl border border-gothic-brass/75 bg-gothic-panel/95 p-4 text-gothic-ivory shadow-[0_15px_44px_#000c] backdrop-blur-xl"
      role="dialog" aria-label="公寓日志" onKeyDown={event=>{if(event.key==='Escape')setNotices(false);}}>
      <button type="button" aria-label="关闭公寓日志" onClick={()=>setNotices(false)}
        className="absolute right-2 top-2 grid size-8 place-items-center rounded-full border border-gothic-brass/50 bg-gothic-panel text-xl leading-none hover:border-gothic-glow"><X aria-hidden="true" size={17}/></button>
      <div className="flex items-start gap-3 pr-4">
        <Image src={moonveil} alt="月纱" width={64} height={75} unoptimized className="h-[75px] w-16 shrink-0 rounded-md border border-gothic-brass/50 object-cover"/>
        <div className="min-w-0 space-y-2">
          <h2 className="text-base font-semibold text-gothic-gold">月纱的夜间记录</h2>
          <p className="text-xs leading-relaxed text-gothic-muted">{chapter?.text??'经营记录暂不可用。'}</p>
          <button type="button" onClick={exportRetiredSave} className="min-h-9 text-xs underline">导出旧公寓经营记录</button>
          {exportMessage&&<p role="status" className="text-xs">{exportMessage}</p>}
        </div>
      </div>
    </div>}
  </main>;
}
