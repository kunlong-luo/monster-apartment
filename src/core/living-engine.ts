import { SPIRIT_BY_ID, isSpiritId } from './spirit-collection';
import type { CollectionState, SpiritId } from './spirit-collection';

export type WorkRoom = 'reactor' | 'garden' | 'gate';
export const WORK_ROOMS: readonly WorkRoom[] = ['reactor','garden','gate'];
export type Crisis = 'spores' | 'blackout' | null;
export type Intruder = { id:number; kind:'wisp'|'brute'|'siege'; hp:number; maxHp:number; distance:number };
export type LivingState = {
  phase:'ready'|'running'|'won'|'lost';
  tick:number; power:number; food:number; integrity:number; heat:number;
  hunger:number; crisis:Crisis;
  rooms:Record<WorkRoom,SpiritId|null>;
  invaders:Intruder[]; nextId:number; breaches:number; moves:number; cooldown:number;
  notice:string; history:string[];
  /** Tick of the latest visible incident or actual reassignment. Optional for old saves. */
  eventTick?:number;
  /** Accumulating pressure drives incidents; optional for older independent saves. */
  stress?:{spores:number;grid:number};
  /** Incident expiry is measured in simulation ticks, never wall time. */
  incidents?:{spores:number;blackout:number};
};

const clamp = (n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const waves = [
  {tick:8,kind:'wisp'},{tick:20,kind:'wisp'},{tick:32,kind:'brute'},
  {tick:45,kind:'wisp'},{tick:54,kind:'brute'},{tick:65,kind:'wisp'},
  {tick:77,kind:'brute'},{tick:87,kind:'wisp'},{tick:95,kind:'brute'},
  {tick:105,kind:'siege'},{tick:111,kind:'wisp'},
] as const;
const CYCLE = 120;
export const LIVING_DURATION = CYCLE;
export const livingPhase = (tick:number):string =>
  tick < 30 ? '建立生产' : tick < 65 ? '危险累积' : tick < 94 ? '调整岗位' : '最终围攻';

function squad(collection:CollectionState):SpiritId[] {
  const owned=Object.keys(collection.owned).filter(isSpiritId);
  return Array.from(new Set(['lantern-beetle','seedling','dewdrop',...owned].filter(
    (id):id is SpiritId=>isSpiritId(id)&&!!collection.owned[id])));
}

export function createLivingGame(collection:CollectionState):LivingState {
  const units=squad(collection);
  return {phase:'ready',tick:0,power:7,food:8,integrity:16,heat:2,hunger:0,
    crisis:null,rooms:{reactor:units[0]??null,garden:units[1]??null,gate:units[2]??null},
    invaders:[],nextId:1,breaches:0,moves:0,cooldown:0,
    notice:'三间房相互依存：发电供能，温室供食，哨戒抵御来袭。将灵核拖到需要它的房间。',
    history:[],stress:{spores:0,grid:0},incidents:{spores:0,blackout:0}};
}
export function startLiving(state:LivingState):LivingState {
  return state.phase!=='ready'?state:{...state,phase:'running',notice:'夜幕降临，公寓开始自动运转。'};
}
export function livingRoster(collection:CollectionState):SpiritId[] {return squad(collection);}

/** Move a worker by dropping their card on a room, automatically swapping occupants. */
export function moveLivingWorker(state:LivingState, id:SpiritId, target:WorkRoom,
  collection:CollectionState):LivingState {
  if ((state.phase!=='running'&&state.phase!=='ready')||!collection.owned[id]||state.cooldown>0)return state;
  if (state.rooms[target]===id)return state;
  const rooms={...state.rooms};
  const origin=WORK_ROOMS.find(key=>rooms[key]===id);
  const displaced=rooms[target];
  if(origin)rooms[origin]=displaced;
  rooms[target]=id;
  return {...state,rooms,moves:state.moves+1,cooldown:state.phase==='running'?2:0,
    eventTick:state.tick,
    notice:(SPIRIT_BY_ID[id].zh)+' 已前往'+({reactor:'核心炉',garden:'温室',gate:'哨戒台'}[target])+
      (displaced?'，交换岗位。':'。')};
}

/** A short deterministic projection, not a separate action or resource bonus.
 * It shows what changes if this spirit moves to a room while the night keeps going. */
export type LivingImpact = {
  power:number; food:number; integrity:number; heat:number;
  reasonZh:string; reasonEn:string;
};
const roomEffects:Record<WorkRoom,Record<string,[string,string]>>={
  reactor:{
    economy:['快速发电，但炉温会升高','Generates power faster, but raises heat'],
    repair:['降低炉温，稳定电网','Cools the furnace and stabilizes power'],
    guard:['供电较慢，防线将空缺','Slower energy; a different room loses its worker'],
    explore:['常规发电，占用其它岗位','Standard generation at the cost of another post'],
  },
  garden:{
    economy:['温室维持产出，但占用发电人手','Sustains crops, but pulls an engineer from elsewhere'],
    repair:['净化孢子并加速粮食恢复','Purifies spores and restores food faster'],
    guard:['温室产量较低，门口可能失守','Low food yield; the gate may lose its defender'],
    explore:['温室维持基础产量','Provides basic greenhouse output'],
  },
  gate:{
    economy:['耗电反击较弱，但能保护建筑','Weaker energy-consuming defense'],
    repair:['修理岗离开生产区，支援防线','Takes a repairer away from utilities to reinforce the gate'],
    guard:['快速击退入侵者，需持续供电','Strong defense against invaders, consuming power'],
    explore:['远程侦察并提前攻击敌人','Scouts and attacks threats before they reach the door'],
  },
};
/** Pure eight-tick lookahead comparing moved vs unmoved, including scheduled hazards. */
export function forecastLivingMove(state:LivingState,id:SpiritId,target:WorkRoom,
  collection:CollectionState,steps=8):LivingImpact|null {
  if(!collection.owned[id] || !['running','ready'].includes(state.phase) ||
    state.cooldown>0 || state.rooms[target]===id)return null;
  const candidate=moveLivingWorker(state,id,target,collection);
  if(candidate===state)return null;
  let baseline=state.phase==='ready'?startLiving(state):state;
  let assigned=candidate.phase==='ready'?startLiving(candidate):candidate;
  for(let i=0;i<Math.max(1,Math.min(16,steps));i++){
    baseline=advanceLiving(baseline);
    assigned=advanceLiving(assigned);
  }
  const role=SPIRIT_BY_ID[id].role;
  const [reasonZh,reasonEn]=roomEffects[target][role];
  return { power:assigned.power-baseline.power, food:assigned.food-baseline.food,
    integrity:assigned.integrity-baseline.integrity, heat:assigned.heat-baseline.heat,
    reasonZh,reasonEn };
}

const roleOf=(state:LivingState,room:WorkRoom)=>{
  const id=state.rooms[room];
  return id ? SPIRIT_BY_ID[id].role : null;
};
export function livingTip(state:LivingState):string {
  if(state.integrity<=6)return '核心受损严重！派出守护灵核抵御入侵，别让敌人靠近左侧大门。';
  if(state.heat>=7)return '核心炉过热！把修缮灵核派到核心炉可降温，同时守卫会短暂削弱。';
  if(state.crisis==='spores'&&roleOf(state,'garden')!=='repair')return '温室遭到孢子侵袭。调入修缮灵核可恢复食物生产。';
  if(state.crisis==='blackout'&&roleOf(state,'reactor')!=='repair')return '线路故障！只有修缮灵核能够继续为建筑充能。';
  if(state.power<=2)return '电力将尽！哨戒台与温室争夺能源，优先调配核心炉员工。';
  if(state.food<=3)return '食物短缺！温室没有电或缺少工作人员时居民会挨饿。';
  if(state.invaders.some(e=>e.distance<45))return '入侵者逼近！守护灵核在哨戒台可以更快击退它们。';
  return '观察电量、食物、炉温与入侵路线，拖动灵核进行岗位交换。';
}

export function advanceLiving(state:LivingState):LivingState {
  if(state.phase!=='running')return state;
  const tick=state.tick+1;
  let {power,food,integrity,heat,hunger,breaches,nextId}=state;
  const reactor=roleOf(state,'reactor');
  const gardener=roleOf(state,'garden');
  const guard=roleOf(state,'gate');
  // Incidents arise from player decisions and material pressure, not a calendar.
  // A heavily harvested greenhouse breeds spores; starvation or an unstaffed
  // greenhouse does too. Excess heat and brownouts strain the shared grid.
  const stress={...(state.stress ?? {spores:0,grid:0})};
  const incidents={...(state.incidents ?? {spores:0,blackout:0})};
  let notice='';
  if(tick%4===0){
    const sporesRisk=!gardener || food<=4 || (gardener==='economy' && food>=9);
    stress.spores=clamp(stress.spores+(gardener==='repair'?-3:sporesRisk?2:-1),0,12);
    const gridRisk=heat>=7 || (power<=2 && reactor!=='repair');
    stress.grid=clamp(stress.grid+(reactor==='repair'?-3:gridRisk?2:-1),0,12);
    if(stress.spores>=6 && tick>=incidents.spores){
      incidents.spores=tick+16;
      stress.spores=0;
      notice='温室养分失衡，孢子蔓延！让修缮灵核净化温室。';
    }
    if(stress.grid>=6 && tick>=incidents.blackout){
      incidents.blackout=tick+12;
      stress.grid=0;
      notice='核心炉负荷失控，整栋楼的电网出现故障！';
    }
  }
  const sporesActive=tick<incidents.spores;
  const blackoutActive=tick<incidents.blackout;
  const crisis:Crisis=blackoutActive?'blackout':sporesActive?'spores':null;
  const history=[...state.history];
  let invaders=state.invaders.map(enemy=>({...enemy}));
  for(const wave of waves)if(wave.tick===tick){
    const hp=wave.kind==='siege'?24:wave.kind==='brute'?13:7;
    invaders.push({id:nextId++,kind:wave.kind,hp,maxHp:hp,distance:100});
    notice=wave.kind==='siege'?'巨型侵蚀体逼近大门！':'污染体正沿通道接近公寓。';
  }
  if(tick%4===0){
    // Work always has a visible opportunity cost: greenhouse and defense share energy.
    if(reactor&& (!blackoutActive||reactor==='repair')){
      power=clamp(power+(reactor==='economy'?4:reactor==='repair'?2:3),0,12);
    }
    if(gardener&&power>0){
      power-=1;
      food=clamp(food+(sporesActive&&gardener!=='repair'?1:
        gardener==='repair'?3:gardener==='guard'?1:2),0,12);
    }
  }
  if(tick%2===0){
    heat=clamp(heat+(reactor==='economy'?2:reactor==='repair'?-3:reactor?1:-2),0,12);
    if(heat>=10){
      integrity-=2;power=Math.max(0,power-2);heat=6;
      notice='核心炉爆发过热！建筑耐久 -2，电力泄漏。';
      history.push('第'+tick+'刻：过热损伤');
    }
    // Scouts spot danger sooner; guards hit harder up close. Both draw from the shared grid.
    const target=invaders.filter(e=>e.distance<=(guard==='explore'?95:78))
      .sort((a,b)=>a.distance-b.distance)[0];
    if(target&&guard&&power>0){
      power-=1;
      target.hp-=guard==='guard'?5:guard==='explore'?4:guard==='economy'?2:3;
    }
  }
  // A repairer at the gate can recover damaged shields, at the cost of
  // withdrawing their cooling and purification work elsewhere.
  if(guard==='repair' && tick%12===0 && power>=2 && integrity<16){
    power-=2;
    integrity=Math.min(16,integrity+1);
    notice='修缮灵核为哨戒台修复了护盾。';
  }
  if(tick%9===0){
    food=Math.max(0,food-2);
  }
  if(food===0)hunger+=1;else hunger=0;
  if(hunger>=7&&tick%4===0){integrity-=1;notice='居民断粮，建筑凝聚力正在下降！';}
  invaders=invaders.filter(e=>e.hp>0).map(e=>({...e,distance:e.distance-(e.kind==='siege'?3:5)}));
  const escaped=invaders.filter(e=>e.distance<=0);
  if(escaped.length){
    breaches+=escaped.length;
    integrity-=escaped.reduce((sum,e)=>sum+(e.kind==='siege'?6:e.kind==='brute'?4:3),0);
    notice='污染体突破哨戒台，公寓核心受损！';
    history.push('第'+tick+'刻：敌人突破');
  }
  invaders=invaders.filter(e=>e.distance>0);
  if(tick===94)notice='污染体开始集结，准备抵御最终围攻。';
  if(state.crisis && !crisis && !notice)
    notice='危机已解除！电力和食物生产逐步恢复正常。';
  integrity=clamp(integrity,0,16);
  const phase:LivingState['phase']=integrity<=0?'lost':tick>=CYCLE?'won':'running';
  if(phase!=='running'){
    notice=phase==='won'?'公寓平安度过危机！每次调岗都改变了资源与防御。':
      '公寓核心熄灭了。观察资源消耗与突破时机，重新分配灵核。';
  }
  if(history.length>20)history.splice(0,history.length-20);
  return {...state,tick,power,food,integrity,heat,hunger,crisis,invaders,breaches,nextId,
    cooldown:Math.max(0,state.cooldown-1),phase,notice:notice||state.notice,
    eventTick:notice?tick:state.eventTick,stress,incidents,history};
}
export function livingGrade(state:LivingState):number {
  return Math.max(0,Math.round((state.integrity/16)*60+
    (state.food/12)*15+(state.power/12)*15+
    Math.max(0,10-state.breaches*2)));
}
