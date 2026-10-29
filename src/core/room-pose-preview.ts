/** Fast RGBA screening for local transparent WebP actors, not final art approval. */
export function inspectPoseAlpha(data:Uint8ClampedArray,width:number,height:number){
  if(width<2||height<2||data.length!==width*height*4)
    return {ok:false,reason:'像素采样尺寸不合法',transparent:0,opaque:0};
  let transparent=0,opaque=0;
  for(let i=3;i<data.length;i+=4){
    if(data[i]<=16)transparent++;
    if(data[i]>=230)opaque++;
  }
  const corners=[3,(width-1)*4+3,(height-1)*width*4+3,(width*height-1)*4+3];
  if(corners.some(i=>data[i]>32))
    return {ok:false,reason:'立绘四角存在不透明背景',transparent,opaque};
  const total=width*height;
  if(transparent/total<.05)
    return {ok:false,reason:'透明像素不足，可能是整张场景或合成 CG',transparent,opaque};
  if(opaque/total<.08)
    return {ok:false,reason:'人物有效像素过少或几乎全透明',transparent,opaque};
  return {ok:true,reason:'',transparent,opaque};
}
