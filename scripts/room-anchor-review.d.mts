/** Types for the review-only geometry gate shared by Node scripts. */
export declare const ROOM_OBJECT_IDS:Readonly<Record<'yuesha'|'brook'|'fern'|'cinder',readonly string[]>>;
export declare function coverProjection(
  anchor:readonly [number,number],width:number,height:number
):{x:number;y:number;visible:boolean};
export declare function validateRoomAnchors(
  room:'yuesha'|'brook'|'fern'|'cinder',
  anchors:unknown
):Record<string,[number,number]>;
