'use client';
import Link from 'next/link';
import Image from 'next/image';
import {AnimatePresence} from 'motion/react';
import {useEffect,useState,useSyncExternalStore} from 'react';
import moonveil from '../../../v2/art/moonveil-portrait.avif';
import {COZY_RESIDENTS,ROOM_DETAILS,FURNISHINGS,
  newCozyGame,validCozySave,resumeCozySave,advanceCozy,availableResidents,
  buildCozyRoom,moveInCozy,decorateCozy,relocateCozyResident,careForCozyResident,
  cozyCareUsedToday,cozyDay,cozyGoal,cozyDailyIncome,cozyRescuePreview,resolveCozyIncident,COZY_INCIDENTS} from '@/core/cozy-engine';
import type {CozyState,HomeType,Furnishing} from '@/core/cozy-engine';
import {GothicAtmosphere} from './gothic-atmosphere';
import {useGothicMotion} from '@/lib/game/gothic-motion';
import {GothicActionButton,GothicDock,GothicIconButton,GothicResourcePill,GothicModal,GothicPanelLink} from './gothic-hud';
import './gothic-apartment.css';
const KEY='monster-apartment:cozy:v1';
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
const types:HomeType[]=['nest','bath','workshop','greenhouse'];
const decors:Furnishing[]=['plant','lamp','books'];
const roomRunes:Record<HomeType,string>={nest:'⌂',bath:'◈',workshop:'⚒',greenhouse:'❀'};
const furnishingRunes:Record<Furnishing,string>={plant:'❀',lamp:'✧',books:'☷'};
const nav=[{href:'/',icon:'♜',label:'大厅'},{href:'/town/',icon:'✧',label:'探索'},
  {href:'/workshop/',icon:'⚒',label:'工坊'},{href:'/orders/',icon:'❦',label:'委托'},
  {href:'/characters/',icon:'♟',label:'住客'}];
export function GothicApartment(){
  const ready=useSyncExternalStore(subscribeClient,clientSnapshot,serverSnapshot);
  const [world,setWorld]=useState<CozyState>(readCozySave);
  const [selected,setSelected]=useState<number|null>(null);
  const [moving,setMoving]=useState<number|null>(null);
  const [paused,setPaused]=useState(false);
  const {reduced:reducedMotion}=useGothicMotion();
  const [notices,setNotices]=useState(false);
  const [witchOpen,setWitchOpen]=useState(false);
  const [feedback,setFeedback]=useState<{id:number;text:string}|null>(null);
  useEffect(()=>{
    if(!ready)return;
    try{localStorage.setItem(KEY,JSON.stringify(world));}catch{/* Optional local save. */}
  },[ready,world]);
  useEffect(()=>{
    if(!ready||paused||world.phase!=='playing')return;
    const clock=window.setInterval(()=>setWorld(current=>advanceCozy(current)),2000);
    return ()=>window.clearInterval(clock);
  },[ready,paused,world.phase]);
  useEffect(()=>{
    if(!feedback)return;
    const timer=window.setTimeout(()=>setFeedback(current=>
      current?.id===feedback.id?null:current),4500);
    return ()=>window.clearTimeout(timer);
  },[feedback]);
  if(!ready)return <main className="ga ga-loading">☽ 公寓正在点亮烛火…</main>;
  const goal=cozyGoal(world),applicants=availableResidents(world);
  const room=selected===null?null:world.rooms[selected];
  const incident=world.incident;
  const latest=world.journal[world.journal.length-1];
  const change=(next:CozyState)=>{
    if(next===world)return;
    setWorld(next);
    const story=next.journal[next.journal.length-1];
    if(story?.key!==world.journal[world.journal.length-1]?.key)
      setFeedback(previous=>({id:(previous?.id??0)+1,text:story.zh}));
  };
  const guest=(id:typeof applicants[number])=>COZY_RESIDENTS.find(p=>p.id===id)!;
  const choose=(index:number)=>{
    if(moving!==null&&index!==moving){
      change(relocateCozyResident(world,moving,index));
      setMoving(null);setSelected(index);
    }else setSelected(value=>value===index?null:index);
  };
  return <main className={reducedMotion?'ga ga--still':'ga'} data-testid="gothic-apartment" aria-label="哥特公寓经营"
    onKeyDown={event=>{if(event.key==='Escape'){setWitchOpen(false);setNotices(false);}}}>
    <div className="ga-backdrop" style={{backgroundImage:'url('+'../lobby-hero.webp'+')'}} aria-hidden="true"/>
    <div className="ga-light" aria-hidden="true"/>
    <div className="ga-shade" aria-hidden="true"/>
    <div className="ga-dust" aria-hidden="true"/>
    <GothicAtmosphere paused={paused||reducedMotion}/>
    <header className="absolute inset-x-0 top-0 z-[5] flex min-h-[56px] items-start gap-1.5 bg-[linear-gradient(#08060ad3,transparent)] px-2 py-2.5 sm:gap-3 sm:px-6" aria-label="公寓资源与操作">
      <Link className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-gothic-brass/70 bg-gothic-panel/80 px-2.5 text-gothic-ivory backdrop-blur-md transition-colors hover:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow sm:px-3"
        href="/" aria-label="返回大厅">⌂ <span className="hidden text-sm sm:inline">夜色公寓</span></Link>
      <div className="ml-auto flex items-start gap-1 sm:gap-2" aria-label="公寓真实存档">
        <GothicResourcePill symbol="☾" amount={cozyDay(world.tick)} label="公寓天数"/>
        <GothicResourcePill symbol="✦" amount={world.coins} label="星币" testId="ga-coins"/>
        <GothicResourcePill symbol="♡" amount={goal.happiness} label="幸福度"/>
        <GothicResourcePill symbol="♟" amount={goal.guests+'/6'} label="入住"/>
      </div>
      <div className="flex shrink-0 gap-1 sm:gap-2">
        <GothicIconButton label={paused?'继续公寓时间':'暂停公寓时间'} pressed={paused}
          onClick={()=>setPaused(x=>!x)}>{paused?'▶':'Ⅱ'}</GothicIconButton>
        <GothicIconButton label="公寓日志" expanded={notices} onClick={()=>setNotices(x=>!x)}>✉</GothicIconButton>
      </div>
    </header>
    <aside className="ga-room-list" aria-label="可交互的公寓房间">
      <div className="ga-list-title">RESIDENCE · 六扇房门</div>
      <div className="ga-doors">
        {world.rooms.map((place,index)=>{
          const resident=place?.resident?guest(place.resident):null;
          return <button key={index} type="button" onClick={()=>choose(index)}
            data-testid={'ga-room-'+index}
            aria-label={String(index+1)+'号房 '+(place?ROOM_DETAILS[place.type].zh:'待建造')}
            aria-pressed={selected===index}
            className={'ga-door'+(selected===index?' is-active':'')+(resident?' is-occupied':'')}>
            <span className="ga-door-icon" aria-hidden="true">{place?roomRunes[place.type]:'✧'}</span>
            <span className="ga-door-copy"><strong>{String(index+1).padStart(2,'0')} · {place?ROOM_DETAILS[place.type].zh:'待建造'}</strong>
              <small>{resident?'住客 · '+resident.zh:place?'房间空置':'点击修建'}</small></span>
          </button>;
        })}
      </div>
      {incident&&<span className="ga-incident">✧ {COZY_INCIDENTS[incident.kind].zh}</span>}
    </aside>
    <button className="ga-witch" type="button" onClick={()=>{setSelected(null);setWitchOpen(true);}}
      aria-label="与女主人月纱交流" title="月纱 · 女主人"/>
    <div className="ga-witch-title" aria-hidden="true">月纱 <small>暗夜公寓的女主人</small></div>
    <section className="ga-lower" aria-label="房间交互及经营动态">
      {selected===null?<div className="ga-story">
        <span className="ga-micro">THE NIGHT IS YOUNG</span>
        <strong>{latest?.zh??'今夜的公寓格外安静。'}</strong>
        <small>预计每日收入 +{cozyDailyIncome(world).total} ✦ · 点击左侧房门开始经营</small>
      </div>:<div className="ga-room-drawer" data-testid="ga-room-drawer">
        <div className="ga-drawer-top"><div>
          <span className="ga-micro">ROOM {String(selected+1).padStart(2,'0')}</span>
          <h2>{room?ROOM_DETAILS[room.type].zh:'布置新房间'}</h2>
        </div><button type="button" className="ga-dismiss" aria-label="关闭房间操作"
          onClick={()=>{setSelected(null);setMoving(null);}}>×</button></div>
        {!room?<div className="grid grid-cols-2 gap-2 max-[600px]:gap-1.5">
          {types.map(type=><GothicActionButton key={type}
            testId={'ga-build-'+type} disabled={world.coins<ROOM_DETAILS[type].cost}
            onClick={()=>change(buildCozyRoom(world,selected,type))}
            rune={roomRunes[type]} label={ROOM_DETAILS[type].zh}
            detail={'✦ '+ROOM_DETAILS[type].cost}/>)}
        </div>:!room.resident?<div className="grid grid-cols-2 gap-2 max-[600px]:gap-1.5">
          {applicants.map(id=><GothicActionButton key={id}
            testId={'ga-welcome-'+id} onClick={()=>change(moveInCozy(world,selected,id))}
            rune="♟" label={'迎接 '+guest(id).zh} detail={guest(id).bioZh}/>)}
          {applicants.length===0&&<p className="col-span-2 text-xs leading-relaxed text-gothic-muted">
            住客已经入住其他房间，暂时没有新访客。
          </p>}
        </div>:<div className="grid grid-cols-2 gap-2 max-[600px]:gap-1.5">
          <GothicActionButton testId="ga-care" rune="♡"
            label={'照顾 '+guest(room.resident).zh}
            detail={cozyCareUsedToday(world)?'今日已照顾':'增进羁绊'}
            disabled={cozyCareUsedToday(world)}
            onClick={()=>change(careForCozyResident(world,room.resident!))}/>
          <GothicActionButton rune="↔" pressed={moving===selected}
            label={moving===selected?'取消搬迁':'搬迁 / 交换'}
            detail="然后点击另一扇已建房门"
            onClick={()=>setMoving(x=>x===selected?null:selected)}/>
          {decors.map(item=><GothicActionButton key={item}
            testId={'ga-decor-'+item}
            disabled={world.coins<FURNISHINGS[item].cost||room.decor===item}
            onClick={()=>change(decorateCozy(world,selected,item))}
            rune={furnishingRunes[item]} label={FURNISHINGS[item].zh}
            detail={room.decor===item?'已摆放':'✦ '+FURNISHINGS[item].cost}/>)}
        </div>}
        {incident&&<div className="ga-warning" aria-label="公寓突发事件">
          <strong>✧ {COZY_INCIDENTS[incident.kind].zh}</strong>
          <small>{COZY_INCIDENTS[incident.kind].hintZh} · 选择帮手会真实影响修缮收益</small>
          <div className="ga-rescue-helpers">
            {COZY_RESIDENTS.filter(person=>world.rooms.some(p=>p?.resident===person.id))
              .map(person=>{
                const forecast=cozyRescuePreview(world,person.id);
                return <button type="button" key={person.id}
                  onClick={()=>change(resolveCozyIncident(world,person.id))}>
                  <span>{person.zh}</span><small>{forecast?.expert?'擅长 · +12 星币':'修缮 · -6 星币'}</small>
                </button>;
              })}
          </div>
        </div>}
      </div>}
    </section>
    {feedback&&<div className="ga-feedback" role="status" key={feedback.id}>
      <span aria-hidden="true">✦</span>{feedback.text}
    </div>}
    <AnimatePresence mode="wait">
    {witchOpen&&<GothicModal key={"moonveil"} title="与月纱交谈" closeLabel="关闭月纱对话"
      onClose={()=>setWitchOpen(false)} wide>
      <div className="relative hidden min-h-[215px] w-[120px] shrink-0 overflow-hidden rounded-md border border-gothic-brass/60 bg-gothic-panel sm:block">
        <Image src={moonveil} alt="月纱的绘制肖像" fill sizes="130px" className="object-cover"/>
      </div>
      <div className="min-w-0 flex-1 space-y-3 pr-4">
        <span className="text-[10px] leading-relaxed tracking-[.12em] text-gothic-gold">THE MISTRESS OF THE MANOR · 月纱</span>
        <h2 className="text-xl font-semibold leading-snug text-gothic-ivory sm:text-2xl">今夜的公寓，如何了？</h2>
        <p className="text-sm leading-7 text-gothic-muted">“已经住进 {goal.guests} 位邻居了。每扇门后都有属于自己的故事……要不要再去看看？”</p>
        <p className="text-xs leading-relaxed text-gothic-muted">幸福度 {goal.happiness} / 100 · 预计每日收入 +{cozyDailyIncome(world).total} ✦</p>
        <GothicPanelLink href="/orders/">查看月纱委托 ›</GothicPanelLink>
      </div>
    </GothicModal>}
    </AnimatePresence>
    {notices&&<div className="absolute right-3 top-[72px] z-20 w-[min(350px,92vw)] rounded-xl border border-gothic-brass/75 bg-gothic-panel/95 p-4 text-gothic-ivory shadow-[0_15px_44px_#000c] backdrop-blur-xl"
      role="dialog" aria-label="公寓日志" onKeyDown={event=>{if(event.key==='Escape')setNotices(false);}}>
      <button type="button" aria-label="关闭公寓日志" onClick={()=>setNotices(false)}
        className="absolute right-2 top-2 grid size-8 place-items-center rounded-full border border-gothic-brass/50 bg-gothic-panel text-xl leading-none hover:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow">×</button>
      <div className="flex items-start gap-3 pr-4">
        <Image src={moonveil} alt="月纱" width={64} height={75}
          className="h-[75px] w-16 shrink-0 rounded-md border border-gothic-brass/50 object-cover"/>
        <div className="min-w-0 space-y-2">
          <h2 className="text-base font-semibold text-gothic-gold">月纱的夜间记录</h2>
          <p className="text-xs leading-relaxed text-gothic-muted">{latest?.zh??'今晚还没有新的故事。'}</p>
          <p className="text-xs leading-relaxed text-gothic-muted">目前 {goal.guests} 位住客，平均幸福度 {goal.happiness}。</p>
        </div>
      </div>
    </div>}
    <GothicDock items={nav} label="公寓世界导航"/>
  </main>;
}
