import type {DevicePhase} from './workshop-machine-phases';
import {projectMachineProduction} from './workshop-production';
import type {WorkshopState} from './workshop-model';

/** Design-only visibility/intensity. Never estimates production, advances time,
 * reads a save, or grants resources. Disabled motion keeps a static state cue. */
export type MachineEffectProfile=Readonly<{
  particles:boolean;
  ringAlpha:number;
  bloomAlpha:number;
  speed:number;
  size:number;
}>;

export function machineEffectProfile(
  phase:DevicePhase,motionEnabled:boolean
):MachineEffectProfile{
  if(phase==='idle')
    return {particles:false,ringAlpha:0,bloomAlpha:0,speed:0,size:1};
  if(phase==='blocked')
    return {particles:false,ringAlpha:.42,bloomAlpha:0,speed:0,size:1};
  if(!motionEnabled)
    return {particles:false,ringAlpha:.18,bloomAlpha:.07,speed:0,size:1};
  if(phase==='output')
    return {particles:true,ringAlpha:.94,bloomAlpha:.46,speed:2.5,size:1.42};
  if(phase==='startup')
    return {particles:true,ringAlpha:.71,bloomAlpha:.34,speed:1.55,size:1.18};
  return {particles:true,ringAlpha:.34,bloomAlpha:.19,speed:1,size:1};
}

/** An art-layer state, derived from the *same* production phase as the
 * existing particles. No Pixi import is required for a deterministic test. */
export type MaterialLight=Readonly<{
  active:boolean;
  strength:number;
  movement:number;
}>;

export function materialLight(
  phase:DevicePhase,motionEnabled:boolean
):MaterialLight{
  if(phase==='idle'||phase==='blocked')
    return {active:false,strength:0,movement:0};
  if(!motionEnabled)
    return {active:true,strength:.12,movement:0};
  if(phase==='output')
    return {active:true,strength:.64,movement:1.65};
  if(phase==='startup')
    return {active:true,strength:.42,movement:1.25};
  return {active:true,strength:.27,movement:1};
}

/** Reusable, deterministic mechanical pose: paused / blocked machines cannot
 * move or imply production. Distinct craft speeds prevent synchronized toys. */
export function machineActuatorPose(
  craft:'well'|'garden'|'kiln',
  phase:DevicePhase,seconds:number,index:number,allowMotion:boolean
){
  const working=phase==='startup'||phase==='working'||phase==='output';
  const strength=!allowMotion||!working?0:phase==='output'?1:phase==='startup'?.65:.38;
  const cycle=Math.sin(seconds*(craft==='well'?4.2:craft==='garden'?1.6:3.4)+index*.47);
  return {
    displacement:strength*cycle*(craft==='well'?6:craft==='garden'?3.8:2.7),
    angle:strength*cycle*(craft==='garden'?.14:craft==='kiln'?.10:.02),
    glow:working?(allowMotion?.23+.15*strength*(.5+.5*cycle):.08):0,
    active:working,
  };
}

export type WorkshopSupplyTrail=Readonly<{
  from:number;
  to:number;
  kind:'water'|'fiber';
}>;

/** Only forecast actually consumed input, in the real source -> recipient
 * direction. A decorative pipe between neighbors is not proof of throughput.
 * Called on world sync, never from the animation ticker. */
export function projectedSupplyTrails(world:WorkshopState):WorkshopSupplyTrail[]{
  return projectMachineProduction(world).cycles.flatMap(cycle=>
    cycle.amount>0&&cycle.sourceIndex!==null
      ? [{from:cycle.sourceIndex,to:cycle.index,
          kind:cycle.craft==='garden'?'water' as const:'fiber' as const}]
      : []
  );
}
