import {YUESHA_REVIEW_OBJECTS} from '@/core/room-art-review-geometry';
import type {YueshaAnchorDraft} from '@/core/room-art-review-geometry';
import {compositeDrawingBox,roomCompositionReadiness} from '@/core/room-art-prop-composition';
import type {PropArtworkDraft} from '@/core/room-art-prop-composition';

const WIDTH=1920,HEIGHT=1080;
async function openImage(src:string):Promise<HTMLImageElement>{
  const image=new Image();
  image.crossOrigin='anonymous';
  image.src=src;
  await image.decode();
  return image;
}
export async function createUnapprovedRoomComposite(
  backgroundUrl:string,anchors:YueshaAnchorDraft,art:PropArtworkDraft,
):Promise<Blob>{
  const gate=roomCompositionReadiness(anchors,art,Boolean(backgroundUrl));
  if(!gate.ready)throw new Error('需先准备三幅真实透明物件图，并校正三处坐标');
  const source=await openImage(backgroundUrl);
  if(source.naturalWidth<WIDTH||source.naturalHeight<HEIGHT||
    Math.abs(source.naturalWidth/source.naturalHeight-16/9)>.01)
    throw new Error('合成仅接受原生 1920×1080 或更高的 16:9 会客室背景');
  const canvas=document.createElement('canvas');
  canvas.width=WIDTH;canvas.height=HEIGHT;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('无法创建高清画布');
  ctx.imageSmoothingQuality='high';
  ctx.drawImage(source,0,0,WIDTH,HEIGHT);
  for(const {id} of YUESHA_REVIEW_OBJECTS){
    const prop=art[id]!,anchor=anchors[id]!;
    const image=await openImage(prop.url);
    const rect=compositeDrawingBox(anchor,id,prop);
    ctx.drawImage(image,rect.x,rect.y,rect.width,rect.height);
  }
  return await new Promise<Blob>((resolve,reject)=>
    canvas.toBlob(result=>result?resolve(result):reject(new Error('高清候选导出失败')),
      'image/webp',.94));
}
export function downloadUnapprovedRoomCandidate(blob:Blob){
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;
  link.download='yuesha-room-composite.UNAPPROVED.webp';
  document.body.append(link);
  link.click();link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),2000);
}
