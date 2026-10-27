/** Deterministic workshop actions and production settlement.
 * Public compatibility entrypoint: do not break existing save consumers. */
import {
  MACHINES,WORKERS,BOARD_SIZE,validIndex,linked,TOWN_MARKET,TOWN_RESIDENTS,
  PATRON_EXTRA_CORES,PATRON_FAILURE_COST,PATRON_IMPORT_PRICE,
  PREMIUM_EXTRA_CORES,PREMIUM_EXTRA_REWARD,
  PREMIUM_ORDER_PENALTY,STANDARD_ORDER_PENALTY
} from './workshop-model';
import type {
  Craft,WorkerId,Machine,MachineLevel,WorkshopState,DailyProduction
} from './workshop-model';
export * from './workshop-model';
export {workshopHint,workshopNextStep} from './workshop-guidance';
export type {WorkshopHint} from './workshop-guidance';
export {
  buyTownSupply,townMarketAvailable,deliverResidentRequest,
  residentRequestStock,residentRequestAvailable
} from './workshop-town';

const PRICE:Record<Craft,readonly [number,number]>={
  well:[40,88],garden:[48,98],kiln:[60,124],
};
export function machineLevel(machine:Machine|null):MachineLevel {
  return machine?.level??1;
}
export type UpgradeQuote={cost:number;next:2|3;requiresCompleted:number;canUpgrade:boolean};
/** Every upgrade is earned and bought; no automatic stat increases. */
export function machineUpgradeQuote(s:WorkshopState,index:number):UpgradeQuote|null {
  const machine=s.tiles[index];
  if(!machine)return null;
  const level=machineLevel(machine);
  if(level===3)return null;
  const next=(level+1) as 2|3;
  const cost=PRICE[machine.craft][next-2];
  const requiresCompleted=next===2?1:3;
  return {cost,next,requiresCompleted,canUpgrade:s.coins>=cost&&s.completed>=requiresCompleted};
}
export function upgradeMachine(s:WorkshopState,index:number):WorkshopState {
  if(!validIndex(index))return s;
  const quote=machineUpgradeQuote(s,index);
  if(!quote?.canUpgrade)return s;
  const tiles=s.tiles.slice();
  tiles[index]={...tiles[index]!,level:quote.next};
  return {...s,tiles,coins:s.coins-quote.cost};
}
export function workshopRank(completed:number):{level:1|2|3;zh:string;nextGoal:number|null}{
  if(completed>=5)return {level:3,zh:'月光大师工坊',nextGoal:null};
  if(completed>=3)return {level:2,zh:'星匠工坊',nextGoal:5};
  return {level:1,zh:'见习工坊',nextGoal:3};
}
/** A wrong purchase must never permanently strand a save without enough
 * currency to build the core kiln. Salvaging refunds 60% of base machine cost;
 * upgrades, stored water/fiber and the worker assignment are discarded. */
export function machineSalvageRefund(machine:Machine|null):number {
  return machine?Math.floor(MACHINES[machine.craft].cost*3/5):0;
}
export function salvageMachine(s:WorkshopState,index:number):WorkshopState {
  if(!validIndex(index)||!s.tiles[index])return s;
  const refund=machineSalvageRefund(s.tiles[index]);
  if(!Number.isSafeInteger(s.coins+refund))return s;
  const tiles=s.tiles.slice();
  tiles[index]=null;
  return {...s,tiles,coins:s.coins+refund};
}
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
/** Buy one physically stocked core from the visiting merchant.
 * Currency and warehouse change together, and only during the offer.
 * Existing saves need no migration: neither field is new. */
export function importPatronCore(s:WorkshopState):WorkshopState {
  if(!s.patron||!['offered','active'].includes(s.patron.status)
    ||s.day>s.patron.due||s.coins<PATRON_IMPORT_PRICE
    ||s.warehouse.core>=Number.MAX_SAFE_INTEGER)return s;
  return {...s,coins:s.coins-PATRON_IMPORT_PRICE,
    warehouse:{core:s.warehouse.core+1}};
}
/** One-way contract choice: five more cores, 120 higher reward,
 * and a higher failure penalty; standard delivery remains unchanged. */
export function acceptPremiumOrder(s:WorkshopState):WorkshopState {
  if(s.completed<1||s.order.premium||s.day>s.order.due
    ||!Number.isSafeInteger(s.order.cores+PREMIUM_EXTRA_CORES)
    ||!Number.isSafeInteger(s.order.reward+PREMIUM_EXTRA_REWARD))return s;
  return {...s,order:{...s.order,premium:true,
    cores:s.order.cores+PREMIUM_EXTRA_CORES,
    reward:s.order.reward+PREMIUM_EXTRA_REWARD}};
}

export type OrderChoiceForecast={
  standard:'fulfilled'|'missed';premium:'fulfilled'|'missed';
  patronIfPremium:'completed'|'missed'|'other';
};
/** Compare both contracts by running the real shift engine, without
 * touching the current state. Future staffing and placement are fixed. */
export function forecastOrderChoice(s:WorkshopState):OrderChoiceForecast|null {
  if(s.completed<1||s.order.premium||s.day>s.order.due)return null;
  const premium=acceptPremiumOrder(s);
  if(premium===s)return null;
  const project=(initial:WorkshopState):{
    fulfillment:'fulfilled'|'missed';guest:'completed'|'missed'|'other'
  }=>{
    let current=initial;
    for(let i=0;i<16&&current.day<=initial.order.due;i++)
      current=runShift(current);
    return {
      fulfillment:current.last?.fulfilled?'fulfilled':'missed',
      guest:current.patron?.status==='completed'?'completed':
        current.patron?.status==='missed'?'missed':'other',
    };
  };
  const normal=project(s),challenging=project(premium);
  return {
    standard:normal.fulfillment,
    premium:challenging.fulfillment,
    patronIfPremium:challenging.guest,
  };
}

export function runShift(s:WorkshopState):WorkshopState {
  const tiles=s.tiles.map(t=>t?{...t}:null);
  const report:DailyProduction={water:0,fiber:0,cores:0,blocked:[],fulfilled:false,lost:false};
  // Stage 1: staffed pumps generate water into their own tanks.
  for(let i=0;i<BOARD_SIZE;i++){
    const machine=tiles[i];
    if(machine?.craft!=='well'||!machine.worker)continue;
    const amount=(expert('well',machine.worker)?2:1)+machineLevel(machine)-1;
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
    const amount=(expert('garden',machine.worker)?2:1)+machineLevel(machine)-1;
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
    report.cores+=(expert('kiln',machine.worker)?2:1)+machineLevel(machine)-1;
  }
  let warehouse=s.warehouse.core+report.cores;
  let coins=s.coins;
  let completed=s.completed,failed=s.failed;
  let order=s.order;
  let patron=s.patron??null;
  if(s.day>=order.due){
    report.premium=order.premium===true;
    if(warehouse>=order.cores){
      warehouse-=order.cores;coins+=order.reward;
      completed++;report.fulfilled=true;
      if(completed===3||completed===5){
        // Finite campaign milestones, not a repeatable daily currency faucet.
        report.milestone=completed;
        coins+=completed===3?70:160;
      }
    }else{
      failed++;coins=Math.max(0,coins-(order.premium?
        PREMIUM_ORDER_PENALTY:STANDARD_ORDER_PENALTY));report.lost=true;
    }
    // Premium only changes this delivery, not the permanent baseline.
    order={due:s.day+4,
      cores:order.cores+1-(order.premium?PREMIUM_EXTRA_CORES:0),
      reward:order.reward+25-(order.premium?PREMIUM_EXTRA_REWARD:0)};
  }
  // The first successful standard order unlocks the adult visiting
  // merchant. Her request exceeds the starter line's three-day output,
  // requiring a paid upgrade, a productive redesign, or accepted risk.
  if(!patron&&report.fulfilled){
    patron={status:'offered',due:s.day+3,cores:warehouse+PATRON_EXTRA_CORES,reward:135};
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
/** A one-day, side-effect-free production preview. Uses the exact same
 * deterministic engine and does not advance time or write a save. */
export type NextShiftForecast={
  dayAfter:number;water:number;fiber:number;cores:number;blocked:string[];
  warehouseAfter:number;coinsAfter:number;
  willDeliver:boolean;willMiss:boolean;reward:number;
};
export function forecastNextShift(s:WorkshopState):NextShiftForecast {
  const next=runShift(s);
  const report=next.last!;
  return {
    dayAfter:next.day,water:report.water,fiber:report.fiber,cores:report.cores,
    blocked:[...report.blocked],warehouseAfter:next.warehouse.core,
    coinsAfter:next.coins,willDeliver:report.fulfilled,willMiss:report.lost,
    reward:report.fulfilled?s.order.reward:0,
  };
}
/** A side-effect-free what-if forecast; uses the very same shift engine.
 * Results assume today's staffing, layout and equipment stay unchanged. */
export type PatronForecast={
  available:number;required:number;deficit:number;completes:boolean;
  nextNormalOrder:'fulfilled'|'missed'|'pending';
};
export function forecastPatronCommission(s:WorkshopState):PatronForecast|null {
  const contract=s.patron;
  if(!contract||(contract.status!=='offered'&&contract.status!=='active')
    ||s.day>contract.due)return null;
  let future=contract.status==='offered'?acceptPatronCommission(s):s;
  let available=future.warehouse.core;
  let nextNormalOrder:PatronForecast['nextNormalOrder']='pending';
  const normalDue=s.order.due;
  const horizon=Math.max(contract.due,normalDue);
  // Old, hand-edited local saves must not cause enormous forecast loops.
  for(let i=0;i<16&&future.day<=horizon;i++){
    const day=future.day;
    const after=runShift(future);
    if(day===normalDue){
      nextNormalOrder=after.last?.fulfilled?'fulfilled':'missed';
    }
    if(day===contract.due){
      available=after.warehouse.core+
        (after.patron?.status==='completed'?contract.cores:0);
    }
    future=after;
  }
  return {available,required:contract.cores,
    deficit:Math.max(0,contract.cores-available),
    completes:future.patron?.status==='completed',nextNormalOrder};
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
      ||(s.order?.premium!==undefined&&s.order.premium!==true)
      ||!Number.isSafeInteger(s.completed)||s.completed! < 0
      ||!Number.isSafeInteger(s.failed)||s.failed! < 0)return false;
  if(s.market!==undefined){
    if(!s.market||!Number.isSafeInteger(s.market.day)
      ||s.market.day<1||s.market.day>s.day!
      ||(!Object.hasOwn(TOWN_MARKET,s.market.kind)
        &&!Object.hasOwn(TOWN_RESIDENTS,s.market.kind)))return false;
  }
  if(s.residentsHelped!==undefined&&(!Number.isSafeInteger(s.residentsHelped)
    ||s.residentsHelped<0||s.residentsHelped>s.day!))return false;
  if(s.patron!==undefined&&s.patron!==null){
    const p=s.patron;
    if(!p||!['offered','active','completed','missed','expired'].includes(p.status)
      ||!Number.isSafeInteger(p.due)||p.due<5||p.due>=(s.day??0)+20
      ||!Number.isSafeInteger(p.cores)||p.cores<5
      ||!Number.isSafeInteger(p.reward)||p.reward<=0)return false;
  }
  const staffed=new Set<string>();
  for(const t of s.tiles){
    if(t===null)continue;
    if(!t||!Object.hasOwn(MACHINES,t.craft)||!Number.isSafeInteger(t.stored)
        ||t.stored<0||t.worker!==null&&!Object.hasOwn(WORKERS,t.worker)
        ||t.level!==undefined&&t.level!==2&&t.level!==3)return false;
    if(t.worker){if(staffed.has(t.worker))return false;staffed.add(t.worker);}
  }
  return true;
}
