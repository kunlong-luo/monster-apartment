'use client';

import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import type {ChangeEvent} from 'react';
import type {CharacterId} from '@/core/character-life';
import type {RoomPose} from '@/core/room-performance';
import {RoomPosePreviewControls} from './room-pose-preview-controls';

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
    setError('');
  };
  return {
    enabled,backgroundUrl,poseUrls,selectedPose,error,
    uploadBackground,resetBackground,
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
      <label htmlFor={fileId} className="block text-[#ffe5c9]">查看高清背景 WebP</label>
      <input id={fileId} data-testid="room-art-local-file" type="file" accept="image/webp"
        onChange={review.uploadBackground}
        className="block w-full min-w-0 text-[10px] file:mr-1 file:rounded file:border-0 file:bg-[#5c3949] file:px-2 file:py-1 file:text-[#ffead5]"/>
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
