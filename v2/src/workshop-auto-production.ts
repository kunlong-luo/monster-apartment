/** Realtime, capped physical production with separately OPTED-IN contract
 * calendar. Equipment cycles never advance the day, award order currency or
 * re-run a manual shift. Only the player-enabled safe calendar tick settles
 * a due order from REAL stock, using shared contract rules without factory
 * projection. All timestamps and stock remain in the same locked V2 save. */
import {autoAssignWorkers} from './workshop-engine';
import {advanceSafeAutoContractDay,projectMachineProduction} from './workshop-production';
import {BOARD_SIZE,machineLevel} from './workshop-model';
import type {Craft,WorkshopState,WorkshopAutoClock} from './workshop-model';

export const AUTO_PERIOD_MS:Readonly<Record<Craft,number>>={
  well:30000,garden:45000,kiln:60000,
};
export const MAX_AUTO_CATCHUP_MS=8*60*60*1000;
/** Only an explicit second opt-in advances contract days. The offline catchup
 * can apply at most four calendar days; factory catchup remains capped at 8h.
 * Calendar progression uses the existing contract settlement exactly once. */
export const AUTO_CONTRACT_DAY_MS=4*60*1000;
export const MAX_AUTO_CATCHUP_DAYS=4;
export const AUTO_STORAGE_CAPS={water:36,fiber:36,cores:80} as const;
const MAX_EVENTS=4000;

export function workshopAutoLayout(world:WorkshopState):string{
  return world.tiles.map(machine=>machine
    ?[machine.craft,machine.worker??'-',machineLevel(machine)].join(':'):'-').join('|');
}

function dueAfter(world:WorkshopState,now:number):number[]{
  return world.tiles.map(tile=>tile?.worker?now+AUTO_PERIOD_MS[tile.craft]:0);
}
function safeTime(now:number):boolean{
  return Number.isSafeInteger(now)&&now>=0;
}
export function startWorkshopAuto(world:WorkshopState,now:number):WorkshopState{
  if(!safeTime(now))return world;
  const prepared=autoAssignWorkers(world);
  if(!prepared.tiles.some(tile=>tile?.worker))return world;
  if(prepared.auto?.enabled)return prepared;
  const next:WorkshopAutoClock={
    version:1,enabled:true,lastSimulatedAt:now,
    layout:workshopAutoLayout(prepared),nextDue:dueAfter(prepared,now),
    produced:prepared.auto?.produced??{water:0,fiber:0,cores:0},
    autoDeliver:prepared.auto?.autoDeliver===true,
    nextContractAt:prepared.auto?.autoDeliver?now+AUTO_CONTRACT_DAY_MS:0,
  };
  return {...prepared,auto:next};
}
export function pauseWorkshopAuto(world:WorkshopState):WorkshopState{
  return world.auto?.enabled?{...world,auto:{
    ...world.auto,enabled:false,nextContractAt:0
  }}:world;
}
/** Contract automation is separately opt-in, with no hidden day progression
 * for legacy V2 saves. Toggling it neither delivers an order nor awards
 * currency immediately; a real future timestamp must elapse first. */
export function toggleWorkshopAutoDelivery(world:WorkshopState,now:number):WorkshopState{
  if(!world.auto?.enabled||!safeTime(now))return world;
  const on=world.auto.autoDeliver!==true;
  return {...world,auto:{...world.auto,autoDeliver:on,
    nextContractAt:on?now+AUTO_CONTRACT_DAY_MS:0}};
}

/** Simulate each individual staffed machine at its own finish time.
 * Respect the V2 physical projector's adjacency and storage consumption.
 * Blocked/full machines still move to the NEXT cycle; no "owed output"
 * can be cashed in after material arrives. Event order is stable. */
export function simulateWorkshopAutoUntil(world:WorkshopState,now:number):WorkshopState{
  const prior=world.auto;
  if(!prior?.enabled||!safeTime(now)||now<=prior.lastSimulatedAt)return world;
  const layout=workshopAutoLayout(world);
  if(prior.layout!==layout){
    return {...world,auto:{...prior,lastSimulatedAt:now,layout,
      nextDue:dueAfter(world,now),
      nextContractAt:prior.autoDeliver?now+AUTO_CONTRACT_DAY_MS:0}};
  }
  const from=Math.max(prior.lastSimulatedAt,now-MAX_AUTO_CATCHUP_MS);
  const nextDue=prior.nextDue.map((due,index)=>{
    if(!due||!world.tiles[index]?.worker)return 0;
    return due<=from?from+AUTO_PERIOD_MS[world.tiles[index]!.craft]:due;
  });
  let current=world;
  const produced={...prior.produced};
  let nextContractAt=prior.autoDeliver
    ?(prior.nextContractAt&&prior.nextContractAt>from
      ?prior.nextContractAt:from+AUTO_CONTRACT_DAY_MS):0;
  let daysAdvanced=0;
  let processed=0;
  while(processed<MAX_EVENTS){
    let index=-1,finish=Infinity;
    for(let i=0;i<BOARD_SIZE;i++){
      const at=nextDue[i];
      if(at&&at<=now&&(at<finish||at===finish&&i<index)){
        index=i;finish=at;
      }
    }
    // Run machinery first at an identical timestamp, so arriving kiln
    // stock is eligible for the due contract that same minute.
    if(nextContractAt>0&&nextContractAt<=now&&nextContractAt<finish){
      const next=advanceSafeAutoContractDay(current);
      if(next!==current)daysAdvanced++;
      current=next;
      nextContractAt+=AUTO_CONTRACT_DAY_MS;
      processed++;
      // No unbounded offline order/currency advancement. Continue catching
      // up physical machinery, and resume calendar ticks in real time.
      if(daysAdvanced>=MAX_AUTO_CATCHUP_DAYS)
        nextContractAt=now+AUTO_CONTRACT_DAY_MS;
      continue;
    }
    if(index===-1)break;
    const machine=current.tiles[index]!;
    nextDue[index]+=AUTO_PERIOD_MS[machine.craft];
    processed++;
    // Restrict the existing deterministic physical projector to the one
    // finishing machine; every OTHER machine is merely an input tank.
    const isolated=current.tiles.map((tile,i)=>
      tile&&i!==index?{...tile,worker:null}:tile);
    const projection=projectMachineProduction({...current,tiles:isolated});
    const cycle=projection.cycles.find(c=>c.index===index);
    if(!cycle||cycle.amount<=0)continue;
    const stock=projection.tiles[index]?.stored??0;
    if(machine.craft==='well'&&stock>AUTO_STORAGE_CAPS.water)continue;
    if(machine.craft==='garden'&&stock>AUTO_STORAGE_CAPS.fiber)continue;
    if(machine.craft==='kiln'&&current.warehouse.core+cycle.amount>AUTO_STORAGE_CAPS.cores)continue;
    const tiles=projection.tiles.map((tile,i)=>tile
      ?{...tile,worker:current.tiles[i]?.worker??null}:null);
    const category=machine.craft==='well'?'water':machine.craft==='garden'?'fiber':'cores';
    produced[category]+=cycle.amount;
    current={...current,tiles,warehouse:{core:current.warehouse.core+projection.report.cores}};
  }
  // The cap bounds offline recovery, even after long browser closures.
  // If an unexpected clock causes the loop bound, advance its due date.
  if(processed===MAX_EVENTS)
    for(let i=0;i<BOARD_SIZE;i++)if(nextDue[i]&&nextDue[i]<=now)
      nextDue[i]=now+AUTO_PERIOD_MS[current.tiles[i]!.craft];
  if(processed===0&&nextDue.every((due,i)=>due===prior.nextDue[i])
      &&nextContractAt===(prior.nextContractAt??0))return world;
  return {...current,auto:{...prior,lastSimulatedAt:now,nextDue,produced,
    nextContractAt}};
}
