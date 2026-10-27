/** One deterministic day: physical water → spores → cores,
 * deadline settlement, and patron contract settlement.
 * This is a domain-only module: no DOM, browser storage or UI imports. */
import {
  BOARD_SIZE,MACHINES,WORKERS,linked,machineLevel,
  PATRON_EXTRA_CORES,PATRON_FAILURE_COST,
  PREMIUM_EXTRA_CORES,PREMIUM_EXTRA_REWARD,
  STANDARD_ORDER_PENALTY,PREMIUM_ORDER_PENALTY
} from './workshop-model';
import type {WorkshopState,DailyProduction,Craft,WorkerId} from './workshop-model';

const expert=(craft:Craft,id:WorkerId|null)=>
  !!id&&MACHINES[craft].skill===WORKERS[id]?.skill;
/** Strict local flow. Material cannot teleport between rooms.
 * A worker's specialty changes throughput. Bottlenecks are inspectable
 * in the shift report's blocked[] entries. */
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
