import {Container,Text} from 'pixi.js';

type LabelFactory=(s:string,size?:number,color?:number,bold?:boolean)=>Text;
/** Bounded, non-interactive feedback sprites with a single shared ticker.
 * Never tied to a React render, Pixi machine rebuild, or saved state. */
export function createFloatingFeedback(layer:Container,label:LabelFactory){
  const feedback:{sprite:Text;age:number;originY:number}[]=[];
  const showFeedback=(message:string,x:number,y:number,color:number)=>{
    if(feedback.length>=6){
      const stale=feedback.shift()!;
      layer.removeChild(stale.sprite);
      stale.sprite.destroy();
    }
    const sprite=label(message,18,color,true);
    sprite.anchor.set(.5);
    sprite.position.set(x,y);
    sprite.eventMode='none';
    layer.addChild(sprite);
    feedback.push({sprite,age:0,originY:y});
  };

  return {
    showFeedback,
    tick:(dt:number)=>{
    for(let i=feedback.length-1;i>=0;i--){
      const effect=feedback[i];
      effect.age+=dt/60;
      effect.sprite.y=effect.originY-Math.min(42,effect.age*34);
      effect.sprite.alpha=Math.max(0,1-effect.age/1.5);
      if(effect.age>=1.5){
        layer.removeChild(effect.sprite);
        effect.sprite.destroy();
        feedback.splice(i,1);
      }
    }

    }
  };
}
