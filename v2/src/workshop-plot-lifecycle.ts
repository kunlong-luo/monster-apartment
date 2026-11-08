import type {AnimatedSprite,Container,Graphics,Sprite,Text} from 'pixi.js';

/** Only the references needed to dispose a single plot's Pixi display tree.
 * Pools are shared with the ticker; stale entries must never reach it. */
export type WorkshopPlotPools={
  actors:AnimatedSprite[];
  paintedActors:{sprite:Sprite}[];
  machineAnimations:AnimatedSprite[];
  machineArt:{sprite:Sprite}[];
  machineEffects:{ring:Graphics}[];
  deviceEffects:{node:Container}[];
  materialEffects:{node:Container}[];
  actuatorEffects:{node:Container}[];
  animatedPlots:Set<number>;
  machineLabels:Array<Text|null>;
};

/** Pixi 8 Graphics.destroy({children:true}) can leave an owned GraphicsContext
 * alive because passing destroy options without `context:true` disables
 * automatic owned-context disposal. Recursively destroy children first and
 * call destroy() WITHOUT options on every node: Pixi disposes self-owned
 * GraphicsContexts but preserves external/shared contexts and Sprite textures.
 * This is safe for floor/worker art cached outside of a plot. */
export function destroyWorkshopDisplayChildren(parent:Container):void{
  const children=parent.removeChildren();
  for(const child of children){
    destroyWorkshopDisplayChildren(child);
    child.destroy();
  }
}

/** Dispose a plot without touching the visitor/mobile actors or siblings.
 * Shared textures and shared GraphicsContexts are NOT destroyed here. */
export function releaseWorkshopPlot(
  index:number,layer:Container,pools:WorkshopPlotPools
):void{
  const prune=<T>(list:T[],owned:(item:T)=>boolean,stop?:(item:T)=>void)=>{
    for(let i=list.length-1;i>=0;i--){
      const item=list[i];
      if(!owned(item))continue;
      stop?.(item);
      list.splice(i,1);
    }
  };
  prune(pools.actors,item=>item.parent===layer,item=>item.stop());
  prune(pools.paintedActors,item=>item.sprite.parent===layer);
  prune(pools.machineAnimations,item=>item.parent===layer,item=>item.stop());
  prune(pools.machineArt,item=>item.sprite.parent===layer);
  prune(pools.machineEffects,item=>item.ring.parent===layer);
  prune(pools.deviceEffects,item=>item.node.parent===layer);
  prune(pools.materialEffects,item=>item.node.parent===layer);
  prune(pools.actuatorEffects,item=>item.node.parent===layer);
  pools.animatedPlots.delete(index);
  pools.machineLabels[index]=null;
  destroyWorkshopDisplayChildren(layer);
}
