export type PixelReview={sampleSize:number[];transparentFraction:number;opaqueFraction:number;edgeContacts:{left:number;right:number;top:number};passesPixelPreflight:true};
export declare function inspectAlphaMask(mask:number[],width:number,height:number):PixelReview;
export declare function checkPosePixels(assets:Record<string,Buffer>):Promise<Record<string,PixelReview>>;
