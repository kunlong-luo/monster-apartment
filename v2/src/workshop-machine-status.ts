import {forecastNextShift} from './workshop-engine';
import type {Craft,WorkshopState} from './workshop-engine';

export type MachineVisualState='idle'|'working'|'blocked';
export type MachineVisualSignal={
  state:MachineVisualState;
  /** Pure preview only: no advances, economy writes or RNG. */
  problem:'water'|'fiber'|null;
};

/** Derive animation states from exactly the same deterministic shift rules
 * that settle currency and stock. Display never guesses physical flow. */
export function inspectMachineSignals(s:WorkshopState):Array<MachineVisualSignal|null>{
  const preview=forecastNextShift(s);
  const blocked=new Map<number,{craft:Craft;problem:'water'|'fiber'}>();
  for(const entry of preview.blocked){
    const [craft,rawIndex,reason]=entry.split(':');
    const index=Number(rawIndex);
    if((craft==='garden'||craft==='kiln')
      &&Number.isInteger(index)
      &&(reason==='water'||reason==='fiber')){
      blocked.set(index,{craft,problem:reason});
    }
  }
  return s.tiles.map<MachineVisualSignal|null>((machine,index)=>{
    if(!machine)return null;
    if(!machine.worker)return {state:'idle',problem:null};
    const issue=blocked.get(index);
    return issue&&issue.craft===machine.craft
      ?{state:'blocked',problem:issue.problem}
      :{state:'working',problem:null};
  });
}
