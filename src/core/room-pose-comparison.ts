/** Preview-time comparison of decoded pose thumbnails. This is a fast
 * geometry/content screen, not a human judgment of the character's identity.
 * The server's Chromium artwork intake independently repeats this check. */
export type PoseThumbnail={alpha:Uint8Array;tone:Uint8Array};

export function poseThumbnail(data:Uint8ClampedArray,width:number,height:number):PoseThumbnail{
  if(!(width>0&&height>0)||data.length!==width*height*4)
    throw new Error('Invalid decoded pose RGBA sample');
  const alpha=new Uint8Array(width*height),tone=new Uint8Array(width*height);
  for(let i=0;i<alpha.length;i++){
    alpha[i]=data[i*4+3];
    tone[i]=Math.round(data[i*4]*.299+data[i*4+1]*.587+data[i*4+2]*.114);
  }
  return {alpha,tone};
}
export function poseSimilarity(a:PoseThumbnail,b:PoseThumbnail){
  if(!a.alpha.length||a.alpha.length!==b.alpha.length||
    a.tone.length!==a.alpha.length||b.tone.length!==b.alpha.length)
    throw new Error('Invalid pose comparison sample');
  let alphaDiff=0,toneDiff=0,sharedVisible=0;
  for(let i=0;i<a.alpha.length;i++){
    alphaDiff+=Math.abs(a.alpha[i]-b.alpha[i]);
    if(a.alpha[i]>32&&b.alpha[i]>32){
      toneDiff+=Math.abs(a.tone[i]-b.tone[i]);
      sharedVisible++;
    }
  }
  return {
    alphaDifference:alphaDiff/a.alpha.length/255,
    toneDifference:sharedVisible?toneDiff/sharedVisible/255:0,
  };
}
export function poseLooksDuplicated(a:PoseThumbnail,b:PoseThumbnail){
  const comparison=poseSimilarity(a,b);
  return comparison.alphaDifference<.018&&comparison.toneDifference<.035;
}
