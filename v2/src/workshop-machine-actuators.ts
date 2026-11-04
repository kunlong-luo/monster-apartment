import {Container,Graphics} from 'pixi.js';
import {devicePhase} from './workshop-machine-phases';
import type {DevicePhase} from './workshop-machine-phases';
import type {Craft} from './workshop-model';
import type {MachineVisualState} from './workshop-machine-status';

export function machineActuatorPose(craft:Craft,phase:DevicePhase,seconds:number,index:number,allowMotion:boolean){
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

/** Small non-interactive machine mechanisms; approved paintings remain the
 * visible body of every machine. The ticker moves only existing Pixi parts. */
export function createMachineActuators(
  craft:Craft,state:MachineVisualState,index:number,x:number,y:number,
  startedAt:number|null,settledAt:number|null
){
  const node=new Container();node.position.set(x,y);node.eventMode='none';
  const left=new Container(),right=new Container();
  left.eventMode='none';right.eventMode='none';
  const glow=new Graphics();glow.eventMode='none';
  if(craft==='well'){
    const sleeve=new Graphics().roundRect(-8,-24,16,39,5)
      .fill({color:0x152b45,alpha:.55})
      .stroke({color:0xbfa77e,width:2,alpha:.8});
    sleeve.eventMode='none';node.addChild(sleeve);
    left.addChild(new Graphics().roundRect(-5,-8,10,17,3)
      .fill({color:0x66c8eb,alpha:.62})
      .stroke({color:0xd5f4f6,width:1.2,alpha:.8}));
    left.addChild(new Graphics().moveTo(0,-8).lineTo(0,-23)
      .stroke({color:0xd4b68b,width:2.3,alpha:.9}));
    glow.ellipse(0,2,11,17).fill({color:0x6ee2ff,alpha:.7});
  }else if(craft==='garden'){
    const stem=new Graphics().moveTo(0,14).lineTo(0,-19)
      .stroke({color:0xa98e67,width:2,alpha:.8});
    stem.eventMode='none';node.addChild(stem);
    left.position.set(-1,-7);right.position.set(1,-7);
    left.addChild(new Graphics().ellipse(-12,0,12,4.5)
      .fill({color:0x91c58a,alpha:.62})
      .stroke({color:0xe0dfaa,width:.9,alpha:.8}));
    right.addChild(new Graphics().ellipse(12,0,12,4.5)
      .fill({color:0x8ab985,alpha:.65})
      .stroke({color:0xf0deb4,width:.9,alpha:.8}));
    glow.ellipse(0,-9,20,10).fill({color:0xc8f1aa,alpha:.5});
  }else{
    left.position.set(-15,0);right.position.set(15,0);
    left.addChild(new Graphics().moveTo(-4,-16).lineTo(2,-8)
      .lineTo(6,13).stroke({color:0xe0ad70,width:3,alpha:.8}));
    right.addChild(new Graphics().moveTo(4,-16).lineTo(-2,-8)
      .lineTo(-6,13).stroke({color:0xe0ad70,width:3,alpha:.8}));
    const core=new Graphics().moveTo(0,-17).lineTo(11,0)
      .lineTo(0,17).lineTo(-11,0).closePath()
      .fill({color:0xffac62,alpha:.36})
      .stroke({color:0xffe2aa,width:1.3,alpha:.75});
    core.eventMode='none';node.addChild(core);
    glow.ellipse(0,0,17,18).fill({color:0xffa75b,alpha:.64});
  }
  node.addChild(glow,left,right);
  const tick=(seconds:number,allowMotion:boolean)=>{
    const phase=devicePhase(state,seconds,startedAt,settledAt);
    const pose=machineActuatorPose(craft,phase,seconds,index,allowMotion);
    left.position.y=(craft==='garden'?-7:0)+(craft==='kiln'?0:pose.displacement);
    right.position.y=craft==='garden'?-7:0;
    left.rotation=craft==='garden'?-pose.angle:craft==='kiln'?pose.angle:0;
    right.rotation=pose.angle;
    glow.alpha=pose.glow;
    return phase;
  };
  tick(0,false);
  return {node,tick};
}
