import {Container,Graphics} from 'pixi.js';
import type {Craft} from './workshop-model';
import type {MachineVisualState} from './workshop-machine-status';

export type DevicePhase='idle'|'blocked'|'startup'|'working'|'output';
export function devicePhase(
  state:MachineVisualState,seconds:number,startedAt:number|null,settledAt:number|null
):DevicePhase{
  if(state==='idle')return 'idle';
  if(state==='blocked')return 'blocked';
  if(settledAt!==null&&seconds>=settledAt&&seconds-settledAt<1.05)return 'output';
  if(startedAt!==null&&seconds>=startedAt&&seconds-startedAt<.72)return 'startup';
  return 'working';
}

/** A few persistent, non-interactive particles per machine. Their motion is
 * visual only: no fake rewards, timers or DOM writes. Colors and trajectories
 * convey pump bubbles, greenhouse spores and kiln sparks distinctly. */
export function createMachineEffects(
  craft:Craft,state:MachineVisualState,index:number,x:number,y:number,
  startedAt:number|null,settledAt:number|null
){
  const colors:Record<Craft,number>={well:0x83e8f8,garden:0xadef98,kiln:0xffbf71};
  const color=state==='blocked'?0xf08b7f:colors[craft];
  const node=new Container();
  node.position.set(x,y);
  node.eventMode='none';
  const halo=new Graphics().ellipse(0,0,39,13).stroke({color,width:2,alpha:.8});
  const warning=new Graphics().moveTo(-10,-10).lineTo(0,-27).lineTo(10,-10)
    .closePath().stroke({color:0xffa18f,width:2,alpha:.94});
  const dots=Array.from({length:4},(_,i)=>{
    const dot=new Graphics();
    if(craft==='well')dot.circle(0,0,3+i%2).stroke({color,width:1.6});
    else if(craft==='garden')dot.ellipse(0,0,3.7,2.2).fill({color,alpha:.86});
    else dot.moveTo(-3,2).lineTo(0,-4).lineTo(3,2).closePath().fill(color);
    dot.eventMode='none';
    node.addChild(dot);
    return dot;
  });
  node.addChild(halo,warning);
  const tick=(seconds:number,enabled:boolean)=>{
    const phase=devicePhase(state,seconds,startedAt,settledAt);
    warning.visible=phase==='blocked';
    halo.visible=phase!=='idle';
    if(phase==='blocked'){
      halo.alpha=enabled?.3+.15*(Math.sin(seconds*2+index)+1)/2:.36;
      halo.tint=0xff9b8c;
    }else{
      halo.tint=0xffffff;
      halo.alpha=phase==='output'?.9:phase==='startup'?.69:
        phase==='working'?.28:0;
    }
    const active=enabled&&(phase==='startup'||phase==='working'||phase==='output');
    const speed=phase==='output'?2.6:phase==='startup'?1.55:1;
    for(let i=0;i<dots.length;i++){
      const dot=dots[i];dot.visible=active;
      if(!active)continue;
      const position=(seconds*speed*.64+i*.29+index*.13)%1;
      const sway=Math.sin(position*6.283+i*1.7);
      if(craft==='well'){
        dot.position.set(sway*13+(i-1.5)*5,-6-position*48);
      }else if(craft==='garden'){
        dot.position.set(sway*16+(i-1.5)*6,-12-position*33);
        dot.rotation=seconds*.43+i;
      }else{
        dot.position.set(sway*(12+position*18),-16-position*31);
        dot.rotation=position*4+i;
      }
      dot.alpha=(.5+.5*Math.sin(position*Math.PI))*(phase==='output'?1:.77);
      dot.scale.set(phase==='output'?1.35:1);
    }
    return phase;
  };
  tick(0,false);
  return {node,tick};
}
