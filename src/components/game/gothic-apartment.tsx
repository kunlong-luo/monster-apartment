'use client';
import Link from 'next/link';
import Image from 'next/image';
import {useEffect,useState,useSyncExternalStore} from 'react';
import moonveil from '../../../v2/art/moonveil-portrait.avif';
import {COZY_RESIDENTS,ROOM_DETAILS,FURNISHINGS,
  newCozyGame,validCozySave,resumeCozySave,advanceCozy,availableResidents,
  buildCozyRoom,moveInCozy,decorateCozy,relocateCozyResident,careForCozyResident,
  cozyCareUsedToday,cozyDay,cozyGoal,cozyDailyIncome,cozyRescuePreview,resolveCozyIncident,COZY_INCIDENTS} from '@/core/cozy-engine';
import type {CozyState,HomeType,Furnishing} from '@/core/cozy-engine';
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
  return <main className="ga" data-testid="gothic-apartment" aria-label="哥特公寓经营">
    <div className="ga-backdrop" style={{backgroundImage:'url('+'../lobby-hero.webp'+')'}} aria-hidden="true"/>
    <div className="ga-light" aria-hidden="true"/>
    <div className="ga-shade" aria-hidden="true"/>
    <div className="ga-dust" aria-hidden="true"/>
    <header className="ga-top">
      <Link className="ga-home" href="/" aria-label="返回大厅">⌂ <span>夜色公寓</span></Link>
      <div className="ga-resources" aria-label="公寓真实存档">
        <span>☾ 第 <b>{cozyDay(world.tick)}</b> 天</span>
        <span>✦ <b data-testid="ga-coins">{world.coins}</b></span>
        <span>♡ <b>{goal.happiness}</b></span>
        <span>♟ <b>{goal.guests}/6</b></span>
      </div>
      <div className="ga-tools">
        <button type="button" onClick={()=>setPaused(x=>!x)}
          aria-label={paused?'继续公寓时间':'暂停公寓时间'} aria-pressed={paused}>{paused?'▶':'Ⅱ'}</button>
        <button type="button" onClick={()=>setNotices(x=>!x)} aria-expanded={notices} aria-label="公寓日志">✉</button>
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
        {!room?<div className="ga-picks">
          {types.map(type=><button key={type} type="button" data-testid={'ga-build-'+type}
            disabled={world.coins<ROOM_DETAILS[type].cost}
            onClick={()=>change(buildCozyRoom(world,selected,type))}>
            <b aria-hidden="true">{roomRunes[type]}</b><span>{ROOM_DETAILS[type].zh}</span>
            <small>✦ {ROOM_DETAILS[type].cost}</small></button>)}
        </div>:!room.resident?<div className="ga-picks">
          {applicants.map(id=><button key={id} type="button" data-testid={'ga-welcome-'+id}
            onClick={()=>change(moveInCozy(world,selected,id))}>
            <b>♟</b><span>迎接 {guest(id).zh}</span><small>{guest(id).bioZh}</small></button>)}
          {applicants.length===0&&<p className="ga-empty">住客已经入住其他房间，暂时没有新访客。</p>}
        </div>:<div className="ga-picks">
          <button type="button" onClick={()=>change(careForCozyResident(world,room.resident!))}
            disabled={cozyCareUsedToday(world)} data-testid="ga-care">
            <b>♡</b><span>照顾 {guest(room.resident).zh}</span>
            <small>{cozyCareUsedToday(world)?'今日已照顾':'增进羁绊'}</small></button>
          <button type="button" onClick={()=>setMoving(x=>x===selected?null:selected)}
            aria-pressed={moving===selected}><b>↔</b><span>{moving===selected?'取消搬迁':'搬迁 / 交换'}</span>
            <small>然后点击另一扇已建房门</small></button>
          {decors.map(item=><button type="button" key={item} data-testid={'ga-decor-'+item}
            disabled={world.coins<FURNISHINGS[item].cost||room.decor===item}
            onClick={()=>change(decorateCozy(world,selected,item))}>
            <b aria-hidden="true">{furnishingRunes[item]}</b><span>{FURNISHINGS[item].zh}</span>
            <small>{room.decor===item?'已摆放':'✦ '+FURNISHINGS[item].cost}</small></button>)}
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
    {witchOpen&&<div className="ga-conversation-scrim"
      onMouseDown={event=>{if(event.target===event.currentTarget)setWitchOpen(false);}}>
      <section className="ga-conversation" role="dialog" aria-modal="true" aria-label="与月纱交谈">
        <button type="button" className="ga-conversation-close" aria-label="关闭月纱对话"
          onClick={()=>setWitchOpen(false)}>×</button>
        <div className="ga-conversation-art"><Image src={moonveil} alt="月纱的绘制肖像" fill sizes="130px"/></div>
        <div className="ga-conversation-text">
          <span className="ga-micro">THE MISTRESS OF THE MANOR · 月纱</span>
          <h2>今夜的公寓，如何了？</h2>
          <p>“已经住进 {goal.guests} 位邻居了。每扇门后都有属于自己的故事……要不要再去看看？”</p>
          <p>幸福度 {goal.happiness} / 100 · 预计每日收入 +{cozyDailyIncome(world).total} ✦</p>
          <Link href="/orders/" className="ga-conversation-link">查看月纱委托 ›</Link>
        </div>
      </section>
    </div>}
    {notices&&<div className="ga-popover" role="dialog" aria-label="公寓日志">
      <button type="button" aria-label="关闭公寓日志" onClick={()=>setNotices(false)}>×</button>
      <Image src={moonveil} alt="月纱" width={64} height={75}/>
      <strong>月纱的夜间记录</strong>
      <p>{latest?.zh??'今晚还没有新的故事。'}</p>
      <p>目前 {goal.guests} 位住客，平均幸福度 {goal.happiness}。</p>
    </div>}
    <nav className="ga-dock" aria-label="公寓世界导航">
      {nav.map(d=><Link href={d.href} key={d.href}><span>{d.icon}</span><small>{d.label}</small></Link>)}
    </nav>
  </main>;
}
