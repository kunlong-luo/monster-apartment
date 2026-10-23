import type { SpiritId } from './spirit-collection';

export type HomeType = 'nest' | 'bath' | 'workshop' | 'greenhouse';
export type Furnishing = 'plant' | 'lamp' | 'books';
export type ApartmentRoom = { type: HomeType; resident: SpiritId | null; decor: Furnishing | null };
export type CozyPhase = 'playing' | 'complete';
export type CozyResident = {
  id: SpiritId; favorite: HomeType; decor: Furnishing; likes: SpiritId | null;
  zh: string; en: string; bioZh: string; bioEn: string;
};
export const COZY_RESIDENTS: readonly CozyResident[] = [
  { id:'seedling', favorite:'nest', decor:'plant', likes:'fern-hare',
    zh:'芽核', en:'Seedcore', bioZh:'喜欢晒太阳，正在找一个可以种花的家。', bioEn:'Dreams of a sunny home for little plants.' },
  { id:'dewdrop', favorite:'bath', decor:'books', likes:'seedling',
    zh:'露珠灵', en:'Dewdrop', bioZh:'每天都想泡澡，还会给邻居讲睡前故事。', bioEn:'Loves a warm bath and bedtime stories.' },
  { id:'lantern-beetle', favorite:'workshop', decor:'lamp', likes:'dewdrop',
    zh:'灯甲虫', en:'Lanternbeetle', bioZh:'一到晚上就点灯工作，最怕有人把灯关了。',
    bioEn:'Works late into the night under a golden lamp.' },
  { id:'fern-hare', favorite:'greenhouse', decor:'plant', likes:'seedling',
    zh:'蕨尾兔', en:'Fernhare', bioZh:'带着一袋种子来，希望在楼里交个朋友。', bioEn:'Carries seeds and hopes to find a friend.' },
  { id:'moon-scout', favorite:'workshop', decor:'books', likes:'lantern-beetle',
    zh:'月影雀', en:'Moonscout', bioZh:'爱收集小故事，会在深夜悄悄看书。', bioEn:'Collects stories and reads by moonlight.' },
];
export const ROOM_DETAILS:Record<HomeType,{ zh:string; en:string; icon:string; cost:number }> = {
  nest:{zh:'软绵卧室',en:'Cozy bedroom',icon:'🛏',cost:30},
  bath:{zh:'水汽浴室',en:'Warm bath',icon:'🛁',cost:34},
  workshop:{zh:'灯火工坊',en:'Lamp workshop',icon:'🛠',cost:38},
  greenhouse:{zh:'屋顶花房',en:'Plant room',icon:'🌿',cost:34},
};
export const FURNISHINGS:Record<Furnishing,{zh:string;en:string;icon:string;cost:number}> = {
  plant:{zh:'小盆栽',en:'Potted plant',icon:'🪴',cost:12},
  lamp:{zh:'萤光灯',en:'Glow lamp',icon:'💡',cost:12},
  books:{zh:'故事书',en:'Storybooks',icon:'📚',cost:12},
};
export const DAYS_TO_OPEN = 8;
export const TICKS_PER_DAY = 12;
export const MAX_TICKS = DAYS_TO_OPEN * TICKS_PER_DAY;
export type CozyEvent = {
  key:string; tick:number; zh:string; en:string; kind:'arrival'|'story'|'rent'|'move'|'decor';
};
export type CozyState = {
  version:1; phase:CozyPhase; tick:number; coins:number;
  rooms:(ApartmentRoom|null)[]; known:SpiritId[];
  bonds:Record<string,number>; seen:string[]; journal:CozyEvent[];
  lastIncome:number;
};
const profile = (id:SpiritId):CozyResident|undefined => COZY_RESIDENTS.find(r=>r.id===id);
const event = (state:CozyState,key:string,kind:CozyEvent['kind'],zh:string,en:string):CozyState => {
  if(state.seen.includes(key))return state;
  return {...state,seen:[...state.seen,key],
    journal:[...state.journal,{key,tick:state.tick,kind,zh,en}].slice(-18)};
};
export const cozyDay = (tick:number):number=>Math.min(DAYS_TO_OPEN,Math.floor(tick/TICKS_PER_DAY)+1);
export const occupied = (state:CozyState):number => state.rooms.filter(room=>room?.resident).length;
export const availableResidents = (state:CozyState):SpiritId[] =>
  state.known.filter(id=>!state.rooms.some(room=>room?.resident===id));
export const adjacent = (left:number,right:number):boolean => {
  const rowA=Math.floor(left/2),rowB=Math.floor(right/2);
  return (rowA===rowB && Math.abs(left-right)===1)
    || (Math.abs(rowA-rowB)===1 && left%2===right%2);
};
export function newCozyGame():CozyState {
  return {
    version:1,phase:'playing',tick:0,coins:105,
    rooms:[null,null,null,null,{type:'nest',resident:'seedling',decor:'plant'},null],
    known:['seedling','dewdrop','lantern-beetle'],
    bonds:{},seen:[],lastIncome:0,
    journal:[{key:'welcome',tick:0,kind:'story',
      zh:'欢迎来到月光街！芽核抱着小盆栽，成为公寓的第一位住户。试试为下一位访客建个家吧。',
      en:'Welcome to Moonlight Street! Seedcore has moved in with a little plant. Build a home for your next visitor.'}],
  };
}
export function residentHappiness(state:CozyState,id:SpiritId):number {
  const roomIndex=state.rooms.findIndex(room=>room?.resident===id);
  if(roomIndex===-1)return 0;
  const room=state.rooms[roomIndex]!;
  const p=profile(id);
  if(!p)return 55;
  let value=48+(room.type===p.favorite?23:-8)+(room.decor===p.decor?17:room.decor?5:0);
  for(let i=0;i<6;i++){
    const neighbor=state.rooms[i]?.resident;
    if(neighbor && adjacent(roomIndex,i) && (p.likes===neighbor||profile(neighbor)?.likes===id))value+=8;
  }
  return Math.max(10,Math.min(100,value));
}
export const buildingHappiness=(state:CozyState):number=>{
  const members=state.rooms.flatMap(room=>room?.resident?[room.resident]:[]);
  return members.length?Math.round(members.reduce((n,id)=>n+residentHappiness(state,id),0)/members.length):0;
};
export const dailyRent=(state:CozyState):number =>
  state.rooms.reduce((sum,room)=>room?.resident?sum+4+Math.floor(residentHappiness(state,room.resident)/12):sum,0);
export function buildCozyRoom(state:CozyState,index:number,type:HomeType):CozyState{
  if(state.phase!=='playing'||!Number.isInteger(index)||index<0||index>=6
    ||state.rooms[index]!==null||!ROOM_DETAILS[type]||state.coins<ROOM_DETAILS[type].cost)return state;
  const rooms=state.rooms.slice();rooms[index]={type,resident:null,decor:null};
  return event({...state,rooms,coins:state.coins-ROOM_DETAILS[type].cost},
    'built-'+index,'story','新房间建好了！窗帘拉开，整栋公寓又亮起了一盏灯。',
    'A new room is ready! Another window lights up on Moonlight Street.');
}
export function moveInCozy(state:CozyState,index:number,id:SpiritId):CozyState{
  if(state.phase!=='playing'||!state.known.includes(id)||!profile(id)
    ||!state.rooms[index]||state.rooms[index]?.resident
    ||state.rooms.some(room=>room?.resident===id))return state;
  const rooms=state.rooms.slice();rooms[index]={...rooms[index]!,resident:id};
  const p=profile(id)!;
  return event({...state,rooms},'move-'+id,'move',
    p.zh+'拖着小行李搬进了'+ROOM_DETAILS[rooms[index]!.type].zh+'。'+p.bioZh,
    p.en+' moved into the '+ROOM_DETAILS[rooms[index]!.type].en+'. '+p.bioEn);
}
export function decorateCozy(state:CozyState,index:number,decor:Furnishing):CozyState {
  const room=state.rooms[index];
  if(state.phase!=='playing'||!room||!FURNISHINGS[decor]
    ||room.decor===decor||state.coins<FURNISHINGS[decor].cost)return state;
  const rooms=state.rooms.slice();rooms[index]={...room,decor};
  return event({...state,rooms,coins:state.coins-FURNISHINGS[decor].cost},
    'decor-'+index+'-'+decor,'decor',
    FURNISHINGS[decor].zh+'摆进了房间，住户们围过来看个不停。',
    'New '+FURNISHINGS[decor].en.toLowerCase()+'! The neighbors stop by to admire it.');
}
export type ResidentActivity='sleep'|'work'|'wander'|'visit';
export const residentActivity=(tick:number,id:SpiritId):ResidentActivity=>{
  const offset=COZY_RESIDENTS.findIndex(r=>r.id===id);
  const hour=(tick+offset*3)%TICKS_PER_DAY;
  return hour<3?'sleep':hour<7?'work':hour<10?'wander':'visit';
};
const dailyStory=(state:CozyState):CozyState=>{
  let next=state;
  for(let i=0;i<6;i++){
    const resident=next.rooms[i]?.resident;
    if(!resident)continue;
    const p=profile(resident)!;
    const happy=residentHappiness(next,resident);
    if(happy>=82 && next.rooms[i]?.decor===p.decor){
      next=event(next,'comfort-'+resident,'story',
        p.zh+'在自己的小窝里露出了笑脸：「这里终于像家一样了！」',
        p.en+' smiles in their favorite room: "This really feels like home."');
    }
    for(let j=i+1;j<6;j++){
      const friend=next.rooms[j]?.resident;
      if(!friend||!adjacent(i,j))continue;
      if(p.likes!==friend && profile(friend)?.likes!==resident)continue;
      const key=[resident,friend].sort().join(':');
      const bonds={...next.bonds,[key]:(next.bonds[key]??0)+1};
      next={...next,bonds};
      if(bonds[key]>=2){
        const other=profile(friend)!;
        next=event(next,'friends-'+key,'story',
          p.zh+'和'+other.zh+'隔着窗台分享了点心。他们决定每天晚上一起看月亮。',
          p.en+' and '+other.en+' shared snacks through the window and now watch the moon together.');
      }
    }
  }
  return next;
};
export function advanceCozy(state:CozyState):CozyState {
  if(state.phase!=='playing')return state;
  const tick=state.tick+1;
  let next={...state,tick};
  if(tick%TICKS_PER_DAY===0){
    const income=dailyRent(next);
    next={...next,coins:next.coins+income,lastIncome:income};
    next=event(next,'rent-'+tick,'rent',
      '清晨的房租到了：+'+income+' 星币。住户越开心，公寓越热闹！',
      'Morning rent: +'+income+' coins. Happy residents help the building thrive!');
    next=dailyStory(next);
    if(tick===TICKS_PER_DAY){
      next={...next,known:[...next.known,'fern-hare']};
      next=event(next,'visitor-fern','arrival',
        '叮咚！蕨尾兔带着一袋种子站在门外：「这里还有能种花的房间吗？」',
        'Ding-dong! Fernhare has arrived with seeds. "Is there room to grow flowers?"');
    }
    if(tick===TICKS_PER_DAY*3){
      next={...next,known:[...next.known,'moon-scout']};
      next=event(next,'visitor-moon','arrival',
        '月影雀来访了：「听说这里有会发光的窗户，我想把故事写下来。」',
        'Moonscout arrives. "I heard your windows glow. I want to write down their stories."');
    }
  }
  if(tick>=MAX_TICKS){
    next={...next,phase:'complete'};
    next=event(next,'finish','story',
      '月光街的第一周结束了。你亲手布置的小楼，已经有了属于自己的故事。',
      'Your first week ends. The little building you decorated has a story of its own.');
  }
  return next;
}
export function cozyGoal(state:CozyState) {
  const guests=occupied(state);
  const happiness=buildingHappiness(state);
  return { guests,happiness,success:guests>=3&&happiness>=70,
    grade:guests>=4&&happiness>=83?'金色月光':guests>=3&&happiness>=70?'温暖小楼':'重新出发' };
}
export function validCozySave(value:unknown):value is CozyState {
  if(!value||typeof value!=='object')return false;
  const s=value as Partial<CozyState>;
  if(s.version!==1 || !['playing','complete'].includes(s.phase??'')
    || !Number.isInteger(s.tick)||typeof s.tick!=='number'||s.tick<0||s.tick>MAX_TICKS
    || !Number.isInteger(s.coins)||typeof s.coins!=='number'||s.coins<0||s.coins>1000000
    || !Array.isArray(s.rooms)||s.rooms.length!==6
    || !Array.isArray(s.known)||!s.known.every(id=>COZY_RESIDENTS.some(r=>r.id===id))
    || !Array.isArray(s.journal)||s.journal.length>18
    || !Array.isArray(s.seen)||s.seen.length>100
    || typeof s.bonds!=='object'||s.bonds===null)return false;
  const housed=new Set<string>();
  for(const room of s.rooms){
    if(room===null)continue;
    if(typeof room!=='object'||!Object.hasOwn(ROOM_DETAILS,room.type)
      ||(room.decor!==null&&!Object.hasOwn(FURNISHINGS,room.decor))
      ||(room.resident!==null&&!COZY_RESIDENTS.some(r=>r.id===room.resident))
      ||(room.resident!==null&&!s.known.includes(room.resident)))return false;
    if(room.resident){if(housed.has(room.resident))return false;housed.add(room.resident);}
  }
  return true;
}
