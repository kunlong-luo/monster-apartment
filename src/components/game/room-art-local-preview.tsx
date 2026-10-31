'use client';

import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import type {ChangeEvent} from 'react';
import type {CharacterId} from '@/core/character-life';
import type {RoomPose} from '@/core/room-performance';
import {RoomPosePreviewControls} from './room-pose-preview-controls';
import {siteAssetUrl} from '@/lib/game/site-asset-url';
import {YUESHA_REVIEW_OBJECTS,reviewAnchorGeometry,buildUnapprovedAnchorJson}
  from '@/core/room-art-review-geometry';
import type {YueshaReviewId,YueshaAnchorDraft,ReviewAnchor} from '@/core/room-art-review-geometry';

/** The review query flag is strictly presentation-only and never part of a save. */
function subscribeReviewMode(){return ()=>{};}
function reviewClientSnapshot(){
  return typeof window!=='undefined'&&
    new URLSearchParams(window.location.search).get('roomArtReview')==='1';
}
function reviewServerSnapshot(){return false;}

/** Object URLs belong to the mounted room, never IndexedDB, localStorage or Zustand. */
export function useRoomArtLocalPreview(){
  const enabled=useSyncExternalStore(subscribeReviewMode,reviewClientSnapshot,reviewServerSnapshot);
  const backgroundRef=useRef<string|null>(null);
  const [backgroundUrl,setBackgroundUrl]=useState<string|null>(null);
  const [poseUrls,setPoseUrls]=useState<Partial<Record<RoomPose,string>>>({});
  const [selectedPose,setSelectedPose]=useState<RoomPose|null>(null);
  const [error,setError]=useState('');
  const [anchorEditing,setAnchorEditing]=useState(false);
  const [selectedAnchor,setSelectedAnchor]=useState<YueshaReviewId>('seal');
  const [anchorDraft,setAnchorDraft]=useState<YueshaAnchorDraft>({});
  const resetAnchors=()=>{
    setAnchorEditing(false);setAnchorDraft({});setSelectedAnchor('seal');
  };
  useEffect(()=>{
    return ()=>{if(backgroundRef.current)URL.revokeObjectURL(backgroundRef.current);};
  },[]);
  const uploadBackground=async(event:ChangeEvent<HTMLInputElement>)=>{
    const input=event.currentTarget;
    const file=input.files?.[0];
    input.value='';
    if(!file)return;
    if(file.type!=='image/webp'||file.size<1000||file.size>10*1024*1024){
      setError('请选择不超过 10 MB 的 WebP 室内背景候选。');
      return;
    }
    let bitmap:ImageBitmap|undefined;
    try{
      bitmap=await createImageBitmap(file);
      if(bitmap.width<1920||bitmap.height<1080||
        Math.abs(bitmap.width/bitmap.height-16/9)>.01)
        throw new Error('背景候选须至少 1920×1080，画幅必须是 16:9。');
      // The user may compare unapproved images here, but never promote them.
      const next=URL.createObjectURL(file);
      if(backgroundRef.current)URL.revokeObjectURL(backgroundRef.current);
      backgroundRef.current=next;
      setBackgroundUrl(next);
      resetAnchors();
      setError('');
    }catch(err){
      setError(err instanceof Error?err.message:'无法读取 WebP 背景候选。');
    }finally{
      bitmap?.close();
    }
  };
  const resetBackground=()=>{
    if(backgroundRef.current)URL.revokeObjectURL(backgroundRef.current);
    backgroundRef.current=null;
    setBackgroundUrl(null);
    resetAnchors();
    setError('');
  };
  return {
    enabled,backgroundUrl,poseUrls,selectedPose,error,
    anchorEditing,selectedAnchor,anchorDraft,setAnchorEditing,setSelectedAnchor,
    setAnchorDraft,resetAnchors,
    placeAnchor:(position:ReviewAnchor)=>{
      setAnchorDraft(previous=>({...previous,[selectedAnchor]:position}));
      const next=YUESHA_REVIEW_OBJECTS.find(item=>item.id!==selectedAnchor&&!anchorDraft[item.id]);
      if(next)setSelectedAnchor(next.id);
    },
    uploadBackground,resetBackground,
    usePackagedYueshaReview:()=>{
      // Officially unreviewed, opt-in QA ONLY: no save and no production manifest.
      if(backgroundRef.current)URL.revokeObjectURL(backgroundRef.current);
      backgroundRef.current=null;
      setBackgroundUrl(siteAssetUrl('/art/room-review/yuesha-salon-candidate.webp'));
      resetAnchors();
      setError('');
    },
    setPoseUrl:(pose:RoomPose,url:string|null)=>
      setPoseUrls(previous=>({...previous,[pose]:url??undefined})),
    selectPose:setSelectedPose,
    resetPose:()=>setSelectedPose(null),
  };
}
export type RoomArtLocalPreview=ReturnType<typeof useRoomArtLocalPreview>;

/** Collapsed below scenic artwork so no reviewer-only overlay blocks physical props. */
export function RoomArtLocalPreviewPanel({id,name,review,warning}:{id:CharacterId;name:string;
  review:RoomArtLocalPreview;warning?:string;
}){
  const [open,setOpen]=useState(false);
  if(!review.enabled)return null;
  const panelId='room-art-review-controls-'+id;
  const fileId='room-art-local-file-'+id;
  const anchorCheck=reviewAnchorGeometry(review.anchorDraft);
  const exportDraft=()=>{
    if(!anchorCheck.ready)return;
    const data=buildUnapprovedAnchorJson(review.anchorDraft);
    const link=document.createElement('a');
    link.href='data:application/json;charset=utf-8,'+encodeURIComponent(data);
    link.download='yuesha-candidate-object-anchors.DRAFT.json';
    document.body.append(link);link.click();link.remove();
  };
  return <section data-testid="room-art-local-review"
    data-review-room={id}
    className="w-full max-w-[360px] rounded-lg border border-[#e9ba7d9e] bg-[#170d21f0] p-2 text-[11px] text-[#ffe5c9] shadow-lg">
    <button type="button" data-testid="room-art-review-toggle"
      aria-controls={panelId} aria-expanded={open}
      onClick={()=>setOpen(value=>!value)}
      className="min-h-11 w-full rounded border border-[#d6b98b90] bg-[#3c2438] px-2 text-left text-[#ffd298] hover:bg-[#533444] focus-visible:outline-2 focus-visible:outline-[#ffd298]">
      {open?'收起美术审核':'本地美术审核 · 展开'}
    </button>
    <div id={panelId} aria-hidden={!open}
      className={open?'mt-2 max-h-[min(42vh,270px)] space-y-1 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]':'hidden'}>
      <span className="block text-[#ffd298]">{name} · 仅本机预览，不会发布或保存</span>
      {warning&&<p role="note" className="text-[10px] leading-4 text-[#e7b68b]">{warning}</p>}
      {id==='yuesha'&&<button type="button" data-testid="room-art-staged-candidate"
        onClick={review.usePackagedYueshaReview}
        className="min-h-11 w-full rounded border border-gothic-brass/70 bg-gothic-panel px-2 py-2 text-left text-gothic-glow hover:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow">
        预览已入库的 1920×1080 会客室候选（未经正式审核）
      </button>}
      <label htmlFor={fileId} className="block text-[#ffe5c9]">查看高清背景 WebP</label>
      <input id={fileId} data-testid="room-art-local-file" type="file" accept="image/webp"
        onChange={review.uploadBackground}
        className="block w-full min-w-0 text-[10px] file:mr-1 file:rounded file:border-0 file:bg-[#5c3949] file:px-2 file:py-1 file:text-[#ffead5]"/>
      {id==='yuesha'&&review.backgroundUrl&&<>
        <div className="mt-2 space-y-2 rounded-md border border-gothic-brass/45 bg-gothic-night/80 p-2"
          data-testid="room-art-anchor-controls">
          <p className="text-[11px] leading-5 text-gothic-champagne">
            物件实景校准：此候选尚未发现与「蜡封、茶杯、账簿」对应的全部实体。禁止将旧物件坐标当成新背景坐标。
          </p>
          <button type="button" data-testid="room-art-anchor-toggle"
            aria-pressed={review.anchorEditing}
            onClick={()=>review.setAnchorEditing(!review.anchorEditing)}
            className="min-h-10 w-full rounded border border-gothic-brass bg-gothic-wine px-2 py-2 text-left text-gothic-ivory hover:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow">
            {review.anchorEditing?'结束坐标标注':'开始在画面中标注真实物件'}
          </button>
          {review.anchorEditing&&<>
            <div role="group" aria-label="选择要定位的物件" className="grid grid-cols-3 gap-1">
              {YUESHA_REVIEW_OBJECTS.map(({id:objectId,label})=>
                <button key={objectId} type="button" data-testid={'room-art-anchor-select-'+objectId}
                  aria-pressed={review.selectedAnchor===objectId}
                  onClick={()=>review.setSelectedAnchor(objectId)}
                  className={'min-h-10 rounded border px-1 py-1 text-[10px] leading-4 focus-visible:outline-2 focus-visible:outline-gothic-glow '+
                    (review.selectedAnchor===objectId?'border-gothic-glow bg-gothic-wine text-gothic-ivory':
                    'border-gothic-brass/50 bg-gothic-panel text-gothic-muted')}>
                  {review.anchorDraft[objectId]?'✓ ':''}{label}
                </button>)}
            </div>
            <p role="status" data-testid="room-art-anchor-progress"
              className="text-[10px] leading-5 text-gothic-champagne">
              已标注 {3-anchorCheck.missing.length}/3 处 ·
              {anchorCheck.problems.length?' 存在手机遮挡／重叠':anchorCheck.ready?' 坐标几何检查通过':' 仍需现场确认'}
            </p>
            {anchorCheck.problems.map((problem,index)=><p key={index} role="alert"
              className="text-[10px] text-red-200">{problem}</p>)}
            <button type="button" onClick={exportDraft}
              disabled={!anchorCheck.ready} data-testid="room-art-anchor-export"
              className="min-h-10 w-full rounded border border-gothic-brass/70 bg-gothic-panel px-2 py-2 text-left text-gothic-ivory disabled:cursor-not-allowed disabled:opacity-40">
              导出三处物件坐标草稿（非美术审批）
            </button>
            <button type="button" onClick={review.resetAnchors}
              className="min-h-9 w-full rounded border border-gothic-brass/40 px-2 text-left text-gothic-muted">
              清空本次标注
            </button>
          </>}
          <p className="text-[10px] leading-4 text-gothic-muted">
            导出仅包含坐标，不意味着图中有对应实体；正式发布还需权利、物件真实性与三视口人工审核。
          </p>
        </div>
      </>}
      {review.backgroundUrl&&<button type="button" data-testid="room-art-local-reset"
        onClick={review.resetBackground}
        className="min-h-9 rounded border border-[#d6b98b90] px-2 text-left hover:bg-[#533444]">
        恢复原概念背景
      </button>}
      {review.error&&<span role="alert" className="text-[#ffb3b9]">{review.error}</span>}
      <RoomPosePreviewControls onChange={review.setPoseUrl}
        onSelect={review.selectPose} onReset={review.resetPose}/>
    </div>
  </section>;
}
