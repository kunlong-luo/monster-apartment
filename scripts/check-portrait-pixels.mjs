import {chromium} from '@playwright/test';
/** Match the local 64px pose preview's geometry check at 128px accuracy.
 * This checks registration, not anatomy or human artistic approval. */
export function poseFootAnchorsAlign(first,second){
  return Math.abs(first.x-second.x)<=.10&&Math.abs(first.y-second.y)<=.035;
}
export function assertConsistentPoseFootAnchors(reviews){
  const frames=Object.entries(reviews);
  for(let i=0;i<frames.length;i++)for(let j=i+1;j<frames.length;j++){
    const [first,a]=frames[i],[second,b]=frames[j];
    if(!a?.footAnchor||!b?.footAnchor||
      !poseFootAnchorsAlign(a.footAnchor,b.footAnchor))
      throw new Error('Pose foot anchor mismatch: '+first+' / '+second);
  }
}
export function inspectAlphaMask(mask,width,height){
  if(mask.length!==width*height||width<2||height<2)
    throw new Error('Invalid decoded alpha grid');
  let transparent=0,opaque=0,xMin=width,xMax=-1,yMin=height,yMax=-1;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const value=mask[y*width+x];
    if(value<=16)transparent++;
    if(value>=230)opaque++;
    if(value>32){
      xMin=Math.min(xMin,x);xMax=Math.max(xMax,x);
      yMin=Math.min(yMin,y);yMax=Math.max(yMax,y);
    }
  }
  const cornerValues=[mask[0],mask[width-1],mask[(height-1)*width],mask.at(-1)];
  if(cornerValues.some(a=>a>32))
    throw new Error('Non-transparent corners: baked background or incorrectly cropped pose');
  if(transparent/(width*height)<.05||opaque/(width*height)<.08)
    throw new Error('Invalid transparency/figure pixel coverage');
  if(xMax<xMin||yMax<yMin)throw new Error('No visible silhouette');
  const spanY=yMax-yMin+1,spanX=xMax-xMin+1;
  let left=0,right=0,top=0;
  for(let y=yMin;y<=yMax;y++){
    if(mask[y*width+xMin]>32)left++;
    if(mask[y*width+xMax]>32)right++;
  }
  for(let x=xMin;x<=xMax;x++)if(mask[yMin*width+x]>32)top++;
  const contacts={left:Math.round(left/spanY*1000)/1000,
    right:Math.round(right/spanY*1000)/1000,top:Math.round(top/spanX*1000)/1000};
  if(contacts.left>.3||contacts.right>.3||contacts.top>.4)
    throw new Error('Silhouette clipping detected (hair/arms/costume): '+JSON.stringify(contacts));
  const bandStart=Math.max(0,yMax-Math.max(2,Math.round(height*.045)));
  let weightedX=0,weight=0;
  for(let y=bandStart;y<=yMax;y++)for(let x=0;x<width;x++){
    const coverage=mask[y*width+x];
    if(coverage<=32)continue;
    weightedX+=x*coverage;weight+=coverage;
  }
  if(!weight)throw new Error('No lower silhouette foot anchor');
  const footAnchor={x:weightedX/weight/(width-1),y:yMax/(height-1)};
  return {
    footAnchor,
    sampleSize:[width,height],transparentFraction:Math.round(transparent/(width*height)*1000)/1000,
    opaqueFraction:Math.round(opaque/(width*height)*1000)/1000,
    edgeContacts:contacts,passesPixelPreflight:true,
  };
}
/** Reject visually indistinguishable frames even if a few pixels were altered
 * to create different SHA-256 hashes. A small facial change is not a distinct
 * full-body pose; genuine new body shapes must survive this comparison. */
export function comparePosePixels(first,second){
  if(!first?.alpha||!second?.alpha||!first?.tone||!second?.tone||
    first.alpha.length!==second.alpha.length||first.tone.length!==second.tone.length||
    first.alpha.length!==first.tone.length||first.alpha.length===0)
    throw new Error('Invalid pose comparison arrays');
  let alphaDiff=0,toneDiff=0,visible=0;
  for(let i=0;i<first.alpha.length;i++){
    alphaDiff+=Math.abs(first.alpha[i]-second.alpha[i]);
    if(first.alpha[i]>32&&second.alpha[i]>32){
      toneDiff+=Math.abs(first.tone[i]-second.tone[i]);
      visible++;
    }
  }
  return {
    alphaDifference:Math.round(alphaDiff/first.alpha.length/255*10000)/10000,
    toneDifference:visible?Math.round(toneDiff/visible/255*10000)/10000:0,
  };
}
export function assertDistinctPosePixels(samples){
  const poses=Object.keys(samples);
  for(let i=0;i<poses.length;i++)for(let j=i+1;j<poses.length;j++){
    const metrics=comparePosePixels(samples[poses[i]],samples[poses[j]]);
    if(metrics.alphaDifference<.018&&metrics.toneDifference<.035)
      throw new Error('Visually near-duplicate character poses: '+poses[i]+' / '+poses[j]+
        ' ('+JSON.stringify(metrics)+')');
  }
}

/** Real Chromium WebP decoding and image-data reading; checks actual transparency,
 * not just a VP8X alpha bit. No URLs, uploads, or network requests. */
export async function checkPosePixels(assets){
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage();
    const report={},samples={};
    for(const [pose,bytes] of Object.entries(assets)){
      const base64=bytes.toString('base64');
      const sample=await page.evaluate(async encoded=>{
        const img=new Image();
        img.src='data:image/webp;base64,'+encoded;
        await img.decode();
        const canvas=document.createElement('canvas');
        canvas.width=128;canvas.height=128;
        const context=canvas.getContext('2d',{willReadFrequently:true});
        if(!context)throw new Error('Canvas context missing');
        context.clearRect(0,0,128,128);
        context.drawImage(img,0,0,128,128);
        const pixels=context.getImageData(0,0,128,128).data;
        return {
          alpha:Array.from({length:128*128},(_,i)=>pixels[i*4+3]),
          tone:Array.from({length:128*128},(_,i)=>Math.round(
            pixels[i*4]*.299+pixels[i*4+1]*.587+pixels[i*4+2]*.114)),
        };
      },base64);
      try{report[pose]=inspectAlphaMask(sample.alpha,128,128);samples[pose]=sample;}
      catch(err){throw new Error(pose+': '+err.message);}
    }
    assertDistinctPosePixels(samples);
    assertConsistentPoseFootAnchors(report);
    return report;
  }finally{await browser.close();}
}
