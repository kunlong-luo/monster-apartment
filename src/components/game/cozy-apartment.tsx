'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { CozySpirit } from './cozy-spirit';
import { CozyStreetBackdrop } from './cozy-street-backdrop';
import { CozyRoomForeground } from './cozy-room-foreground';
import { CozyRoomMoment } from './cozy-room-moment';
import { CozyStairwell } from './cozy-stairwell';
import type { CozyMoment, CozyMomentKind } from './cozy-room-moment';
import { cozyWorldLight, cozyWorldWeather } from '@/game/cozy-world-direction';
import { CozyRoomArt, CozyRoomIcon, CozyDecorIcon } from './cozy-room-art';
import {
  COZY_RESIDENTS, ROOM_DETAILS, FURNISHINGS, MAX_TICKS, TICKS_PER_DAY,
  advanceCozy, availableResidents, buildCozyRoom,
  cozyDay, cozyGoal, dailyRent, decorateCozy, moveInCozy, newCozyGame,
  residentActivity, residentHappiness, validCozySave,
  relocateCozyResident, previewCozyRelocation, cozyVisits,
} from '@/core/cozy-engine';
import type { CozyState, HomeType, Furnishing } from '@/core/cozy-engine';
import type { SpiritId } from '@/core/spirit-collection';

const CozyWorldEffects=dynamic(()=>import('./cozy-world-effects').then(m=>m.CozyWorldEffects),
  {ssr:false});

const SAVE_KEY = 'monster-apartment:cozy:v1';
type Locale='zh'|'en';
const roomTypes:HomeType[]=['nest','bath','workshop','greenhouse'];
const furnishingTypes:Furnishing[]=['plant','lamp','books'];
const adjectives:Record<string,{zh:string;en:string;emoji:string}>={
  sleep:{zh:'正在做梦',en:'Dreaming',emoji:'z·z'},
  work:{zh:'忙自己的小事',en:'Keeping busy',emoji:'✦'},
  wander:{zh:'在房间里闲逛',en:'Wandering',emoji:'♪'},
  visit:{zh:'想去串门',en:'Thinking of a visit',emoji:'♡'},
};
function hydrate():CozyState{
  try {
    const raw=window.localStorage.getItem(SAVE_KEY);
    if(raw){
      const data:unknown=JSON.parse(raw);
      if(validCozySave(data))return data;
    }
  } catch { /* invalid or unavailable browser storage starts a fresh game */ }
  return newCozyGame();
}
export function CozyApartment(){
  const [state,setState]=useState<CozyState>(hydrate);
  const [selectedRoom,setSelectedRoom]=useState<number|null>(null);
  const [pickedApplicant,setPickedApplicant]=useState<SpiritId|null>(null);
  const [movingFrom,setMovingFrom]=useState<number|null>(null);
  const [language,setLanguage]=useState<Locale>('zh');
  const [paused,setPaused]=useState(false);
  const [roomMoments,setRoomMoments]=useState<Record<number,CozyMoment>>({});
  const momentId=useRef(0);
  const zh=language==='zh';
  const complete=state.phase==='complete';
  const newest=state.journal[state.journal.length-1];
  const applicants=availableResidents(state);
  const goal=cozyGoal(state);
  const chosenRoom=selectedRoom===null?null:state.rooms[selectedRoom];
  const visits=cozyVisits(state);
  const liveVisit=visits[0];
  const worldLight=cozyWorldLight(state.tick);
  const worldWeather=cozyWorldWeather(state.tick);

  useEffect(()=>{
    if(state.phase!=='playing'||paused)return;
    const timer=window.setInterval(()=>setState(previous=>advanceCozy(previous)),1150);
    return ()=>window.clearInterval(timer);
  },[state.phase,paused]);
  useEffect(()=>{
    try{window.localStorage.setItem(SAVE_KEY,JSON.stringify(state));}
    catch{/* local-only progress is optional in private windows */}
  },[state]);
  const commitRoomAction=(next:CozyState,kind:CozyMomentKind,indices:number[])=>{
    if(next===state)return false;
    setState(next);
    const sequence=++momentId.current;
    const changes=Object.fromEntries(indices.map(index=>[index,{kind,sequence}])) as Record<number,CozyMoment>;
    setRoomMoments(previous=>({...previous,...changes}));
    return true;
  };
  const reset=()=>{
    setState(newCozyGame());setSelectedRoom(null);setPickedApplicant(null);
    setMovingFrom(null);setPaused(false);setRoomMoments({});
  };
  const clickRoom=(index:number)=>{
    const room=state.rooms[index];
    if(movingFrom!==null){
      if(index===movingFrom){setMovingFrom(null);return;}
      if(room){
        commitRoomAction(relocateCozyResident(state,movingFrom,index),'welcome',[movingFrom,index]);
        setMovingFrom(null);
        setSelectedRoom(index);
      }
      return;
    }
    if(pickedApplicant && room && room.resident===null){
      commitRoomAction(moveInCozy(state,index,pickedApplicant),'welcome',[index]);
      setPickedApplicant(null);setSelectedRoom(index);
      return;
    }
    setSelectedRoom(current=>current===index?null:index);
  };
  const build=(type:HomeType)=>{
    if(selectedRoom===null)return;
    commitRoomAction(buildCozyRoom(state,selectedRoom,type),'build',[selectedRoom]);
  };
  const furnish=(decor:Furnishing)=>{
    if(selectedRoom===null)return;
    commitRoomAction(decorateCozy(state,selectedRoom,decor),'furnish',[selectedRoom]);
  };
  const moveIn=(id:SpiritId)=>{
    if(selectedRoom===null)return;
    commitRoomAction(moveInCozy(state,selectedRoom,id),'welcome',[selectedRoom]);
    setPickedApplicant(null);
  };
  return <main className={'cozy-shell '+(state.tick%TICKS_PER_DAY>=7?'is-evening':'is-morning')+
    (paused?' is-paused':'')}
    data-world-light={worldLight} data-world-weather={worldWeather}
    data-testid="cozy-apartment">
    <header className="cozy-header">
      <div className="cozy-brand">
        <span className="cozy-seal" aria-hidden="true">☾</span>
        <div>
          <p className="cozy-eyebrow">MOONLIGHT STREET · LITTLE LIVES</p>
          <h1>{zh?'灵核公寓':'Spirit Residence'}</h1>
          <p className="cozy-tagline">{zh?'亲手布置一座有故事的小楼':'Build a little building full of stories'}</p>
        </div>
      </div>
      <div className="cozy-controls">
        <div className="cozy-day" data-testid="cozy-day">
          <span>{zh?'第':'Day'} {cozyDay(state.tick)}{zh?'天':' / 8'}</span>
          <div className="cozy-day-track"><i style={{width:(state.tick/MAX_TICKS)*100+'%'}}/></div>
        </div>
        <button type="button" className="cozy-icon-button" aria-label="Change language" onClick={()=>setLanguage(zh?'en':'zh')}>{zh?'EN':'中'}</button>
        <button type="button" className="cozy-icon-button" aria-label={zh?'重新开始':'Restart'} onClick={reset}>↻</button>
        <button type="button" className="cozy-icon-button" data-testid="cozy-pause"
          aria-pressed={paused} aria-label={paused?(zh?'继续':'Resume'):(zh?'暂停':'Pause')}
          onClick={()=>setPaused(p=>!p)}>{paused?'▶':'Ⅱ'}</button>
      </div>
    </header>

    <div className="cozy-summary" aria-label={zh?'公寓概况':'Apartment status'}>
      <div className="cozy-stat"><span>✦ {zh?'星币':'Coins'}</span><strong data-testid="cozy-coins">{state.coins}</strong></div>
      <div className="cozy-stat"><span>♡ {zh?'平均幸福度':'Happiness'}</span><strong data-testid="cozy-happiness">{goal.happiness}<small>/100</small></strong></div>
      <div className="cozy-stat"><span>⌂ {zh?'已入住':'Moved in'}</span><strong data-testid="cozy-occupancy">{goal.guests}<small>/6</small></strong></div>
      <div className="cozy-stat"><span>☀ {zh?'每日租金':'Daily rent'}</span><strong data-testid="cozy-rent">+{dailyRent(state)}</strong></div>
    </div>

    <section className="cozy-play" aria-label={zh?'公寓建造场景':'Apartment construction'}>
      <div className="cozy-scenery" aria-hidden="true">
        <CozyStreetBackdrop/>
        <div className="cozy-weather" aria-hidden="true"/>
      </div>
      <div className="cozy-building">
        <div className="cozy-roof">
          <div className="cozy-roof-dormer" aria-hidden="true"><span/></div>
          <div className="cozy-roof-sign"><small>EST. 08 · MOONLIGHT STREET</small>
            <strong>MOONLIGHT <i>RESIDENCE</i></strong></div>
          <div className="cozy-roof-chimney" aria-hidden="true"/>
        </div>
        <div className="cozy-floors">
          <CozyStairwell rooms={state.rooms} visits={visits}/>
          {state.rooms.map((room,index)=>{
            const active=selectedRoom===index;
            const person=room?.resident?COZY_RESIDENTS.find(r=>r.id===room.resident):undefined;
            const action=person?residentActivity(state.tick,person.id):null;
            const floor=3-Math.floor(index/2);
            const want=pickedApplicant && !!room && room.resident===null;
            const canRehouse=movingFrom!==null && movingFrom!==index && !!room;
            const shift=movingFrom!==null?previewCozyRelocation(state,movingFrom,index):null;
            const visitingAway=visits.some(visit=>visit.from===index);
            const visitors=visits.filter(visit=>visit.to===index);
            const signed=(n:number)=>n>0?'+'+n:String(n);
            return <button type="button" key={index} data-testid={'cozy-room-'+index}
              aria-pressed={active} aria-label={(zh?floor+'楼 ':'Floor '+floor+' ') +
                (room? ROOM_DETAILS[room.type][language]:(zh?'待建造':'Empty lot'))+
                (person?' · '+person[language]:'')}
              className={'cozy-room '+(room?'is-'+room.type:'is-empty')+(active?' is-active':'')+
                (want?' can-move-in':'')+(canRehouse?' can-rehouse':'')}
              style={{gridColumn:index%2===0?1:3,gridRow:Math.floor(index/2)+1}}
              draggable={!!person&&!complete}
              onDragStart={event=>{
                if(!person)return;
                event.dataTransfer.setData('application/x-cozy-room',String(index));
                event.dataTransfer.effectAllowed='move';
                setMovingFrom(index);setSelectedRoom(index);setPickedApplicant(null);
              }}
              onClick={()=>clickRoom(index)}
              onDragOver={event=>event.preventDefault()}
              onDrop={event=>{
                event.preventDefault();
                const source=event.dataTransfer.getData('application/x-cozy-room');
                if(source!=='' && room){
                  const from=Number(source);
                  commitRoomAction(relocateCozyResident(state,from,index),'welcome',[from,index]);
                  setMovingFrom(null);setSelectedRoom(index);return;
                }
                const id=event.dataTransfer.getData('text/plain') as SpiritId;
                if(COZY_RESIDENTS.some(r=>r.id===id) && room && !room.resident){
                  commitRoomAction(moveInCozy(state,index,id),'welcome',[index]);
                  setPickedApplicant(null);setSelectedRoom(index);
                }
              }}>
              <span className="cozy-floor-number">{floor}F</span>
              {room&&<span className="cozy-room-door" aria-hidden="true"/>}
              {room ? <>
                <CozyRoomArt type={room.type} decor={room.decor}/>
                <span className="cozy-room-name">{ROOM_DETAILS[room.type][language]}</span>
                {person ? visitingAway ?
                  <span className="cozy-out-visiting" data-testid={'cozy-away-'+person.id}>
                    {zh?'去邻居家串门 →':'Visiting a neighbor →'}
                  </span> :
                  <span className={'cozy-actor is-'+action} title={adjectives[action!][language]}
                    data-testid={'cozy-actor-'+person.id}>
                    <CozySpirit id={person.id} size={82} activity={action!}/>
                  </span> :
                  <span className="cozy-available">{zh?'待入住 · 选择住户':'Available · Welcome someone'}</span>}
                {visitors.map(visit=><span key={visit.visitor}
                  className="cozy-guest" data-testid={'cozy-visit-'+visit.visitor}>
                  <CozySpirit id={visit.visitor} size={52} activity="visit"/>
                  <small>{zh?'来串门':'Visiting'}</small>
                </span>)}
                <CozyRoomForeground type={room.type} activity={action}/>
                {roomMoments[index]&&<CozyRoomMoment key={roomMoments[index].sequence}
                  kind={roomMoments[index].kind}/>}
                {person&&<span className="cozy-resident-label">{person[language]} <span>♡ {residentHappiness(state,person.id)}</span></span>}
                {shift&&<span className="cozy-move-preview" data-testid={'cozy-move-preview-'+index}>
                  {zh?'搬迁后':'After move'} ♡ {signed(shift.happiness)} · ✦ {signed(shift.rent)}/{zh?'天':'day'}
                </span>}
              </> : <><span className="cozy-empty-structure" aria-hidden="true">
                  <i className="beam-left"/><i className="beam-right"/><i className="foundation"/>
                  <i className="outline-window"/>
                </span>
                <span className="cozy-empty-invite"><span>＋</span><strong>{zh?'建造房间':'Build a room'}</strong><small>{zh?'让这里亮起灯光':'Light up this space'}</small></span>
              </>}
            </button>;
          })}
        </div>
        <CozyWorldEffects state={state} paused={paused}/>
        <div className="cozy-building-base"><span>◆</span><span>{zh?'月光街 8 号':'8 Moonlight Street'}</span><span>◆</span></div>
      </div>
      <div className="cozy-side-note">
        <span className="cozy-note-eyebrow">TODAY&apos;S NOTE</span>
        <p data-testid="cozy-story" role="status">{newest?.[language]}</p>
        {liveVisit?<small data-testid="cozy-social-pulse">
          ♡ {COZY_RESIDENTS.find(resident=>resident.id===liveVisit.visitor)?.[language]}
          {zh?'正在探望':' is visiting '}
          {COZY_RESIDENTS.find(resident=>resident.id===liveVisit.host)?.[language]}
        </small>:<small>{zh?'生活在这里慢慢发生 · 每天都会有新变化':'Little moments happen here · each day brings something new'}</small>}
      </div>
    </section>

    <section className="cozy-dock" data-testid="cozy-actions" aria-label={zh?'公寓操作':'Apartment interaction'}>
      {complete? <div className="cozy-outcome" data-testid="cozy-result">
        <div><strong>{zh?'第一周的公寓日记':'The First Week'}</strong>
          <p>{zh?'入住':'Residents'} {goal.guests}/6 · ♡ {goal.happiness}/100 · {zh?goal.grade:goal.success?'A cozy success!':'A new beginning'}</p></div>
        <button className="cozy-action" onClick={reset}>{zh?'再开一栋小楼 ↻':'Start another building ↻'}</button>
      </div> :
      selectedRoom!==null ? <>
        <div className="cozy-context-title">
          <div><strong>{state.rooms[selectedRoom] ?
            ROOM_DETAILS[state.rooms[selectedRoom]!.type][language] :
            (zh?'建造一个新房间':'Build a new room')}</strong>
            <span>{movingFrom!==null?(zh?'点击发光的房间搬迁或交换，收益会即时变化':'Tap a highlighted room to move or swap. See the outcome first.'):
              !chosenRoom?(zh?'房型决定什么样的住户愿意长住':'The room type affects who feels at home'):
              chosenRoom.resident?(zh?'布置家具，或搬家结识新邻居':'Furnish the room or move to meet new neighbors'):
              (zh?'欢迎一位等待搬家的住户':'Welcome a waiting visitor')}</span>
          </div>
          <button className="cozy-dismiss" onClick={()=>{setSelectedRoom(null);setMovingFrom(null);}} aria-label={zh?'收起':'Close'}>✕</button>
        </div>
        <div className="cozy-option-row">
          {!chosenRoom ? roomTypes.map(type=><button type="button" className="cozy-option" key={type}
            data-testid={'cozy-build-'+type} disabled={state.coins<ROOM_DETAILS[type].cost}
            onClick={()=>build(type)}><CozyRoomIcon type={type}/>
              <strong>{ROOM_DETAILS[type][language]}</strong><small>✦ {ROOM_DETAILS[type].cost}</small></button>) :
          !chosenRoom.resident ? (applicants.length?applicants.map(id=>{
            const guest=COZY_RESIDENTS.find(r=>r.id===id)!;
            return <button type="button" className="cozy-option is-tenant" key={id}
              data-testid={'cozy-welcome-'+id} onClick={()=>moveIn(id)}>
              <CozySpirit id={id} size={45}/><strong>{guest[language]}</strong><small>
                {zh?'喜欢':'Loves'} {ROOM_DETAILS[guest.favorite][language]}</small>
            </button>;
          }):<p className="cozy-dock-empty">{zh?'访客们都有家了！新邻居会在之后到访。':'All visitors have homes. More will arrive soon.'}</p>) :
          <>
          <button type="button" className="cozy-option is-relocate" data-testid="cozy-relocate"
            aria-pressed={movingFrom===selectedRoom}
            onClick={()=>{setMovingFrom(current=>current===selectedRoom?null:selectedRoom);setPickedApplicant(null);}}>
            <span>↔</span><strong>{movingFrom!==null?(zh?'取消搬迁':'Cancel move'):(zh?'搬迁 / 交换':'Move / Swap')}</strong>
            <small>{zh?'试试新的邻居布局':'Change neighbors, not furniture'}</small>
          </button>
          {furnishingTypes.map(decor=><button type="button" className="cozy-option" key={decor}
            data-testid={'cozy-decor-'+decor}
            disabled={chosenRoom.decor===decor||state.coins<FURNISHINGS[decor].cost}
            onClick={()=>furnish(decor)}><CozyDecorIcon decor={decor}/><strong>{FURNISHINGS[decor][language]}</strong>
              <small>{chosenRoom.decor===decor?(zh?'已摆放':'Placed'):'✦ '+FURNISHINGS[decor].cost}</small>
          </button>)}
          </>
          }
        </div>
      </> : <>
        <div className="cozy-context-title"><div><strong>{zh?'门口的访客':'Visitors at the door'}</strong>
          <span>{zh?'点空房建造 · 点访客再选一间空房':'Tap an empty space to build · pick a guest then an available room'}</span>
        </div></div>
        <div className="cozy-option-row">
          {applicants.map(id=>{
            const guest=COZY_RESIDENTS.find(r=>r.id===id)!;
            return <button type="button" key={id} draggable data-testid={'cozy-applicant-'+id}
              aria-pressed={pickedApplicant===id}
              onClick={()=>setPickedApplicant(value=>value===id?null:id)}
              onDragStart={e=>{e.dataTransfer.setData('text/plain',id);setPickedApplicant(id);}}
              className={'cozy-option is-tenant'+(pickedApplicant===id?' is-picked':'')}>
              <CozySpirit id={id} size={45}/><strong>{guest[language]}</strong>
              <small>{zh?'梦想：':'Dream: '}{ROOM_DETAILS[guest.favorite][language]}</small></button>;
          })}
          {!applicants.length&&<p className="cozy-dock-empty">{zh?'大家已经安顿好了。点空房继续扩建，或点房间为住户布置家具。':
            'Everyone is settled. Build more rooms or furnish the existing ones.'}</p>}
        </div>
      </>}
      <div className="cozy-dock-footer">
        <span>✧ {zh?'目标：迎接至少 3 位住户，平均幸福度达到 70':'Goal: 3 residents, 70 happiness'}</span>
        <span>{paused?(zh?'已暂停':'Paused'):(zh?'自动保存 · 生活正在继续':'Autosaved · Life goes on')}</span>
      </div>
    </section>
  </main>;
}
