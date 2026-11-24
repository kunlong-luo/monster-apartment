import {projectMachineProduction} from './workshop-production';
import type {WorkshopState} from './workshop-engine';

export type MachineVisualState='idle'|'working'|'blocked';
export type MachineVisualSignal={
  state:MachineVisualState;
  /** Pure preview only: no advances, economy writes or RNG. */
  problem:'water'|'fiber'|null;
};

/** One immutable production projection drives both the saved shift and Pixi.
 * No second forecast algorithm or cosmetic guesses about supply availability. */
export function inspectMachineSignals(s:WorkshopState):Array<MachineVisualSignal|null>{
  const {cycles}=projectMachineProduction(s);
  const blocked=new Map(cycles.filter(c=>c.blocked).map(c=>[c.index,c.blocked]));
  return s.tiles.map<MachineVisualSignal|null>((machine,index)=>{
    if(!machine)return null;
    if(!machine.worker)return {state:'idle',problem:null};
    const problem=blocked.get(index)??null;
    return problem?{state:'blocked',problem}:{state:'working',problem:null};
  });
}
