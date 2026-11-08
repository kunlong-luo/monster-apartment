import {machineLevel} from './workshop-model';
import type {Craft,Machine,MachineLevel,WorkshopState} from './workshop-model';
import {inspectMachineSignals} from './workshop-machine-status';
import type {MachineVisualSignal} from './workshop-machine-status';

/** Plot index is real V2 machine identity, requiring no schema migration. */
export type WorkshopStationInstance=Readonly<{
  plot:number;machine:Readonly<Machine>;level:MachineLevel;signal:MachineVisualSignal;
}>;
export type WorkshopStationGroup=Readonly<{
  craft:Craft;instances:readonly WorkshopStationInstance[];
  selected:WorkshopStationInstance|null;featured:WorkshopStationInstance|null;
}>;
export type WorkshopStationPresentation=Readonly<{
  byPlot:readonly (WorkshopStationInstance|null)[];
  groups:Readonly<Record<Craft,WorkshopStationGroup>>;
}>;
/** Read-only projection: no settlement, save mutation, or second economy. */
export function presentWorkshopStations(
  world:WorkshopState,selectedPlot:number|null
):WorkshopStationPresentation{
  const signals=inspectMachineSignals(world);
  const lists:Record<Craft,WorkshopStationInstance[]>={well:[],garden:[],kiln:[]};
  const byPlot=world.tiles.map<WorkshopStationInstance|null>((machine,plot)=>{
    if(!machine)return null;
    const instance:WorkshopStationInstance={
      plot,machine,level:machineLevel(machine),signal:signals[plot]!,
    };
    lists[machine.craft].push(instance);
    return instance;
  });
  const makeGroup=(craft:Craft):WorkshopStationGroup=>{
    const instances=lists[craft];
    const selected=instances.find(item=>item.plot===selectedPlot)??null;
    // Feature the most useful real production state, not merely highest Lv.
    // A player's explicitly selected plot always overrides this preference.
    const priority=(item:WorkshopStationInstance)=>
      item.signal.state==='working'?2:item.signal.state==='blocked'?1:0;
    const featured=instances.reduce<WorkshopStationInstance|null>((best,item)=>{
      if(!best)return item;
      const delta=priority(item)-priority(best);
      return delta>0||(delta===0&&item.level>best.level)?item:best;
    },null);
    return {craft,instances,selected,featured:selected??featured};
  };
  return {byPlot,groups:{
    well:makeGroup('well'),garden:makeGroup('garden'),kiln:makeGroup('kiln'),
  }};
}
