export type PoseFootAnchor={x:number;y:number};
export type PixelReview={footAnchor:PoseFootAnchor;sampleSize:number[];transparentFraction:number;opaqueFraction:number;edgeContacts:{left:number;right:number;top:number};passesPixelPreflight:true};
export declare function inspectAlphaMask(mask:ArrayLike<number>,width:number,height:number):PixelReview;
export declare function assertConsistentPoseFootAnchors(reviews:Record<string,Pick<PixelReview,'footAnchor'>>):void;
export declare function checkPosePixels(assets:Record<string,Buffer>):Promise<Record<string,PixelReview>>;
export declare function comparePosePixels(first:{alpha:number[];tone:number[]},second:{alpha:number[];tone:number[]}):{alphaDifference:number;toneDifference:number};
export declare function assertDistinctPosePixels(samples:Record<string,{alpha:number[];tone:number[]}>):void;
