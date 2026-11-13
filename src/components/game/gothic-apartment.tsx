'use client';
import Link from 'next/link';
import Image from 'next/image';
import {Pause,Play,ScrollText,X} from 'lucide-react';
import {AnimatePresence} from 'motion/react';
import {useCallback,useEffect,useState,useSyncExternalStore} from 'react';
import moonveil from '../../../public/art/yuesha-avatar-v3.webp';
import moonveilBust from '../../../public/art/yuesha-bust-v3.webp';
import lobbyHero from '../../../public/art/lobby-hero-v3.webp';
import {newCozyGame,validCozySave,resumeCozySave,
  relocateCozyResident,cozyDay,cozyGoal,cozyDailyIncome} from '@/core/cozy-engine';
import type {CozyState} from '@/core/cozy-engine';
import {COZY_SAVE_KEY,transactCozySave,tickCozySave,resetCorruptCozySave} from '@/lib/game/cozy-save-transaction';
import type {CozyReducer} from '@/lib/game/cozy-save-transaction';
import {GothicAtmosphere} from './gothic-atmosphere';
import {GothicSceneIllumination} from './gothic-scene-illumination';
import {useGothicMotion} from '@/lib/game/gothic-motion';
import {GothicIconButton,GothicResourcePill,GothicModal,GothicPanelLink} from './gothic-hud';
import {GothicRoomDoors} from './gothic-room-doors';
import {GothicRoomDrawer} from './gothic-room-drawer';
import {YueshaPrivateRoom} from './yuesha-private-room';
import './gothic-apartment.css';
const KEY=COZY_SAVE_KEY;
function getCozyStorage():Storage|null{
  try{return window.localStorage;}catch{return null;}
}
function invalidCozySave(raw:string|null):boolean {
  if(raw===null)return false;
  try{return !validCozySave(JSON.parse(raw));}catch{return true;}
}
const subscribeClient=()=>()=>{};
const clientSnapshot=()=>true;
const serverSnapshot=()=>false;
function readCozySave():CozyState{
  let saved=newCozyGame();
  if(typeof window==='undefined')return saved;
  try{
    const raw=window.localStorage.getItem(KEY);
    if(raw){const parsed:unknown=JSON.parse(raw);
      if(validCozySave(parsed))saved=resumeCozySave(parsed);}
  }catch{/* Invalid saves cannot crash the game. */}
  return saved;
}
export function GothicApartment(){
  const ready=useSyncExternalStore(subscribeClient,clientSnapshot,serverSnapshot);
  const [world,setWorld]=useState<CozyState>(readCozySave);
  // Retain the exact damaged snapshot seen by this tab. A recovery dialog
  // must never reset a different save that another tab wrote meanwhile.
  const [corruptRaw,setCorruptRaw]=useState<string|null>(()=>{
    if(typeof window==='undefined')return null;
    try{
      const raw=localStorage.getItem(KEY);
      return invalidCozySave(raw)?raw:null;
    }catch{return null;}
  });
  const corruptSave=corruptRaw!==null;
  const [saveRecoveryError,setSaveRecoveryError]=useState('');
  const [saveError,setSaveError]=useState('');
  const [selected,setSelected]=useState<number|null>(null);
  const [moving,setMoving]=useState<number|null>(null);
  const [paused,setPaused]=useState(false);
  const {reduced:reducedMotion}=useGothicMotion();
  const [notices,setNotices]=useState(false);
  const [witchOpen,setWitchOpen]=useState(false);
  const [witchRoom,setWitchRoom]=useState(false);
  const [feedback,setFeedback]=useState<{id:number;text:string}|null>(null);
  useEffect(()=>{
    // Character cards can open the same in-scene room without adding an eighth route.
    if(new URLSearchParams(window.location.search).get('visit')!=='yuesha')return;
    const frame=window.requestAnimationFrame(()=>{setWitchRoom(true);setWitchOpen(true);});
    return ()=>window.cancelAnimationFrame(frame);
  },[]);
  const syncSaved=useCallback(()=>{
    try{
      const raw=window.localStorage.getItem(KEY);
      if(invalidCozySave(raw)){
        // Another tab's damaged payload is never overwritten by this page.
        setCorruptRaw(previous=>previous??raw);
        return;
      }
      setWorld(raw?resumeCozySave(JSON.parse(raw) as CozyState):newCozyGame());
      setCorruptRaw(null);
    }catch{setSaveError('无法读取公寓存档，请检查浏览器存储权限。');}
  },[]);
  useEffect(()=>{
    if(!ready)return;
    let active=true;
    // Initialize missing and legacy-complete V1 saves under the SAME lock as
    // gameplay. Never persist a stale React snapshot in an effect.
    const store=getCozyStorage();
    if(!store){setSaveError('无法访问公寓存档，请检查浏览器存储权限。');return;}
    void transactCozySave(store,navigator.locks,resumeCozySave).then(result=>{
      if(!active)return;
      if(result.status==='applied'||result.status==='unchanged')syncSaved();
      else if(result.status==='corrupt')setCorruptRaw(previous=>previous??result.raw);
      else setSaveError('当前无法安全保存公寓进度。请使用支持 Web Locks 且允许本地存储的浏览器。');
    });
    return ()=>{active=false;};
  },[ready,syncSaved]);
  useEffect(()=>{
    if(!ready)return;
    const onStorage=(event:StorageEvent)=>{
      const store=getCozyStorage();
      if(!store||event.storageArea!==store||
        (event.key!==KEY&&event.key!==null))return;
      syncSaved();
    };
    window.addEventListener('storage',onStorage);
    return ()=>window.removeEventListener('storage',onStorage);
  },[ready,syncSaved]);
  useEffect(()=>{
    // Do not let the day clock penalize players who are reading dialogue,
    // inspecting room actions, or switching away from the browser tab.
    if(!ready||corruptSave||paused||witchOpen||notices||selected!==null||world.phase!=='playing')return;
    const clock=window.setInterval(()=>{
      if(document.visibilityState!=='visible')return;
      const store=getCozyStorage();
      if(!store){setSaveError('公寓计时已暂停：无法读取浏览器存储。');return;}
      void tickCozySave(store,navigator.locks).then(result=>{
        if(result.status==='applied'||result.status==='unchanged')syncSaved();
        else if(result.status==='corrupt')setCorruptRaw(previous=>previous??result.raw);
        else setSaveError('公寓计时已暂停：无法安全保存进度，请检查浏览器存储权限。');
      });
    },2000);
    return ()=>window.clearInterval(clock);
  },[ready,corruptSave,paused,witchOpen,notices,selected,world.phase,syncSaved]);
  useEffect(()=>{
    if(!feedback)return;
    const timer=window.setTimeout(()=>setFeedback(current=>
      current?.id===feedback.id?null:current),4500);
    return ()=>window.clearTimeout(timer);
  },[feedback]);
  if(!ready)return <main className="ga ga-loading">☽ 公寓正在点亮烛火…</main>;
  if(corruptSave)return <main className="flex min-h-dvh items-center justify-center bg-gothic-night p-5 text-gothic-ivory">
    <section role="alertdialog" aria-modal="true" aria-labelledby="cozy-recovery-title"
      className="w-full max-w-md rounded-xl border border-gothic-brass/70 bg-gothic-panel p-6 shadow-2xl">
      <h1 id="cozy-recovery-title" className="text-xl font-semibold text-gothic-glow">公寓存档需要处理</h1>
      <p className="mt-3 text-sm leading-7 text-gothic-muted">检测到现有公寓存档无法读取。为避免覆盖玩家进度，游戏已暂停自动保存。只有确认重新开始后才会替换原存档。</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" className="rounded-lg border border-gothic-gold bg-gothic-wine px-4 py-2 text-sm hover:brightness-110"
          onClick={()=>{
            // An unreadable player save must not be overwritten by one accidental tap.
            if(!window.confirm('现有公寓存档无法读取。确认永久覆盖原始存档并重新开始吗？此操作无法撤销。'))return;
            const store=getCozyStorage();
            if(!store){setSaveRecoveryError('无法读取公寓存档，请检查浏览器存储权限。');return;}
            void resetCorruptCozySave(store,navigator.locks,corruptRaw!).then(result=>{
              if(result.status==='applied'){
                syncSaved();setSaveRecoveryError('');setSaveError('');
              }else if(result.status==='stale'){
                setSaveRecoveryError('其它标签页已更新公寓存档。重新开始未执行，请刷新页面检查最新进度。');
              }else{
                setSaveRecoveryError('无法安全写入新存档。请检查浏览器 Web Locks 和存储权限。');
              }
            });
          }}>确认重新开始</button>
        <Link href="/" className="rounded-lg border border-gothic-brass/60 px-4 py-2 text-sm">返回大厅</Link>
      </div>
      {saveRecoveryError&&<p role="alert" className="mt-3 text-sm text-rose-200">{saveRecoveryError}</p>}
    </section>
  </main>;
  const goal=cozyGoal(world);
  const latest=world.journal[world.journal.length-1];
  const change=(reducer:CozyReducer)=>{
    // UI callbacks supply an intent, not a possibly stale serialized snapshot.
    // Only committed results may update the scene or announce a story reward.
    const store=getCozyStorage();
    if(!store){setSaveError('本次操作未保存：无法读取浏览器存储。');return;}
    void transactCozySave(store,navigator.locks,reducer).then(result=>{
      if(result.status==='applied'||result.status==='unchanged'){
        syncSaved();
        if(result.status==='applied'){
          setSaveError('');
          const story=result.state.journal[result.state.journal.length-1];
          if(story?.key!==result.previous.journal[result.previous.journal.length-1]?.key)
            setFeedback(previous=>({id:(previous?.id??0)+1,text:story.zh}));
        }else setSaveError('公寓状态已更新，本次操作未执行。请查看最新房间状态。');
      }else if(result.status==='corrupt'){
        setCorruptRaw(previous=>previous??result.raw);
      }else setSaveError('本次操作未保存。请检查浏览器 Web Locks 和存储权限。');
    });
  };
  const choose=(index:number)=>{
    if(moving!==null&&index!==moving){
      change(current=>relocateCozyResident(current,moving,index));
      setMoving(null);setSelected(index);
    }else setSelected(value=>value===index?null:index);
  };
  return <main className={reducedMotion?'ga ga--still ga--red-gold':'ga ga--red-gold'} data-testid="gothic-apartment" aria-label="哥特公寓经营"
    onKeyDown={event=>{if(event.key==='Escape'){setWitchOpen(false);setNotices(false);}}}>
    <div className="ga-backdrop" style={{backgroundImage:'url('+JSON.stringify(lobbyHero.src)+')'}} aria-hidden="true"/>
    <div className="ga-light" aria-hidden="true"/>
    <div className="ga-shade" aria-hidden="true"/>
    <div className="ga-dust" aria-hidden="true"/>
    {saveError&&<div role="alert" data-testid="cozy-save-error"
      className="absolute top-[72px] left-3 z-[20] max-w-[min(360px,85vw)] rounded-lg border border-rose-300/60 bg-[#361b28f2] p-3 text-xs leading-5 text-rose-100 shadow-xl">
      {saveError}<button type="button" aria-label="关闭存档提示" className="ml-2 underline" onClick={()=>setSaveError('')}>关闭</button>
    </div>}
    <GothicSceneIllumination variant="apartment" paused={paused||reducedMotion}/>
    <GothicAtmosphere paused={paused||reducedMotion}/>
    <header className="ga-red-gold-header absolute inset-x-0 top-0 z-[5] flex min-h-[56px] items-start gap-1.5 bg-[linear-gradient(#08060ad3,transparent)] px-2 py-2.5 sm:gap-3 sm:px-6" aria-label="公寓资源与操作">
      <span className="flex min-h-9 shrink-0 items-center rounded-full border border-gothic-brass/50 bg-gothic-panel/80 px-3 text-xs text-gothic-ivory"
        data-testid="game-location" aria-label="当前位置：大厅 / 公寓">公寓 · 经营住客</span>
      <div className="ml-auto flex items-start gap-1 sm:gap-2" aria-label="公寓真实存档">
        <GothicResourcePill symbol="☾" amount={cozyDay(world.tick)} label="公寓天数"/>
        <GothicResourcePill symbol="✦" amount={world.coins} label="星币" testId="ga-coins"/>
        <GothicResourcePill symbol="♡" amount={goal.happiness} label="幸福度"/>
        <GothicResourcePill symbol="♟" amount={goal.guests+'/6'} label="入住"/>
      </div>
      <div className="flex shrink-0 gap-1 sm:gap-2">
        <GothicIconButton label={paused?'继续公寓时间':'暂停公寓时间'} pressed={paused}
          onClick={()=>setPaused(x=>!x)}>{paused?<Play aria-hidden="true" size={16} strokeWidth={1.7}/>:<Pause aria-hidden="true" size={16} strokeWidth={1.7}/>}</GothicIconButton>
        <GothicIconButton label="公寓日志" expanded={notices} onClick={()=>setNotices(x=>!x)}><ScrollText aria-hidden="true" size={17} strokeWidth={1.7}/></GothicIconButton>
      </div>
    </header>
    <GothicRoomDoors world={world} selected={selected} onChoose={choose}/>
    <button className="ga-witch" type="button" onClick={()=>{setSelected(null);setWitchRoom(false);setWitchOpen(true);}}
      aria-label="与女主人月纱交流" data-tooltip="月纱 · 女主人"/>
    <div className="ga-witch-title" aria-hidden="true">月纱 <small>暗夜公寓的女主人</small></div>
    <section className="ga-lower" aria-label="房间交互及经营动态">
      {selected===null?<div className="ga-story">
        <span className="ga-micro">THE NIGHT IS YOUNG</span>
        <strong>{latest?.zh??'今夜的公寓格外安静。'}</strong>
        <small>预计每日收入 +{cozyDailyIncome(world).total} ✦ · 点击左侧房门开始经营</small>
      </div>:<GothicRoomDrawer world={world} selected={selected} moving={moving}
        setMoving={setMoving} onClose={()=>{setSelected(null);setMoving(null);}}
        onChange={change}/>}
    </section>
    {feedback&&<div className="ga-feedback" role="status" key={feedback.id}>
      <span aria-hidden="true">✦</span>{feedback.text}
    </div>}
    <AnimatePresence mode="wait">
    {witchOpen&&<GothicModal key={"moonveil"} title="与月纱交谈" closeLabel="关闭月纱对话"
      onClose={()=>{setWitchOpen(false);setWitchRoom(false);}} wide immersive={witchRoom}>
      {witchRoom?<div className="min-w-0 flex-1 space-y-3">
        <button type="button" onClick={()=>setWitchRoom(false)}
          className="min-h-9 rounded-full border border-gothic-brass/60 bg-gothic-panel/80 px-3 text-xs hover:border-gothic-glow">
          ← 返回月纱对话
        </button>
        <YueshaPrivateRoom guests={goal.guests} happiness={goal.happiness}/>
      </div>:<>
      <div className="relative hidden min-h-[215px] w-[120px] shrink-0 overflow-hidden rounded-md border border-gothic-brass/60 bg-gothic-panel sm:block">
        <Image src={moonveilBust} alt="月纱的绘制肖像" fill unoptimized sizes="130px"
          className="object-cover object-[48%_45%]"/>
      </div>
      <div className="min-w-0 flex-1 space-y-3 pr-4">
        <span className="text-[10px] leading-relaxed tracking-[.12em] text-gothic-gold">THE MISTRESS OF THE MANOR · 月纱</span>
        <h2 className="text-xl font-semibold leading-snug text-gothic-ivory sm:text-2xl">今夜的公寓，如何了？</h2>
        <p className="text-sm leading-7 text-gothic-muted">“已经住进 {goal.guests} 位邻居了。每扇门后都有属于自己的故事……要不要再去看看？”</p>
        <p className="text-xs leading-relaxed text-gothic-muted">幸福度 {goal.happiness} / 100 · 预计每日收入 +{cozyDailyIncome(world).total} ✦</p>
        <button type="button" onClick={()=>setWitchRoom(true)} data-testid="visit-yuesha-room"
          className="mt-2 inline-flex min-h-10 items-center rounded-lg border border-gothic-brass bg-gothic-wine/80 px-4 py-2 text-sm text-gothic-ivory hover:border-gothic-glow">拜访月纱会客室</button>
        <GothicPanelLink href="/orders/">查看月纱委托 ›</GothicPanelLink>
      </div></>}
    </GothicModal>}
    </AnimatePresence>
    {notices&&<div className="absolute right-3 top-[72px] z-20 w-[min(350px,92vw)] rounded-xl border border-gothic-brass/75 bg-gothic-panel/95 p-4 text-gothic-ivory shadow-[0_15px_44px_#000c] backdrop-blur-xl"
      role="dialog" aria-label="公寓日志" onKeyDown={event=>{if(event.key==='Escape')setNotices(false);}}>
      <button type="button" aria-label="关闭公寓日志" onClick={()=>setNotices(false)}
        className="absolute right-2 top-2 grid size-8 place-items-center rounded-full border border-gothic-brass/50 bg-gothic-panel text-xl leading-none hover:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow"><X aria-hidden="true" size={17}/></button>
      <div className="flex items-start gap-3 pr-4">
        <Image src={moonveil} alt="月纱" width={64} height={75} unoptimized
          className="h-[75px] w-16 shrink-0 rounded-md border border-gothic-brass/50 object-cover"/>
        <div className="min-w-0 space-y-2">
          <h2 className="text-base font-semibold text-gothic-gold">月纱的夜间记录</h2>
          <p className="text-xs leading-relaxed text-gothic-muted">{latest?.zh??'今晚还没有新的故事。'}</p>
          <p className="text-xs leading-relaxed text-gothic-muted">目前 {goal.guests} 位住客，平均幸福度 {goal.happiness}。</p>
        </div>
      </div>
    </div>}
  </main>;
}
