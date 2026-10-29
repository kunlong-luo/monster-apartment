import {chromium} from '@playwright/test';
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
  if(contacts.left>.24||contacts.right>.24||contacts.top>.4)
    throw new Error('Silhouette clipping detected (hair/arms/costume): '+JSON.stringify(contacts));
  return {
    sampleSize:[width,height],transparentFraction:Math.round(transparent/(width*height)*1000)/1000,
    opaqueFraction:Math.round(opaque/(width*height)*1000)/1000,
    edgeContacts:contacts,passesPixelPreflight:true,
  };
}
/** Real Chromium WebP decoding and image-data reading; checks actual transparency,
 * not just a VP8X alpha bit. No URLs, uploads, or network requests. */
export async function checkPosePixels(assets){
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage();
    const report={};
    for(const [pose,bytes] of Object.entries(assets)){
      const base64=bytes.toString('base64');
      const mask=await page.evaluate(async encoded=>{
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
        return Array.from({length:128*128},(_,i)=>pixels[i*4+3]);
      },base64);
      try{report[pose]=inspectAlphaMask(mask,128,128);}
      catch(err){throw new Error(pose+': '+err.message);}
    }
    return report;
  }finally{await browser.close();}
}
