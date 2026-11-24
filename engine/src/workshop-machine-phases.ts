import type {MachineVisualState} from './workshop-machine-status';

export type DevicePhase='idle'|'blocked'|'startup'|'working'|'output';

/** Pure phase priority: no particle clocks, no invented progress, and no
 * economy mutation. A finished machine briefly shows output, while blocked
 * equipment never appears to manufacture resources. */
export function devicePhase(
  state:MachineVisualState,seconds:number,startedAt:number|null,settledAt:number|null
):DevicePhase{
  if(state==='idle')return 'idle';
  if(state==='blocked')return 'blocked';
  if(settledAt!==null&&seconds>=settledAt&&seconds-settledAt<1.05)return 'output';
  if(startedAt!==null&&seconds>=startedAt&&seconds-startedAt<.72)return 'startup';
  return 'working';
}
