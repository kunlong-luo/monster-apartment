import {MACHINES,workshopHint} from './workshop-engine';
import type {WorkshopState} from './workshop-engine';
import {inspectMachineSignals} from './workshop-machine-status';
import {projectedSupplyTrails} from './workshop-machine-presentation';
import type {MachineVisualSignal} from './workshop-machine-status';

/** UI-only inventory caption: no settlement, economy, or save operation. */
export function workshopMachineCaption(
  craft:keyof typeof MACHINES,stored:number,signal:MachineVisualSignal
):string{
  const status=signal.state==='idle'?'待派工':
    signal.state==='blocked'
      ?'缺'+(signal.problem==='water'?'水汽':'孢子')
      :'可生产';
  return MACHINES[craft].zh+' · '+stored+' · '+status;
}

/** In-place label updates are safe ONLY when all painted geometry, machine
 * states, flow trajectories and tutorial/patron layers remain identical.
 * Null means full repaint; [] means no visible scene changes at all. */
export function workshopStageStockPatch(
  before:WorkshopState,after:WorkshopState
):readonly number[]|null{
  if(before===after)return [];
  if(before.day!==after.day||
     before.completed!==after.completed||
     before.failed!==after.failed||
     JSON.stringify(before.order)!==JSON.stringify(after.order)||
     JSON.stringify(before.last)!==JSON.stringify(after.last)||
     JSON.stringify(before.patron)!==JSON.stringify(after.patron)||
     JSON.stringify(workshopHint(before))!==JSON.stringify(workshopHint(after))||
     JSON.stringify(projectedSupplyTrails(before))!==
       JSON.stringify(projectedSupplyTrails(after)))return null;
  if(before.tiles.length!==after.tiles.length)return null;
  const oldSignals=inspectMachineSignals(before);
  const newSignals=inspectMachineSignals(after);
  const stockChanged:number[]=[];
  for(let index=0;index<after.tiles.length;index++){
    const oldMachine=before.tiles[index],nextMachine=after.tiles[index];
    if(Boolean(oldMachine)!==Boolean(nextMachine))return null;
    if(!oldMachine||!nextMachine)continue;
    const oldSignal=oldSignals[index],nextSignal=newSignals[index];
    if(oldMachine.craft!==nextMachine.craft||
       oldMachine.worker!==nextMachine.worker||
       (oldMachine.level??1)!==(nextMachine.level??1)||
       oldSignal?.state!==nextSignal?.state||
       oldSignal?.problem!==nextSignal?.problem)return null;
    if(oldMachine.stored!==nextMachine.stored)stockChanged.push(index);
  }
  return stockChanged;
}
