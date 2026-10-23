'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { SAVE_KEY, decodeSave } from '@/lib/save-game';
import { newCollection, isSpiritId, SPIRIT_BY_ID } from '@/core/spirit-collection';
import type { CollectionState, SpiritId } from '@/core/spirit-collection';
import { createLivingGame, advanceLiving, startLiving, moveLivingWorker, livingRoster, livingTip, livingGrade, LIVING_DURATION, WORK_ROOMS, forecastLivingMove } from '@/core/living-engine';
import type { LivingState, WorkRoom } from '@/core/living-engine';
import { SpiritPortrait } from './spirit-portrait';

const LivingCanvas = dynamic(() => import('./living-canvas').then(mod => mod.LivingCanvas), {
  ssr: false, loading: () => <div className="living-loading" aria-label="Loading the apartment" />,
});
const STORAGE='monster-apartment:living:v1';
type Lang='zh'|'en';
const info:Record<WorkRoom,{zh:string;en:string;subZh:string;subEn:string;icon:string;position:CSSProperties}>={
  reactor:{zh:'核心炉',en:'Core furnace',subZh:'产电 / 炉温',subEn:'Power / Heat',icon:'⚡',
    position:{left:'6.2%',top:'19.3%',width:'27.2%',height:'31.5%'}},
  garden:{zh:'星光温室',en:'Starlit greenhouse',subZh:'耗电 / 食物',subEn:'Power / Food',icon:'❀',
    position:{left:'36.3%',top:'19.3%',width:'28.6%',height:'31.5%'}},
  gate:{zh:'哨戒台',en:'Watch gate',subZh:'耗电 / 防御',subEn:'Power / Defense',icon:'⛨',
    position:{left:'6.4%',top:'56.5%',width:'58.6%',height:'30.5%'}},
};
const roles={
  guard:{zh:'守护',en:'Guard'},repair:{zh:'修缮',en:'Repair'},
  economy:{zh:'经营',en:'Engineer'},explore:{zh:'探索',en:'Scout'},
};
const fallbackEnglish=(state:LivingState)=>{
  if(state.phase==='won')return 'Your sanctuary survived. Every relocation changed the outcome.';
  if(state.phase==='lost')return 'The core failed. Try changing who guards, grows food, and repairs the reactor.';
  if(state.heat>=7)return 'Reactor overheating! Send a repair spirit to the furnace before it damages the building.';
  if(state.crisis==='spores')return 'Spores block food production. Repair spirits restore the greenhouse.';
  if(state.crisis==='blackout')return 'Blackout! Only repair spirits can restore the damaged power line.';
  if(state.integrity<=6)return 'Core integrity critical. Reinforce the gate before invaders breach!';
  if(state.invaders.some(e=>e.distance<45))return 'Invaders approaching. A guard at the gate attacks more effectively.';
  return 'Move spirits between rooms. Power runs the greenhouse and the gate; overheating and attacks demand tradeoffs.';
};
function isSavedState(data:unknown):data is LivingState{
  if(!data||typeof data!=='object')return false;
  const v=data as Partial<LivingState>;
  return !!v.rooms && WORK_ROOMS.every(room=>{
    const id=v.rooms?.[room];
    return id===null||isSpiritId(id);
  }) && ['ready','running','lost','won'].includes(v.phase??'') &&
    typeof v.tick==='number'&&Number.isInteger(v.tick)&&v.tick>=0&&v.tick<=LIVING_DURATION &&
    [v.power,v.food,v.integrity,v.heat].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=16) &&
    Array.isArray(v.invaders)&&v.invaders.length<=32 &&
    typeof v.nextId==='number'&&Number.isInteger(v.nextId);
}
const statInfo=(zh:boolean)=>[
  {id:'power',label:zh?'电力':'Power',icon:'⚡',max:12,color:'#ffd28c'},
  {id:'food',label:zh?'食物':'Food',icon:'❀',max:12,color:'#a7e9b1'},
  {id:'integrity',label:zh?'核心':'Core',icon:'◆',max:16,color:'#8edacb'},
  {id:'heat',label:zh?'炉温':'Heat',icon:'♨',max:12,color:'#f5a38c'},
] as const;
type InitialRun={state:LivingState;collection:CollectionState;lang:Lang};
function initialRun():InitialRun {
  const starters=newCollection();
  let roster=starters;
  try {
    const previous=decodeSave(localStorage.getItem(SAVE_KEY));
    if(previous?.collection){
      roster={...previous.collection,owned:{...starters.owned,...previous.collection.owned}};
    }
    const saved=JSON.parse(localStorage.getItem(STORAGE)??'null') as {state?:unknown;lang?:Lang}|null;
    const initial=saved&&isSavedState(saved.state)?saved.state:createLivingGame(roster);
    const inhabitants=Object.values(initial.rooms).filter((id):id is SpiritId=>!!id);
    return { state: inhabitants.some(id=>!roster.owned[id])?createLivingGame(roster):initial,
      collection:roster,lang:saved?.lang==='en'?'en':'zh'};
  } catch {
    return {state:createLivingGame(roster),collection:roster,lang:'zh'};
  }
}
export function LivingApartment(){
  // The entire component is client-only; lazy initialization safely restores before first paint.
  const [boot]=useState(initialRun);
  const [state,setState]=useState<LivingState>(boot.state);
  const collection=boot.collection;
  const [selected,setSelected]=useState<SpiritId|null>(null);
  const [lang,setLang]=useState<Lang>(boot.lang);
  const [paused,setPaused]=useState(false);
  const zh=lang==='zh';
  useEffect(()=>{
    try{localStorage.setItem(STORAGE,JSON.stringify({state,lang}));}
    catch{/* Private mode can disable persistence; old save remains untouched. */}
  },[state,lang]);
  const phase=state.phase;
  useEffect(()=>{
    if(phase!=='running'||paused)return;
    const timer=window.setInterval(()=>setState(current=>advanceLiving(current)),900);
    return ()=>window.clearInterval(timer);
  },[phase,paused]);
  const move=useCallback((id:SpiritId,room:WorkRoom)=>{
    if(state.cooldown>0)return;
    setState(current=>moveLivingWorker(current,id,room,collection));
    setSelected(null);
  },[collection,state.cooldown]);
  useEffect(()=>{
    const listener=(ev:KeyboardEvent)=>{
      if(ev.key===' '&&!(ev.target instanceof HTMLButtonElement)){
        ev.preventDefault();
        setPaused(p=>!p);
      }
    };
    window.addEventListener('keydown',listener);
    return ()=>window.removeEventListener('keydown',listener);
  },[]);
  const residents=livingRoster(collection);
  const won=state.phase==='won',lost=state.phase==='lost';
  const crisis=state.crisis==='spores'?zh?'孢子侵袭':'Spore bloom':
    state.crisis==='blackout'?zh?'电网故障':'Blackout':null;
  const reset=()=>{
    setState(createLivingGame(collection));setPaused(false);setSelected(null);
  };
  return <main className="living-shell" data-testid="living-apartment">
    <header className="living-header">
      <div className="living-title">
        <span className="living-crest" aria-hidden="true">✧</span>
        <div><p className="living-kicker">SPIRIT CORE · LIVING SANCTUARY</p>
          <h1>{zh?'灵核公寓':'Spirit Sanctuary'} <span className="living-version">实验原型 0.7</span></h1>
        </div>
      </div>
      <div className="living-header-right">
        <div className="living-clock" data-testid="living-time">
          <span className="living-daylight" aria-hidden="true">☾</span>
          <strong>{Math.floor(state.tick/12)+1}</strong><span>/10 {zh?'阶段':'phases'}</span>
          <div className="living-progress"><i style={{width:state.tick/LIVING_DURATION*100+'%'}} /></div>
        </div>
        <button type="button" className="living-minor" onClick={()=>setLang(zh?'en':'zh')} aria-label="Change language">
          {zh?'EN':'中文'}
        </button>
        <button type="button" className="living-minor" onClick={reset}>
          <span aria-hidden="true">↻ </span>{zh?'重开':'Restart'}
        </button>
      </div>
    </header>
    <div className="living-statbar" aria-label={zh?'建筑资源':'Building resources'}>
      {statInfo(zh).map(stat=>{
        const value=state[stat.id];
        return <div key={stat.id} className="living-stat" data-testid={'living-stat-'+stat.id}>
          <div className="living-stat-top"><span style={{color:stat.color}}>{stat.icon} {stat.label}</span>
            <strong className={(stat.id==='heat'?value>=8:value<=3)?'living-danger':''}>{value}<small>/{stat.max}</small></strong>
          </div>
          <div className="living-bar"><i style={{width:(value/stat.max)*100+'%',background:stat.color}}/></div>
        </div>;
      })}
    </div>
    <section className="living-message" role="status">
      <span className={'living-signal '+(crisis?'is-danger':'')} aria-hidden="true">◉</span>
      <div className="living-hint"><span className="living-signal-text">{zh?livingTip(state):fallbackEnglish(state)}</span></div>
      {crisis&&<span className="living-alert" data-testid="living-crisis">⚠ {crisis}</span>}
      {state.phase==='running'&&<button className="living-minor" data-testid="living-pause"
        onClick={()=>setPaused(p=>!p)} aria-pressed={paused}>
        {paused?(zh?'▶ 继续':'▶ Resume'):(zh?'Ⅱ 暂停':'Ⅱ Pause')}
      </button>}
    </section>
    <div className="living-main">
      <div className="living-world" data-testid="living-world">
        <LivingCanvas state={state}/>
        <span className="living-world-label">{zh?'同一座公寓 · 生产与战斗同时进行':'One building · Work and defense happen together'}</span>
        {state.eventTick !== undefined && state.phase === 'running' &&
          state.tick - state.eventTick <= 3 && (
            <p data-testid="living-event" role="status" className="living-event">
              <span aria-hidden="true">✦</span> {zh ? state.notice :
                state.crisis === 'spores' ? 'Spores are spreading in the greenhouse!' :
                  state.crisis === 'blackout' ? 'The power grid has malfunctioned!' :
                    state.heat >= 7 ? 'The furnace is running too hot!' :
                      state.invaders.length ? 'Hostile creatures are approaching the gate!' :
                        'Your crew has changed assignments.'}
            </p>
          )}
        {WORK_ROOMS.map(room=>{
          const meta=info[room],occupant=state.rooms[room],spirit=occupant?SPIRIT_BY_ID[occupant]:null;
          const selectedOccupant=occupant===selected;
          const impact=selected?forecastLivingMove(state,selected,room,collection):null;
          const changes=impact ? [
            {icon:'⚡',label:zh?'电':'Power',value:impact.power,good:impact.power>0},
            {icon:'❀',label:zh?'食':'Food',value:impact.food,good:impact.food>0},
            {icon:'◆',label:zh?'防':'Core',value:impact.integrity,good:impact.integrity>0},
            {icon:'♨',label:zh?'热':'Heat',value:impact.heat,good:impact.heat<0},
          ].filter(change=>change.value!==0) : [];
          return <button key={room} type="button" data-testid={'living-room-'+room}
            style={meta.position} className={'living-room '+(selectedOccupant?'is-selected':'')+
              (impact?' is-preview':'')}
            aria-label={(zh?meta.zh:meta.en)+(spirit?' '+spirit[lang]:'')}
            onClick={()=>selected?move(selected,room):occupant&&setSelected(occupant)}
            onDragOver={event=>event.preventDefault()}
            onDrop={event=>{event.preventDefault();const id=event.dataTransfer.getData('text/plain');if(isSpiritId(id))move(id,room);}}>
            <span className="living-room-name">{meta.icon} {zh?meta.zh:meta.en}
              <small>{zh?meta.subZh:meta.subEn}</small>
            </span>
            {occupant&&<span className="living-room-spirit" aria-hidden="true">
              <SpiritPortrait id={occupant} size={58} evolution={collection.owned[occupant]?.evolution??0}/>
            </span>}
            {occupant&&<span className="living-room-occupant">{spirit?.[lang]}</span>}
            {impact && <span className="living-impact" data-testid={'living-impact-'+room}>
              <span className="living-impact-heading">{zh?'预计未来8刻':'Next 8 ticks'}</span>
              {changes.length ? <span className="living-impact-values">
                {changes.map(change=><span key={change.label}
                  className={change.good?'positive':'negative'}>{change.icon}{change.value>0?'+':''}{change.value}</span>)}
              </span>:<span className="living-impact-values">{zh?'短期资源持平':'No short-term difference'}</span>}
              <span className="living-impact-detail">{zh?impact.reasonZh:impact.reasonEn}</span>
            </span>}
            {room==='reactor'&&state.heat>=7&&<span className="living-room-warning">♨ {zh?'过热':'HOT'}</span>}
            {room==='garden'&&state.crisis==='spores'&&<span className="living-room-warning">☁ {zh?'孢子':'SPORES'}</span>}
            {room==='gate'&&state.invaders.length>0&&<span className="living-room-warning">
              ⚔ {state.invaders.length} {zh?'敌人':'enemies'}</span>}
          </button>;
        })}
        {state.phase==='ready'&&<div className="living-veil">
          <div className="living-dialog">
            <span className="living-emblem">✧</span>
            <h2>{zh?'一座会呼吸的公寓':'A Sanctuary That Breathes'}</h2>
            <p>{zh?'发电室为温室和守卫提供能量。过热、断粮和入侵会同时发生；把灵核移动到最需要它的地方。':
              'The reactor powers your greenhouse and defenses. Heat, hunger, and invaders all compete for your crew.'}</p>
            <p className="living-instruction">
              {zh?'先点下方灵核，再点房间；电脑端也可拖动灵核。':'Select a spirit below, then a room. On desktop, drag and drop.'}
            </p>
            <button data-testid="living-start" onClick={()=>setState(startLiving(state))}>
              {zh?'开始守护公寓 →':'Begin the night →'}
            </button>
          </div>
        </div>}
        {paused&&state.phase==='running'&&<div className="living-pause-shade" aria-hidden="true">{zh?'暂停中 · 可以调岗':'Paused · Reassign workers'}</div>}
        {(won||lost)&&<div className="living-veil">
          <div className="living-dialog" data-testid="living-result">
            <span className="living-emblem">{won?'✦':'◈'}</span>
            <h2>{won?zh?'公寓守住了！':'Sanctuary survived!':zh?'核心熄灭了':'The core went dark'}</h2>
            <p>{zh?'存活':'Time'} {state.tick}/{LIVING_DURATION} ·
              {zh?' 完整度 ':' Core '} {state.integrity}/16 ·
              {zh?' 突破 ':' Breaches '} {state.breaches}</p>
            {won&&<strong className="living-final-grade">
              {zh?'评价':'Grade'} {livingGrade(state)}/100
            </strong>}
            <p>{zh?'下一局试着减少炉温过载，或把守护灵核留在入侵最密集的时刻。':
              'Next time, avoid overheating the reactor and keep a guard near the gate when invaders surge.'}</p>
            <button onClick={reset} data-testid="living-retry">{zh?'再来一局 ↻':'Play again ↻'}</button>
          </div>
        </div>}
      </div>
    </div>
    <section className="living-dock" aria-label={zh?'灵核队伍':'Spirit crew'}>
      <div className="living-dock-heading">
        <strong>✦ {zh?'驻守灵核':'Your crew'}</strong>
        <span>{state.cooldown>0?(zh?'调岗中 · '+state.cooldown+' 刻后可再调整':'Relocating · '+state.cooldown+' ticks until next move'):
          selected?(zh?'房间内显示调岗后的资源变化；点击确认':'Room previews show the tradeoffs · Tap to move'):
          zh?'选择灵核，再点击房间安排它':'Select a spirit, then choose a room'}</span>
      </div>
      <div className="living-crew">
        {residents.map(id=>{
          const spirit=SPIRIT_BY_ID[id],room=WORK_ROOMS.find(r=>state.rooms[r]===id);
          return <button key={id} type="button" draggable={state.phase==='running'||state.phase==='ready'}
            data-testid={'living-worker-'+id}
            className={'living-worker '+(selected===id?'is-picked':'')}
            aria-pressed={selected===id}
            onDragStart={e=>{e.dataTransfer.setData('text/plain',id);setSelected(id);}}
            onClick={()=>setSelected(selected===id?null:id)}>
            <SpiritPortrait id={id} size={50} evolution={collection.owned[id]?.evolution??0}/>
            <span className="living-worker-copy"><strong>{spirit[lang]}</strong><small>{roles[spirit.role][lang]}
                {' · '}{room?info[room][lang]:(zh?'待命':'Reserve')}</small></span>
          </button>;
        })}
      </div>
      <p className="living-footer">{zh?'◈ 原有收藏已导入 · 新进度独立存储，不覆盖旧版存档':
        '◈ Original collection imported · This run uses a separate save'}</p>
    </section>
  </main>;
}
