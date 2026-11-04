import {Container,Graphics} from 'pixi.js';
import type {Craft} from './workshop-model';
import type {MachineVisualState} from './workshop-machine-status';
import {devicePhase} from './workshop-machine-phases';
import type {DevicePhase} from './workshop-machine-phases';

/** Material lighting belongs on the painted machine, not the floating particle
 * layer. Its state is a rendering decision, never a second production model. */
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

/** Three restrained hand-built material-light layers on top of the existing
 * painterly machinery. Pixi draws the forms once; ticker updates only alpha,
 * scale and position. No SVG / DOM overlays, hit targets or economy writes.
 *
 * well: faint refractive line in a glass water vessel;
 * garden: moonlight on the greenhouse glazing and leaf silhouettes;
 * kiln: light from the existing crystalline furnace chamber.
 */
export function createMachineMaterial(
  craft:Craft,state:MachineVisualState,index:number,
  x:number,y:number,startedAt:number|null,settledAt:number|null
){
  const node=new Container();
  node.position.set(x,y);
  node.eventMode='none';

  const glow=new Graphics();
  const shimmer=new Graphics();
  const specular=new Graphics();
  if(craft==='well'){
    glow.ellipse(0,0,27,27).fill({color:0x62cfea,alpha:.28});
    glow.ellipse(0,6,21,11).fill({color:0x9aecf9,alpha:.32});
    shimmer.moveTo(-21,0).bezierCurveTo(-8,-7,9,3,21,-2)
      .stroke({color:0xb7f6ff,width:2.5,alpha:.89});
    shimmer.ellipse(-9,-14,5,17).fill({color:0xf0ffff,alpha:.31});
    specular.ellipse(-17,-16,2.5,11).fill({color:0xf1ffff,alpha:.62});
  }else if(craft==='garden'){
    glow.ellipse(0,-5,33,22).fill({color:0x9de9a5,alpha:.25});
    glow.ellipse(0,10,25,13).fill({color:0xc6f4b0,alpha:.24});
    shimmer.moveTo(-25,-11).bezierCurveTo(-9,-32,14,-30,25,-10)
      .stroke({color:0xe3ffc8,width:2.2,alpha:.58});
    shimmer.moveTo(-15,12).quadraticCurveTo(-3,4,1,-9)
      .stroke({color:0x9ee59a,width:2,alpha:.72});
    shimmer.moveTo(1,-9).quadraticCurveTo(16,-9,13,3)
      .stroke({color:0xc5fbb1,width:2,alpha:.69});
    specular.ellipse(0,-20,20,2).fill({color:0xe6ffe2,alpha:.5});
  }else{
    glow.ellipse(0,2,29,26).fill({color:0xff7438,alpha:.29});
    glow.ellipse(0,-3,16,18).fill({color:0xffc779,alpha:.4});
    shimmer.moveTo(0,-28).lineTo(18,-5).lineTo(12,22)
      .lineTo(-14,19).lineTo(-19,-4).closePath()
      .stroke({color:0xffdd9a,width:2.25,alpha:.65});
    shimmer.moveTo(0,-28).lineTo(1,16)
      .stroke({color:0xffedba,width:1.7,alpha:.63});
    shimmer.moveTo(-19,-4).lineTo(14,-5)
      .stroke({color:0xffe3b1,width:1.6,alpha:.54});
    specular.ellipse(-7,-7,4,11).fill({color:0xfff0c7,alpha:.4});
  }
  for(const part of [glow,shimmer,specular]){
    part.eventMode='none';
    node.addChild(part);
  }

  const tick=(seconds:number,motionEnabled:boolean)=>{
    const phase=devicePhase(state,seconds,startedAt,settledAt);
    const settings=materialLight(phase,motionEnabled);
    node.visible=settings.active;
    if(!settings.active)return phase;
    const cycle=settings.movement>0
      ?Math.sin(seconds*(craft==='kiln'?3.7:craft==='well'?1.65:1.18)+index*.7)
      :0;
    glow.alpha=settings.strength*(.78+.22*cycle);
    shimmer.alpha=settings.strength*(.54+.23*cycle);
    specular.alpha=settings.strength*(.62+.24*cycle);
    // Refract along the glass, flutter over the leaves, or pulse inside the
    // kiln. Reduced-motion mode freezes all geometry at its resting pose.
    shimmer.position.y=settings.movement*cycle*(craft==='well'?4:2);
    specular.position.x=settings.movement*cycle*(craft==='well'?5:3);
    glow.scale.set(1+settings.movement*.035*cycle);
    return phase;
  };
  tick(0,false);
  return {node,tick};
}
