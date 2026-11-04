import {Container,Graphics} from 'pixi.js';
import type {Craft} from './workshop-model';
import type {MachineVisualState} from './workshop-machine-status';
import {devicePhase} from './workshop-machine-phases';
import {machineEffectProfile} from './workshop-machine-presentation';

const CRAFT_LIGHT:Record<Craft,number>={
  well:0x83e8f8,
  garden:0xb3e99b,
  kiln:0xffbb78,
};

/** Small, persistent Pixi objects: water bubbles, garden seed motes and kiln
 * embers have distinct silhouettes and trajectories. No DOM writes, timers,
 * fake progress or draw-geometry allocation on a ticker frame. Effects are
 * non-interactive and follow the real projected machine state. */
export function createMachineEffects(
  craft:Craft,state:MachineVisualState,index:number,x:number,y:number,
  startedAt:number|null,settledAt:number|null
){
  const color=state==='blocked'?0xf08b7f:CRAFT_LIGHT[craft];
  const node=new Container();
  node.position.set(x,y);
  node.eventMode='none';

  // Three translucent planes give the existing painted machinery depth
  // without replacing its crisp bitmap with a procedural placeholder.
  const bloom=new Graphics().ellipse(0,-12,48,24)
    .fill({color,alpha:.23});
  const baseRing=new Graphics().ellipse(0,2,43,13)
    .stroke({color,width:2,alpha:.88});
  const upperRing=new Graphics().ellipse(0,-7,29,9)
    .stroke({color:0xffe8c1,width:1.2,alpha:.7});
  for(const layer of [bloom,baseRing,upperRing])layer.eventMode='none';
  node.addChild(bloom,baseRing,upperRing);

  const particles=Array.from({length:7},(_,i)=>{
    const particle=new Graphics();
    if(craft==='well'){
      // Double contour + small reflected highlight: recognizable bubbles.
      particle.circle(0,0,2.5+(i%3)*.85)
        .stroke({color,width:1.35,alpha:.95});
      particle.circle(-1.1,-1.2,.85)
        .fill({color:0xfff5df,alpha:.92});
    }else if(craft==='garden'){
      // Seeds drift upward like a delicate pair of leaves, not round sparks.
      particle.ellipse(0,0,3.5+(i%2),1.85)
        .fill({color,alpha:.84});
      particle.moveTo(-2.7,0).lineTo(2.7,0)
        .stroke({color:0xfff3c2,width:.65,alpha:.9});
    }else{
      // Kiln embers are short, sharp heat trails with a bright center.
      particle.moveTo(0,-5-i%2).lineTo(0,3)
        .stroke({color,width:1.5,alpha:.9});
      particle.circle(0,-2,1.2)
        .fill({color:0xffe3af,alpha:.95});
    }
    particle.eventMode='none';
    node.addChild(particle);
    return particle;
  });

  // A stationary warning stays legible even when motion is disabled.
  // Blocked machinery must never imply that it is producing anything.
  const warning=new Graphics()
    .moveTo(-11,-18).lineTo(0,-37).lineTo(11,-18).closePath()
    .fill({color:0x34171c,alpha:.94})
    .stroke({color:0xffaa94,width:2,alpha:.95})
    .moveTo(0,-31).lineTo(0,-24)
    .stroke({color:0xffd1bc,width:2.3})
    .circle(0,-21,1.2).fill(0xffd1bc);
  warning.eventMode='none';
  node.addChild(warning);

  const tick=(seconds:number,enabled:boolean)=>{
    const phase=devicePhase(state,seconds,startedAt,settledAt);
    const profile=machineEffectProfile(phase,enabled);
    warning.visible=phase==='blocked';
    warning.alpha=enabled?.86+.12*Math.sin(seconds*2+index):1;
    bloom.visible=profile.bloomAlpha>0;
    bloom.alpha=profile.bloomAlpha*(enabled?.9+.1*Math.sin(seconds*1.9+index):1);
    baseRing.visible=profile.ringAlpha>0;
    baseRing.alpha=profile.ringAlpha*(enabled?.9+.1*Math.sin(seconds*2.2+index):1);
    upperRing.visible=profile.particles;
    upperRing.alpha=profile.ringAlpha*.55;
    upperRing.scale.set(phase==='output'?1.16:1);

    for(let i=0;i<particles.length;i++){
      const particle=particles[i];
      particle.visible=profile.particles;
      if(!profile.particles)continue;
      const progress=(seconds*profile.speed*.37+i/particles.length+index*.087)%1;
      const sway=Math.sin(progress*Math.PI*2+i*1.7);
      if(craft==='well'){
        particle.position.set((i-3)*4.4+sway*9,-5-progress*45);
        particle.rotation=0;
      }else if(craft==='garden'){
        particle.position.set((i-3)*4.5+sway*15,-12-progress*39);
        particle.rotation=Math.sin(seconds*.75+i)*.7;
      }else{
        particle.position.set((i-3)*3+sway*(9+progress*17),-13-progress*35);
        particle.rotation=.36*Math.sin(seconds*2.1+i);
      }
      // Rise, brighten and disappear without flickering at the wraparound.
      particle.alpha=Math.sin(Math.PI*progress)*.78+.06;
      particle.scale.set(profile.size*(.76+.4*progress));
    }
    return phase;
  };
  tick(0,false);
  return {node,tick};
}
