/** V2 REBOOT — deterministic factory/colony game rules.
 * No DOM, SVG, React or rendering dependency. The PixiJS stage will consume
 * this world snapshot and animate bitmap sprite actors independently. */
export type Craft='well'|'garden'|'kiln';
export type Element='water'|'plant'|'fire';
export type Supply='water'|'fiber'|'core';
export type WorkerId='brook'|'fern'|'cinder';
export type Machine={craft:Craft;worker:WorkerId|null;stored:number};
export type WorkshopOrder={due:number;cores:number;reward:number};
/** Yuesha is an adult witch merchant; her optional request draws from the
 * same real stock as ordinary contracts. Legacy V2 saves omit this field. */
export type PatronStatus='offered'|'active'|'completed'|'missed'|'expired';
export type PatronCommission={
  status:PatronStatus;due:number;cores:number;reward:number;
};
export const PATRON_NAME='月纱';
export const PATRON_ADULT_AGE=28;
export const PATRON_FAILURE_COST=20;
export type DailyProduction={
  water:number;fiber:number;cores:number;blocked:string[];
  fulfilled:boolean;lost:boolean;
};
export type WorkshopState={
  version:2;day:number;coins:number;
  tiles:(Machine|null)[];
  warehouse:{core:number};
  order:WorkshopOrder;
  last:DailyProduction|null;
  completed:number;failed:number;
  patron?:PatronCommission|null;
};
export const WIDTH=5;
export const HEIGHT=3;
export const BOARD_SIZE=WIDTH*HEIGHT;
export const MACHINES:Record<Craft,{cost:number;skill:Element;zh:string;en:string}>={
  well:{cost:22,skill:'water',zh:'水汽泵',en:'Mist pump'},
  garden:{cost:25,skill:'plant',zh:'孢子温室',en:'Spore greenhouse'},
  kiln:{cost:38,skill:'fire',zh:'晶核熔炉',en:'Core kiln'},
};
export const WORKERS:Record<WorkerId,{skill:Element;zh:string;en:string}>={
  brook:{skill:'water',zh:'泉泡',en:'Brook'},
  fern:{skill:'plant',zh:'青枝',en:'Fern'},
  cinder:{skill:'fire',zh:'炽角',en:'Cinder'},
};
const validIndex=(n:number)=>Number.isInteger(n)&&n>=0&&n<BOARD_SIZE;
export const linked=(from:number,to:number):boolean=>
  validIndex(from)&&validIndex(to)&&
  (Math.abs(from-to)===WIDTH||Math.floor(from/WIDTH)===Math.floor(to/WIDTH)
    &&Math.abs(from-to)===1);
export function newWorkshop():WorkshopState {
  const tiles:(Machine|null)[]=Array.from({length:BOARD_SIZE},()=>null);
  tiles[5]={craft:'well',worker:null,stored:0};
  tiles[7]={craft:'garden',worker:null,stored:0};
  return {version:2,day:1,coins:100,tiles,warehouse:{core:0},
    order:{due:5,cores:2,reward:70},last:null,completed:0,failed:0,patron:null};
}
export function placeMachine(s:WorkshopState,index:number,craft:Craft):WorkshopState {
  const item=MACHINES[craft];
  if(!validIndex(index)||s.tiles[index]||!item||s.coins<item.cost)return s;
  const tiles=s.tiles.slice();
  tiles[index]={craft,worker:null,stored:0};
  return {...s,tiles,coins:s.coins-item.cost};
}
export function moveMachine(s:WorkshopState,from:number,to:number):WorkshopState {
  if(!validIndex(from)||!validIndex(to)||!s.tiles[from]||s.tiles[to])return s;
  const tiles=s.tiles.map(t=>t?{...t}:null);
  tiles[to]=tiles[from];tiles[from]=null;
  return {...s,tiles};
}
export function assignWorker(s:WorkshopState,id:WorkerId,index:number):WorkshopState {
  if(!WORKERS[id]||!validIndex(index)||!s.tiles[index])return s;
  const tiles=s.tiles.map(t=>t?{...t,worker:t.worker===id?null:t.worker}:null);
  tiles[index]!.worker=id;
  return {...s,tiles};
}
export function unassignWorker(s:WorkshopState,id:WorkerId):WorkshopState {
  if(!WORKERS[id])return s;
  const tiles=s.tiles.map(t=>t?.worker===id?{...t,worker:null}:t);
  return tiles.every((t,i)=>t===s.tiles[i])?s:{...s,tiles};
}
const expert=(craft:Craft,id:WorkerId|null)=>
  !!id&&MACHINES[craft].skill===WORKERS[id]?.skill;
/** Strict local flow. Material cannot teleport between rooms.
 * A worker's specialty alters throughput, rather than generic happiness.
 * Bottlenecks are inspectable in blocked[] after each shift. */
/** Accept a genuine time-sensitive second contract. Its cores are not minted
 * automatically: both customers require the very same warehouse inventory.
 * There is no paid upgrade, romance click farming, or manufactured bonus.
 */
export function acceptPatronCommission(s:WorkshopState):WorkshopState {
  if(s.patron?.status!=='offered'||s.day>s.patron.due)return s;
  return {...s,patron:{...s.patron,status:'active'}};
}
export function runShift(s:WorkshopState):WorkshopState {
  const tiles=s.tiles.map(t=>t?{...t}:null);
  const report:DailyProduction={water:0,fiber:0,cores:0,blocked:[],fulfilled:false,lost:false};
  // Stage 1: staffed pumps generate water into their own tanks.
  for(let i=0;i<BOARD_SIZE;i++){
    const machine=tiles[i];
    if(machine?.craft!=='well'||!machine.worker)continue;
    const amount=expert('well',machine.worker)?2:1;
    machine.stored+=amount;report.water+=amount;
  }
  // Stage 2: greenhouses must touch pumps, and employ a worker.
  for(let i=0;i<BOARD_SIZE;i++){
    const machine=tiles[i];
    if(machine?.craft!=='garden'||!machine.worker)continue;
    const source=tiles.findIndex((other,j)=>other?.craft==='well'&&
      linked(i,j)&&other.stored>=1);
    if(source<0){report.blocked.push('garden:'+i+':water');continue;}
    tiles[source]!.stored-=1;
    const amount=expert('garden',machine.worker)?2:1;
    machine.stored+=amount;report.fiber+=amount;
  }
  // Stage 3: kilns need two fibers from an adjacent greenhouse.
  for(let i=0;i<BOARD_SIZE;i++){
    const machine=tiles[i];
    if(machine?.craft!=='kiln'||!machine.worker)continue;
    const source=tiles.findIndex((other,j)=>other?.craft==='garden'&&
      linked(i,j)&&other.stored>=2);
    if(source<0){report.blocked.push('kiln:'+i+':fiber');continue;}
    tiles[source]!.stored-=2;
    report.cores+=expert('kiln',machine.worker)?2:1;
  }
  let warehouse=s.warehouse.core+report.cores;
  let coins=s.coins;
  let completed=s.completed,failed=s.failed;
  let order=s.order;
  let patron=s.patron??null;
  if(s.day>=order.due){
    if(warehouse>=order.cores){
      warehouse-=order.cores;coins+=order.reward;
      completed++;report.fulfilled=true;
    }else{
      failed++;coins=Math.max(0,coins-15);report.lost=true;
    }
    order={due:s.day+4,cores:order.cores+1,reward:order.reward+25};
  }
  // The first successful standard order unlocks the adult visiting
  // merchant. Her optional request needs five MORE cores than currently
  // stored, so a player must really operate their production line.
  if(!patron&&report.fulfilled){
    patron={status:'offered',due:s.day+3,cores:warehouse+5,reward:135};
  }
  if(patron&&s.day>=patron.due){
    if(patron.status==='active'){
      if(warehouse>=patron.cores){
        warehouse-=patron.cores;
        coins+=patron.reward;
        patron={...patron,status:'completed'};
      }else{
        coins=Math.max(0,coins-PATRON_FAILURE_COST);
        patron={...patron,status:'missed'};
      }
    }else if(patron.status==='offered'){
      patron={...patron,status:'expired'};
    }
  }
  return {...s,day:s.day+1,coins,tiles,warehouse:{core:warehouse},
    order,completed,failed,last:report,patron};
}
export function validWorkshop(value:unknown):value is WorkshopState {
  if(!value||typeof value!=='object')return false;
  const s=value as Partial<WorkshopState>;
  if(s.version!==2||!Number.isSafeInteger(s.day)||s.day! < 1
      ||!Number.isSafeInteger(s.coins)||s.coins! < 0
      ||!Array.isArray(s.tiles)||s.tiles.length!==BOARD_SIZE
      ||!Number.isSafeInteger(s.warehouse?.core)||s.warehouse!.core<0
      ||!Number.isSafeInteger(s.order?.due)||!Number.isSafeInteger(s.order?.cores)
      ||!Number.isSafeInteger(s.order?.reward)||s.order!.cores<1
      ||!Number.isSafeInteger(s.completed)||s.completed! < 0
      ||!Number.isSafeInteger(s.failed)||s.failed! < 0)return false;
  if(s.patron!==undefined&&s.patron!==null){
    const p=s.patron;
    if(!p||!['offered','active','completed','missed','expired'].includes(p.status)
      ||!Number.isSafeInteger(p.due)||p.due<5||p.due>=s.day+20
      ||!Number.isSafeInteger(p.cores)||p.cores<5
      ||!Number.isSafeInteger(p.reward)||p.reward<=0)return false;
  }
  const staffed=new Set<string>();
  for(const t of s.tiles){
    if(t===null)continue;
    if(!t||!Object.hasOwn(MACHINES,t.craft)||!Number.isSafeInteger(t.stored)
        ||t.stored<0||t.worker!==null&&!Object.hasOwn(WORKERS,t.worker))return false;
    if(t.worker){if(staffed.has(t.worker))return false;staffed.add(t.worker);}
  }
  return true;
}
