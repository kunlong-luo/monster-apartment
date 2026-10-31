import {projectCoverAnchor,roomSpotIsReachable} from './room-stage-layout';
import type {RoomStageSize} from './room-stage-layout';

export const YUESHA_REVIEW_OBJECTS=[
  {id:'seal',label:'月纹蜡封'},
  {id:'tea',label:'香料茶杯'},
  {id:'ledger',label:'旧账簿'},
] as const;
export type YueshaReviewId=(typeof YUESHA_REVIEW_OBJECTS)[number]['id'];
export type ReviewAnchor=readonly [number,number];
export type YueshaAnchorDraft=Partial<Record<YueshaReviewId,ReviewAnchor>>;

/** The review canvas is the actual object-fit:cover source painting. */
export function stageClickToSourceAnchor(x:number,y:number,stage:RoomStageSize):ReviewAnchor|null{
  if(stage.width<=0||stage.height<=0||!Number.isFinite(x)||!Number.isFinite(y))return null;
  const scale=Math.max(stage.width/16,stage.height/9);
  const imageWidth=16*scale,imageHeight=9*scale;
  const imageLeft=(stage.width-imageWidth)/2,imageTop=(stage.height-imageHeight)/2;
  const a=(x-imageLeft)/imageWidth,b=(y-imageTop)/imageHeight;
  if(a<=0||a>=1||b<=0||b>=1)return null;
  return [Math.round(a*10000)/10000,Math.round(b*10000)/10000];
}
export function reviewAnchorGeometry(draft:YueshaAnchorDraft){
  const missing=YUESHA_REVIEW_OBJECTS.filter(item=>!draft[item.id]).map(item=>item.id);
  const problems:string[]=[];
  const checked:{id:YueshaReviewId;x:number;y:number}[]=[];
  for(const {id} of YUESHA_REVIEW_OBJECTS){
    const p=draft[id];
    if(!p)continue;
    if(p.length!==2||p.some(n=>!Number.isFinite(n)||n<=0||n>=1)){
      problems.push(id+' 坐标超出原画范围');continue;
    }
    const mobile={width:390,height:315};
    const xy=projectCoverAnchor(p,mobile);
    if(!roomSpotIsReachable(xy,mobile))problems.push(id+' 在 390px 手机预览不可触达');
    const x=Number.parseFloat(xy.left)/100*mobile.width;
    const y=Number.parseFloat(xy.top)/100*mobile.height;
    if(checked.some(v=>Math.abs(v.x-x)<44&&Math.abs(v.y-y)<44))
      problems.push(id+' 与其他调查物件在手机视图重叠');
    checked.push({id,x,y});
  }
  return {ready:missing.length===0&&problems.length===0,missing,problems};
}
/** A draft is NEVER an approval or production file. Only bare anchor coords go
 * into the separate --anchors intake, then human review is still required. */
export function buildUnapprovedAnchorJson(draft:YueshaAnchorDraft){
  const check=reviewAnchorGeometry(draft);
  if(!check.ready)throw new Error('请先标注三个真实物件，并修复手机可达性问题');
  return JSON.stringify(Object.fromEntries(YUESHA_REVIEW_OBJECTS.map(({id})=>[id,draft[id]])),null,2)+'\n';
}
