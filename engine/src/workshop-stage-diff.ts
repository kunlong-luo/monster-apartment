import {MACHINES,linked,workshopHint} from './workshop-engine';
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

export type WorkshopStagePlotPatch=Readonly<{
  /** Redraw only these machine/worker/effect groups. */
  rebuildPlots:readonly number[];
  /** Mutate Text for these stock-only changes. */
  stockPlots:readonly number[];
}>;

/** Decorative pipes connect adjacent *types*, even without a worker.
 * The live supply trail alone would miss an idle pipe being created. */
function pipeTopology(world:WorkshopState):string{
  const paths:string[]=[];
  for(let i=0;i<world.tiles.length;i++){
    const first=world.tiles[i];if(!first)continue;
    for(let j=i+1;j<world.tiles.length;j++){
      const second=world.tiles[j];if(!second||!linked(i,j))continue;
      const water=(first.craft==='well'&&second.craft==='garden')||
        (first.craft==='garden'&&second.craft==='well');
      const fiber=(first.craft==='garden'&&second.craft==='kiln')||
        (first.craft==='kiln'&&second.craft==='garden');
      if(water||fiber)paths.push(i+':'+j+':'+(water?'water':'fiber'));
    }
  }
  return paths.join(';');
}

/** Safe partial Pixi scene reconciliation. Global tutorial, routes, orders,
 * visiting character and settlement effects keep the full-paint fallback. */
export function workshopStagePlotPatch(
  before:WorkshopState,after:WorkshopState
):WorkshopStagePlotPatch|null{
  if(before===after)return {rebuildPlots:[],stockPlots:[]};
  if(before.day!==after.day||
     before.completed!==after.completed||
     before.failed!==after.failed||
     JSON.stringify(before.order)!==JSON.stringify(after.order)||
     JSON.stringify(before.last)!==JSON.stringify(after.last)||
     JSON.stringify(before.patron)!==JSON.stringify(after.patron)||
     JSON.stringify(workshopHint(before))!==JSON.stringify(workshopHint(after))||
     pipeTopology(before)!==pipeTopology(after)||
     JSON.stringify(projectedSupplyTrails(before))!==
       JSON.stringify(projectedSupplyTrails(after)))return null;
  if(before.tiles.length!==after.tiles.length)return null;
  const oldSignals=inspectMachineSignals(before);
  const newSignals=inspectMachineSignals(after);
  const rebuildPlots:number[]=[];
  const stockPlots:number[]=[];
  for(let index=0;index<after.tiles.length;index++){
    const oldMachine=before.tiles[index],nextMachine=after.tiles[index];
    if(Boolean(oldMachine)!==Boolean(nextMachine)){
      rebuildPlots.push(index);continue;
    }
    if(!oldMachine||!nextMachine)continue;
    const oldSignal=oldSignals[index],nextSignal=newSignals[index];
    if(oldMachine.craft!==nextMachine.craft||
       oldMachine.worker!==nextMachine.worker||
       (oldMachine.level??1)!==(nextMachine.level??1)||
       oldSignal?.state!==nextSignal?.state||
       oldSignal?.problem!==nextSignal?.problem){
      rebuildPlots.push(index);continue;
    }
    if(oldMachine.stored!==nextMachine.stored)stockPlots.push(index);
  }
  return {rebuildPlots,stockPlots};
}

/** R07 compatibility: callers that can update only Text must fall back to
 * a full rebuild for any changed machine sprite. */
export function workshopStageStockPatch(
  before:WorkshopState,after:WorkshopState
):readonly number[]|null{
  const patch=workshopStagePlotPatch(before,after);
  return patch&&patch.rebuildPlots.length===0?patch.stockPlots:null;
}
