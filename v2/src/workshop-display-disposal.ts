/** Pixi-agnostic teardown of a disposable scene tree.
 * Graphics.destroy() without options disposes a self-owned GraphicsContext;
 * Graphics.destroy({children:true}) can preserve that context in Pixi 8.
 * No texture/context ownership flags are forced on shared resources. */
export interface WorkshopDisposableDisplayNode{
  removeChildren:()=>WorkshopDisposableDisplayNode[];
  destroy:()=>void;
}

/** Children before parent; shared Pixi sprite textures are never destroyed. */
export function destroyWorkshopDisplayChildren(
  parent:WorkshopDisposableDisplayNode
):void{
  for(const child of parent.removeChildren()){
    destroyWorkshopDisplayChildren(child);
    child.destroy();
  }
}
