import {projectCoverAnchor} from './room-stage-layout';
import type {RoomStageSize} from './room-stage-layout';
import {reviewAnchorGeometry,YUESHA_REVIEW_OBJECTS} from './room-art-review-geometry';
import type {YueshaAnchorDraft,YueshaReviewId,ReviewAnchor} from './room-art-review-geometry';

/** These are artwork sizes, not hotspot/touch sizes or game-state data. */
export const YUESHA_PROP_SIZE:Readonly<Record<YueshaReviewId,number>>={
  seal:.068,
  tea:.093,
  ledger:.122,
};
export type PropArtwork={url:string;name:string;width:number;height:number};
export type PropArtworkDraft=Partial<Record<YueshaReviewId,PropArtwork>>;

export function roomPropPlacement(anchor:ReviewAnchor,stage:RoomStageSize,partWidth:number){
  if(!(partWidth>.025&&partWidth<.25))throw new Error('Invalid prop drawing size');
  const scale=Math.max(stage.width/16,stage.height/9);
  return {...projectCoverAnchor(anchor,stage),width:Math.round(16*scale*partWidth)};
}
export function roomCompositionReadiness(anchors:YueshaAnchorDraft,art:PropArtworkDraft,hasBackground:boolean){
  const placement=reviewAnchorGeometry(anchors);
  const absent=YUESHA_REVIEW_OBJECTS.filter(({id})=>!art[id]?.url).map(x=>x.id);
  return {
    ready:hasBackground&&placement.ready&&absent.length===0,
    geometry:placement,
    missingArtwork:absent,
  };
}
/** Object-fit:cover painting and image output share a 16:9 authoring canvas.
 * Browser output is an UNAPPROVED candidate, never a manifest promotion. */
export function compositeDrawingBox(anchor:ReviewAnchor,id:YueshaReviewId,art:PropArtwork){
  if(!(art.width>0&&art.height>0))throw new Error('Invalid image dimensions');
  const width=1920*YUESHA_PROP_SIZE[id],height=width*art.height/art.width;
  return {x:anchor[0]*1920-width/2,y:anchor[1]*1080-height/2,width,height};
}
