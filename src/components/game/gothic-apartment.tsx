'use client';
import Link from 'next/link';
import Image from 'next/image';
import {useEffect,useState} from 'react';
import {lobbyPreview} from './gothic-lobby-art';
import moonveil from '../../../v2/art/moonveil-portrait.avif';
import {COZY_RESIDENTS,ROOM_DETAILS,FURNISHINGS,
  newCozyGame,validCozySave,resumeCozySave,advanceCozy,availableResidents,
  buildCozyRoom,moveInCozy,decorateCozy,relocateCozyResident,careForCozyResident,
  cozyCareUsedToday,cozyDay,cozyGoal,cozyDailyIncome,resolveCozyIncident,COZY_INCIDENTS} from '@/core/cozy-engine';
import type {CozyState,HomeType,Furnishing} from '@/core/cozy-engine';
import './gothic-apartment.css';
const KEY='monster-apartment:cozy:v1';
const types:HomeType[]=['nest','bath','workshop','greenhouse'];
const decors:Furnishing[]=['plant','lamp','books'];
const nav=[{href:'/',icon:'♜',label:'大厅'},{href:'/town/',icon:'✧',label:'探索'},
  {href:'/workshop/',icon:'⚒',label:'工坊'},{href:'/orders/',icon:'❦',label:'委托'},
  {href:'/characters/',icon:'♟',label:'住客'}];
export function GothicApartment(){
  const [world,setWorld]=useState<CozyState|null>(null);
  const [selected,setSelected]=useState<number|null>(null);
  const [moving,setMoving]=useState<number|null>(null);
  const [paused,setPaused]=useState(false);
  const [notices,setNotices]=useState(false);
  useEffect(()=>{
    let saved:CozyState=newCozyGame();
    try{
      const raw=localStorage.getItem(KEY);
      if(raw){const parsed:unknown=JSON.parse(raw);
        if(validCozySave(parsed))saved=resumeCozySave(parsed);}
    }catch{/* Invalid saves cannot crash the game. */}
    setWorld(saved);
  },[]);
  useEffect(()=>{
    if(!world)return;
    try{localStorage.setItem(KEY,JSON.stringify(world));}catch{/* Optional local save. */}
  },[world]);
  useEffect(()=>{
    if(!world||paused||world.phase!=='playing')return;
    const clock=window.setInterval(()=>setWorld(current=>current?advanceCozy(current):current),2000);
    return ()=>window.clearInterval(clock);
  },[world?.phase,paused,world===null]);
  if(!world)return <main className="ga ga-loading">☽ 公寓正在点亮烛火…</main>;
  const goal=cozyGoal(world),applicants=availableResidents(world);
  const room=selected===null?null:world.rooms[selected];
  const incident=world.incident;
  const latest=world.journal[world.journal.length-1];
  const change=(next:CozyState)=>{if(next!==world)setWorld(next);};
  const guest=(id:typeof applicants[number])=>COZY_RESIDENTS.find(p=>p.id===id)!;
  const choose=(index:number)=>{
    if(moving!==null&&index!==moving){
      change(relocateCozyResident(world,moving,index));
      setMoving(null);setSelected(index);
    }else setSelected(value=>value===index?null:index);
  };
  return <main className="ga" data-testid="gothic-apartment" aria-label="哥特公寓经营">
    <div className="ga-backdrop" style={{backgroundImage:'url('+lobbyPreview+')'}} aria-hidden="true"/>
    <div className="ga-shade" aria-hidden="true"/>
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
            <span className="ga-door-icon">{place?ROOM_DETAILS[place.type].icon:'⌂'}</span>
            <span className="ga-door-copy"><strong>{String(index+1).padStart(2,'0')} · {place?ROOM_DETAILS[place.type].zh:'待建造'}</strong>
              <small>{resident?'住客 · '+resident.zh:place?'房间空置':'点击修建'}</small></span>
          </button>;
        })}
      </div>
      {incident&&<span className="ga-incident">✧ {COZY_INCIDENTS[incident.kind].zh}</span>}
    </aside>
    <button className="ga-witch" type="button" onClick={()=>{setSelected(null);setNotices(true);}}
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
            <b>{ROOM_DETAILS[type].icon}</b><span>{ROOM_DETAILS[type].zh}</span>
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
            <b>{FURNISHINGS[item].icon}</b><span>{FURNISHINGS[item].zh}</span>
            <small>{room.decor===item?'已摆放':'✦ '+FURNISHINGS[item].cost}</small></button>)}
        </div>}
        {incident&&<div className="ga-warning"><span>{COZY_INCIDENTS[incident.kind].zh}</span>
          {world.rooms.some(r=>r?.resident)&&<button type="button" onClick={()=>{
            const helper=world.rooms.find(r=>r?.resident)?.resident;
            if(helper)change(resolveCozyIncident(world,helper));
          }}>派住客帮忙处理</button>}</div>}
      </div>}
    </section>
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
