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
export const MAX_TICKS = DAYS_TO_OPEN * TICKS_PER_DAY; // opening chapter, not a hard game-over
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
  const keys=[...state.seen,key];
  const permanent=keys.filter(item=>item.startsWith('commission-award-'));
  const recent=keys.filter(item=>!item.startsWith('commission-award-')).slice(-(100-permanent.length));
  return {...state,seen:[...permanent,...recent],
    journal:[...state.journal,{key,tick:state.tick,kind,zh,en}].slice(-18)};
};
export const cozyDay = (tick:number):number=>Math.floor(tick/TICKS_PER_DAY)+1;

/** A terminal V1 save ended after eight days. Preserve its rooms, currency,
 * neighbors and journal, while allowing its owner to keep playing. */
export const resumeCozySave=(state:CozyState):CozyState=>
  state.phase==='complete'?{...state,phase:'playing'}:state;

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
/** Residents form a household, not six isolated rent-generating tiles.
 * Baths share quiet reading time; planted greenhouses refresh their neighbors.
 * Friendship comfort must be earned through real visits (dailyStory) and still
 * requires proximity. All values are derived from existing V1 saved fields. */
export function cozyNeighborhood(state:CozyState,id:SpiritId){
  const home=state.rooms.findIndex(room=>room?.resident===id);
  if(home===-1)return {care:0,friendship:0,total:0};
  const me=profile(id);
  let care=0,friendship=0;
  for(let i=0;i<state.rooms.length;i++){
    const neighbor=state.rooms[i];
    if(i===home||!neighbor?.resident||!adjacent(home,i))continue;
    if(neighbor.type==='greenhouse')care+=neighbor.decor==='plant'?4:1;
    if(neighbor.type==='bath')care+=neighbor.decor==='books'?4:1;
    const liked=me?.likes===neighbor.resident
      ||profile(neighbor.resident)?.likes===id;
    if(liked){
      const key=[id,neighbor.resident].sort().join(':');
      const level=state.bonds[key]??0;
      if(Number.isFinite(level)&&level>0)friendship+=2*Math.min(3,Math.floor(level));
    }
  }
  return {care,friendship,total:care+friendship};
}

export type CozyWishKind='rest'|'inspiration'|'company';
export type CozyResidentWish={
  kind:CozyWishKind;met:boolean;effect:number;
  zh:string;en:string;hintZh:string;hintEn:string;
};
/** After the opening chapter, a resident develops one wish for each
 * three-day season. Wishes are deterministic per resident and day.
 * No timers, randomness, or new fields are written to the V1 save. */
export function cozyResidentWish(state:CozyState,id:SpiritId):CozyResidentWish|null {
  if(state.tick<=MAX_TICKS)return null;
  const index=COZY_RESIDENTS.findIndex(r=>r.id===id);
  const home=state.rooms.findIndex(room=>room?.resident===id);
  if(index<0||home<0)return null;
  const room=state.rooms[home]!;
  const season=Math.floor((state.tick-MAX_TICKS)/(3*TICKS_PER_DAY));
  const kind=(['rest','inspiration','company'] as const)[(season+index)%3];
  let met=false;
  if(kind==='rest')met=room.type==='nest'||room.type==='bath'||room.decor==='books';
  if(kind==='inspiration')met=room.type==='workshop'||room.type==='greenhouse'||room.decor==='lamp';
  if(kind==='company')met=state.rooms.some((neighbor,i)=>{
    if(!neighbor?.resident||!adjacent(home,i))return false;
    const other=neighbor.resident;
    const likes=profile(id)?.likes===other||profile(other)?.likes===id;
    const key=[id,other].sort().join(':');
    return likes&&(state.bonds[key]??0)>=1;
  });
  const descriptions:Record<CozyWishKind,{zh:string;en:string;hintZh:string;hintEn:string}>={
    rest:{zh:'想安静休息',en:'A little quiet',
      hintZh:'住卧室或浴室，或摆放故事书',hintEn:'Live in a bedroom or bath, or add storybooks'},
    inspiration:{zh:'想有灵感',en:'A spark of inspiration',
      hintZh:'住工坊或花房，或摆放萤灯',hintEn:'Live in a workshop or garden, or add a lamp'},
    company:{zh:'想见好朋友',en:'A familiar friend',
      hintZh:'和有羁绊的喜欢的邻居住近些',hintEn:'Live beside a loved neighbor after a real visit'},
  };
  return {kind,met,effect:met?12:-4,...descriptions[kind]};
}

/** The opening chapter teaches housing. Later chapters carry one authored
 * resident's request. All steps are recomputed from real rooms and earned bonds;
 * no phantom progress meter or new V1 save field is needed. */
export type CozyCommissionId='teatime'|'lanterns'|'garden'|'stories';
export type CozyCommissionStep={id:'home'|'decor'|'friend';zh:string;en:string;done:boolean};
export type CozyCommission={
  chapter:number;id:CozyCommissionId;resident:SpiritId;
  zh:string;en:string;storyZh:string;storyEn:string;
  steps:CozyCommissionStep[];completed:number;required:number;ready:boolean;
  earned:boolean;award:number;
};
const COMMISSION_SERIES:readonly {
  id:CozyCommissionId;resident:SpiritId;home:HomeType;decor:Furnishing;friend:SpiritId;
  zh:string;en:string;storyZh:string;storyEn:string;
}[]=[
  {id:'teatime',resident:'dewdrop',home:'bath',decor:'books',friend:'seedling',
    zh:'露珠灵的睡前读书会',en:"Dewdrop's Story Hour",
    storyZh:'露珠灵想在暖暖的浴室里和芽核交换故事。',storyEn:'Dewdrop wants to share stories with Seedcore in the warm bath.'},
  {id:'lanterns',resident:'lantern-beetle',home:'workshop',decor:'lamp',friend:'dewdrop',
    zh:'灯甲虫的夜光修理铺',en:"Lanternbeetle's Night Workshop",
    storyZh:'灯甲虫想修好整条街的灯，也希望露珠灵来看看。',storyEn:'Lanternbeetle wants to mend street lamps with a friendly visit from Dewdrop.'},
  {id:'garden',resident:'fern-hare',home:'greenhouse',decor:'plant',friend:'seedling',
    zh:'蕨尾兔的窗边种子会',en:"Fernhare's Window Garden",
    storyZh:'蕨尾兔想让芽核看到第一批开花的种子。',storyEn:'Fernhare hopes Seedcore will see the first seeds bloom.'},
  {id:'stories',resident:'moon-scout',home:'workshop',decor:'books',friend:'lantern-beetle',
    zh:'月影雀的月下故事集',en:"Moonscout's Moonlit Stories",
    storyZh:'月影雀要在工作室记下灯甲虫的夜班故事。',storyEn:'Moonscout wants to record Lanternbeetle’s night-shift tales.'},
];
const commissionAwardKey=(id:CozyCommissionId)=>'commission-award-'+id;
export function cozyReputation(state:CozyState):number {
  return COMMISSION_SERIES.reduce((sum,item)=>
    sum+Number(state.seen.includes(commissionAwardKey(item.id))),0);
}
export function cozyCommission(state:CozyState,chapter=Math.floor(state.tick/MAX_TICKS)+1):CozyCommission|null {
  if(!Number.isSafeInteger(chapter)||chapter<2)return null;
  const entry=COMMISSION_SERIES[(chapter-2)%COMMISSION_SERIES.length];
  const i=state.rooms.findIndex(room=>room?.resident===entry.resident);
  const room=i>=0?state.rooms[i]:null;
  const friendIndex=state.rooms.findIndex(room=>room?.resident===entry.friend);
  const key=[entry.resident,entry.friend].sort().join(':');
  const bond=state.bonds[key]??0;
  const together=i>=0&&friendIndex>=0&&adjacent(i,friendIndex)
    &&Number.isFinite(bond)&&bond>=1;
  const steps:CozyCommissionStep[]=[
    {id:'home',zh:'住在'+ROOM_DETAILS[entry.home].zh,
      en:'Live in '+ROOM_DETAILS[entry.home].en,done:room?.type===entry.home},
    {id:'decor',zh:'房间摆上'+FURNISHINGS[entry.decor].zh,
      en:'Place '+FURNISHINGS[entry.decor].en,done:room?.decor===entry.decor},
    {id:'friend',zh:'与'+(profile(entry.friend)?.zh??'朋友')+'相邻并建立羁绊',
      en:'Visit and bond with '+(profile(entry.friend)?.en??'a friend')+' next door',
      done:together},
  ];
  const completed=steps.filter(step=>step.done).length;
  const earned=state.seen.includes(commissionAwardKey(entry.id));
  return {...entry,chapter,steps,completed,required:steps.length,
    ready:completed===steps.length,earned,award:earned?10:24};
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
  value+=cozyNeighborhood(state,id).total;
  value+=cozyResidentWish(state,id)?.effect??0;
  return Math.max(10,Math.min(100,value));
}
export const buildingHappiness=(state:CozyState):number=>{
  const members=state.rooms.flatMap(room=>room?.resident?[room.resident]:[]);
  return members.length?Math.round(members.reduce((n,id)=>n+residentHappiness(state,id),0)/members.length):0;
};
export const dailyRent=(state:CozyState):number =>
  state.rooms.reduce((sum,room)=>room?.resident?sum+4+Math.floor(residentHappiness(state,room.resident)/12):sum,0);
/** The daily economy makes the type and furnishing of an OCCUPIED room
 * matter after move-in, while rent still depends on resident happiness.
 * Workshop crafts, garden harvests and friendship gifts are distinct, capped
 * integer flows that use no new currency or save fields. */
export function cozyDailyIncome(state:CozyState){
  const rent=dailyRent(state);
  let craft=0;
  for(const room of state.rooms){
    if(!room?.resident)continue;
    if(room.type==='workshop')craft+=3+(room.decor==='lamp'?2:0);
    if(room.type==='greenhouse')craft+=1+(room.decor==='plant'?2:0);
  }
  let gifts=0;
  for(let i=0;i<state.rooms.length;i++){
    const left=state.rooms[i]?.resident;
    if(!left)continue;
    for(let j=i+1;j<state.rooms.length;j++){
      const right=state.rooms[j]?.resident;
      if(!right||!adjacent(i,j))continue;
      const key=[left,right].sort().join(':');
      const level=state.bonds[key]??0;
      const liked=profile(left)?.likes===right||profile(right)?.likes===left;
      if(liked&&Number.isFinite(level)&&level>=2)gifts+=2;
    }
  }
  const patrons=cozyReputation(state);
  return {rent,craft,gifts,patrons,total:rent+craft+gifts+patrons};
}

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
/** Move a resident into another built room, exchanging occupants if necessary.
 * Room furnishings stay put, so comfort, rent and friendships change together. */
export function relocateCozyResident(state:CozyState,from:number,to:number):CozyState {
  if(state.phase!=='playing'||!Number.isInteger(from)||!Number.isInteger(to)
    ||from<0||to<0||from>=state.rooms.length||to>=state.rooms.length
    ||from===to||!state.rooms[from]?.resident||!state.rooms[to])return state;
  const rooms=state.rooms.map(room=>room?{...room}:null);
  const mover=rooms[from]!.resident!;
  const displaced=rooms[to]!.resident;
  rooms[from]!.resident=displaced;
  rooms[to]!.resident=mover;
  const moved=profile(mover);
  const guest=displaced?profile(displaced):null;
  return event({...state,rooms},'rehouse-'+state.tick+'-'+from+'-'+to,'move',
    (moved?.zh??'住户')+'搬到了'+ROOM_DETAILS[rooms[to]!.type].zh+
      (guest?'，和'+guest.zh+'交换了房间。':'，还在慢慢适应新家的味道。'),
    (moved?.en??'A resident')+' moved to the '+ROOM_DETAILS[rooms[to]!.type].en+
      (guest?', swapping homes with '+guest.en+'.':', settling into a new home.'));
}
export function previewCozyRelocation(state:CozyState,from:number,to:number){
  const next=relocateCozyResident(state,from,to);
  if(next===state)return null;
  return { happiness:buildingHappiness(next)-buildingHappiness(state),
    rent:cozyDailyIncome(next).total-cozyDailyIncome(state).total,
    moving:state.rooms[from]!.resident!,
    displaced:state.rooms[to]!.resident };
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
/** A visit only happens when two actual occupants are close enough for a short trip.
 * It is an observable part of their routines, not a separate player action. */
export type CozyVisit={from:number;to:number;visitor:SpiritId;host:SpiritId};
export function cozyVisits(state:CozyState,tick=state.tick):CozyVisit[]{
  const visits:CozyVisit[]=[];
  for(let from=0;from<state.rooms.length;from++){
    const visitor=state.rooms[from]?.resident;
    if(!visitor||residentActivity(tick,visitor)!=='visit')continue;
    const traits=profile(visitor);
    const neighbors=state.rooms.map((room,to)=>({room,to}))
      .filter(({room,to})=>room?.resident&&to!==from&&adjacent(from,to))
      .sort((a,b)=>{
        const aLoved=Number(a.room?.resident===traits?.likes||profile(a.room!.resident!)?.likes===visitor);
        const bLoved=Number(b.room?.resident===traits?.likes||profile(b.room!.resident!)?.likes===visitor);
        return bLoved-aLoved||a.to-b.to;
      });
    const chosen=neighbors[0];
    if(chosen?.room?.resident)visits.push({from,to:chosen.to,visitor,host:chosen.room.resident});
  }
  return visits;
}
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
      // A bond grows only if the pair was able to visit during this day.
      const met=Array.from({length:TICKS_PER_DAY},(_,offset)=>next.tick-TICKS_PER_DAY+offset)
        .some(hour=>cozyVisits(next,hour).some(visit=>
          (visit.visitor===resident && visit.host===friend)||
          (visit.visitor===friend && visit.host===resident)));
      if(!met)continue;
      const key=[resident,friend].sort().join(':');
      const bonds={...next.bonds,[key]:Math.min(3,(next.bonds[key]??0)+1)};
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
  if(state.phase!=='playing'||state.tick>=Number.MAX_SAFE_INTEGER-2)return state;
  const tick=state.tick+1;
  let next={...state,tick};
  if(tick%TICKS_PER_DAY===0){
    const income=cozyDailyIncome(next);
    next={...next,coins:next.coins+income.total,lastIncome:income.total};
    const breakdownZh=income.craft||income.gifts||income.patrons
      ?'（房租 '+income.rent+' · 日常制作 '+income.craft+' · 邻里赠礼 '+income.gifts+' · 街区口碑 '+income.patrons+'）':'';
    const breakdownEn=income.craft||income.gifts||income.patrons
      ?' (rent '+income.rent+' · daily craft '+income.craft+' · neighbor gifts '+income.gifts+' · patrons '+income.patrons+')':'';
    next=event(next,'rent-'+tick,'rent',
      '清晨的公寓收入：+'+income.total+' 星币'+breakdownZh+'。',
      'Morning apartment income: +'+income.total+' coins'+breakdownEn+'.');
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
  if(tick>=MAX_TICKS && tick%MAX_TICKS===0){
    const chapter=Math.floor(tick/MAX_TICKS);
    const goal=cozyGoal(next);
    const prize=goal.success?18:6;
    next={...next,coins:next.coins+prize};
    next=event(next,'chapter-'+chapter,'story',
      '月光街第 '+chapter+' 期生活纪念：'+(goal.success?'住户们一起庆祝了温暖的小楼！':'公寓有了新的开始，继续照顾住户的心愿吧。')+
        ' 奖励 +'+prize+' 星币，下一期生活继续。',
      'Moonlight Street chapter '+chapter+': '+(goal.success?'The neighbors celebrate their cozy home!':'A new chapter begins. Keep caring for the neighbors.')+
        ' +'+prize+' coins. Life continues.');
    if(chapter>=2){
      const mission=cozyCommission(next,chapter);
      if(mission){
        if(mission.ready){
          next={...next,coins:next.coins+mission.award,
            seen:mission.earned?next.seen:[...next.seen,commissionAwardKey(mission.id)]};
          next=event(next,'commission-close-'+chapter,'story',
            mission.zh+'圆满完成！+'+mission.award+' 星币。'+
              (mission.earned?'邻居们再次欢聚。':'街区口碑提升，日常赞助永久 +1 星币！'),
            mission.en+' completed! +'+mission.award+' coins. '+
              (mission.earned?'The neighbors gather again.':'Neighborhood patrons now contribute +1 coin per day!'));
        }else{
          const missing=mission.steps.filter(step=>!step.done).map(step=>step.zh).join('、');
          const missingEn=mission.steps.filter(step=>!step.done).map(step=>step.en).join(', ');
          next=event(next,'commission-close-'+chapter,'story',
            mission.zh+'这一期没能完成（还缺：'+missing+'）。下次还可以再试。',
            mission.en+' was not finished (still needed: '+missingEn+'). A new chance will come.');
        }
      }
    }
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
    || !Number.isSafeInteger(s.tick)||typeof s.tick!=='number'||s.tick<0
    || !Number.isSafeInteger(s.coins)||typeof s.coins!=='number'||s.coins<0
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
