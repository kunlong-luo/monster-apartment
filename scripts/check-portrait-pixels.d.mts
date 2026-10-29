export type PixelReview={sampleSize:number[];transparentFraction:number;opaqueFraction:number;edgeContacts:{left:number;right:number;top:number};passesPixelPreflight:true};
export declare function inspectAlphaMask(mask:number[],width:number,height:number):PixelReview;
export declare function checkPosePixels(assets:Record<string,Buffer>):Promise<Record<string,PixelReview>>;
export declare function comparePosePixels(first:{alpha:number[];tone:number[]},second:{alpha:number[];tone:number[]}):{alphaDifference:number;toneDifference:number};
export declare function assertDistinctPosePixels(samples:Record<string,{alpha:number[];tone:number[]}>):void;
