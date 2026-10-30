export type PoseFootAnchor={x:number;y:number};
export function poseFootAnchorsAlign(a:PoseFootAnchor,b:PoseFootAnchor){
  return Math.abs(a.x-b.x)<=.10&&Math.abs(a.y-b.y)<=.035;
}
/** A transparent image still has a painted lower silhouette; that point should
 * stay registered between moods, even if the arms and torso change. */
export function sampledPoseFootAnchor(
  alpha:Uint8Array|Uint8ClampedArray,width:number,height:number,
  lowerY:number,
):PoseFootAnchor{
  if(alpha.length!==width*height||width<2||height<2||lowerY<0||lowerY>=height)
    throw new Error('Invalid visible silhouette for foot anchor');
  const start=Math.max(0,lowerY-Math.max(2,Math.round(height*.045)));
  let weightedX=0,weight=0;
  for(let y=start;y<=lowerY;y++)for(let x=0;x<width;x++){
    const coverage=alpha[y*width+x];
    if(coverage<=32)continue;
    weightedX+=x*coverage;weight+=coverage;
  }
  if(!weight)throw new Error('No visible lower silhouette');
  return {x:weightedX/weight/(width-1),y:lowerY/(height-1)};
}

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
  const alpha=new Uint8Array(width*height);
  for(let i=0;i<alpha.length;i++)alpha[i]=data[i*4+3];
  return {ok:true,reason:'',transparent,opaque,
    footAnchor:sampledPoseFootAnchor(alpha,width,height,yMax)};

}
