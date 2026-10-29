/** Actual decoded RGBA screening. This rejects crops that touch a bounding-box edge
 * along a long, artificially straight line. A human still judges anatomy/art. */
export function inspectPoseAlpha(data:Uint8ClampedArray,width:number,height:number){
  const invalid=(reason:string,transparent=0,opaque=0)=>({ok:false,reason,transparent,opaque});
  if(width<2||height<2||data.length!==width*height*4)
    return invalid('像素采样尺寸不合法');
  let transparent=0,opaque=0,xMin=width,xMax=-1,yMin=height,yMax=-1;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const alpha=data[(y*width+x)*4+3];
    if(alpha<=16)transparent++;
    if(alpha>=230)opaque++;
    if(alpha>32){
      xMin=Math.min(xMin,x);xMax=Math.max(xMax,x);
      yMin=Math.min(yMin,y);yMax=Math.max(yMax,y);
    }
  }
  const corners=[3,(width-1)*4+3,(height-1)*width*4+3,(width*height-1)*4+3];
  if(corners.some(i=>data[i]>32))
    return invalid('立绘四角存在不透明背景',transparent,opaque);
  const total=width*height;
  if(transparent/total<.05)
    return invalid('透明像素不足，可能是整张场景或合成 CG',transparent,opaque);
  if(opaque/total<.08)
    return invalid('人物有效像素过少或几乎全透明',transparent,opaque);
  if(xMax<xMin||yMax<yMin)return invalid('缺少有效人物轮廓',transparent,opaque);
  const heightSpan=yMax-yMin+1,widthSpan=xMax-xMin+1;
  const leftRatio=Array.from({length:heightSpan},(_,n)=>data[((yMin+n)*width+xMin)*4+3]>32?1:0)
    .reduce<number>((a,b)=>a+b,0)/heightSpan;
  const rightRatio=Array.from({length:heightSpan},(_,n)=>data[((yMin+n)*width+xMax)*4+3]>32?1:0)
    .reduce<number>((a,b)=>a+b,0)/heightSpan;
  const topRatio=Array.from({length:widthSpan},(_,n)=>data[(yMin*width+xMin+n)*4+3]>32?1:0)
    .reduce<number>((a,b)=>a+b,0)/widthSpan;
  if(leftRatio>.3||rightRatio>.3||topRatio>.4)
    return invalid('人物轮廓碰到裁切边：可能有断发、断手或拼贴裁切',transparent,opaque);
  return {ok:true,reason:'',transparent,opaque};
}
