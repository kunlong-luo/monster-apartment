/** Types for the standalone Node .mjs candidate review tool. */
export declare function webpDimensions(bytes:Buffer):{
  width:number;
  height:number;
  alpha:boolean;
};
export declare function coverProjection(
  anchor:readonly [number,number],
  width:number,
  height:number,
):{x:number;y:number;visible:boolean};
export declare function buildReviewHtml(options:{
  room:'yuesha'|'brook'|'fern'|'cinder';
  anchors:Record<string,readonly [number,number]>;
  sourceWidth:number;
  sourceHeight:number;
}):string;
