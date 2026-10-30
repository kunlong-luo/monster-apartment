'use client';
import {useEffect,useRef,useState} from 'react';
import type {ChangeEvent} from 'react';
import type {RoomPose} from '@/core/room-performance';
import {inspectPoseAlpha,poseFootAnchorsAlign} from '@/core/room-pose-preview';
import type {PoseFootAnchor} from '@/core/room-pose-preview';
import {poseLooksDuplicated,poseThumbnail} from '@/core/room-pose-comparison';
import type {PoseThumbnail} from '@/core/room-pose-comparison';

const POSES=[
  {id:'idle',label:'待机'},{id:'attentive',label:'倾听'},
  {id:'warm',label:'亲近'},{id:'guarded',label:'警觉'},
] as const satisfies readonly {id:RoomPose;label:string}[];
type Dimensions={width:number;height:number};
/** Review-only uploads live in memory; URLs never touch the story or save store. */
export function RoomPosePreviewControls({onChange,onSelect,onReset}:{
  onChange:(pose:RoomPose,url:string|null)=>void;
  onSelect:(pose:RoomPose)=>void;
  onReset:()=>void;
}){
  const urls=useRef<Partial<Record<RoomPose,string>>>({});
  const dimensions=useRef<Partial<Record<RoomPose,Dimensions>>>({});
  const thumbnails=useRef<Partial<Record<RoomPose,PoseThumbnail>>>({});
  const footAnchors=useRef<Partial<Record<RoomPose,PoseFootAnchor>>>({});
  // Hold displaced object URLs until their 240ms exit animation finishes.
  // Immediate revoke used to break the departing frame on slow mobile devices.
  const retired=useRef(new Set<string>());
  const releaseTimers=useRef(new Set<ReturnType<typeof setTimeout>>());
  const [loaded,setLoaded]=useState<readonly RoomPose[]>([]);
  const [error,setError]=useState('');
  useEffect(()=>{
    const retainedUrls=urls.current;
    const staleUrls=retired.current;
    const pendingTimers=releaseTimers.current;
    return ()=>{
      for(const timer of pendingTimers)clearTimeout(timer);
      for(const url of Object.values(retainedUrls))if(url)URL.revokeObjectURL(url);
      for(const url of staleUrls)URL.revokeObjectURL(url);
    };
  },[]);
  const releaseAfterTransition=(url:string)=>{
    retired.current.add(url);
    const timer=setTimeout(()=>{
      retired.current.delete(url);
      releaseTimers.current.delete(timer);
      URL.revokeObjectURL(url);
    },500);
    releaseTimers.current.add(timer);
  };
  const upload=async(pose:RoomPose,event:ChangeEvent<HTMLInputElement>)=>{
    const input=event.currentTarget;
    const file=input.files?.[0];input.value='';
    if(!file)return;
    if(file.type!=='image/webp'||file.size>8*1024*1024||file.size<1000){
      setError('请使用 8 MB 以下的透明 WebP 人物图片。');return;
    }
    let bitmap:ImageBitmap|undefined;
    try{
      bitmap=await createImageBitmap(file);
      if(bitmap.width<1000||bitmap.height<1000)
        throw new Error('透明立绘须至少 1000×1000 像素。');
      const other=Object.entries(dimensions.current).find(([id])=>id!==pose);
      if(other&&(other[1].width!==bitmap.width||other[1].height!==bitmap.height))
        throw new Error('四种姿态必须采用完全相同的画布宽高。');
      const canvas=document.createElement('canvas');
      canvas.width=64;canvas.height=64;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      if(!ctx)throw new Error('浏览器不支持透明度检查。');
      ctx.drawImage(bitmap,0,0,64,64);
      const pixels=ctx.getImageData(0,0,64,64).data;
      const analysis=inspectPoseAlpha(pixels,64,64);
      if(!analysis.ok)throw new Error(analysis.reason);
      const thumbnail=poseThumbnail(pixels,64,64);
      const nearClone=Object.entries(thumbnails.current).find(([id,other])=>
        id!==pose&&other&&poseLooksDuplicated(thumbnail,other));
      if(nearClone)throw new Error('姿态与'+
        ({idle:'待机',attentive:'倾听',warm:'亲近',guarded:'警觉'} as const)[nearClone[0] as RoomPose]+
        '几乎相同；请使用真实不同动作的透明立绘。');
      const anchor=analysis.footAnchor;
      if(!anchor)throw new Error('无法定位人物下缘脚点。');
      const shifted=Object.entries(footAnchors.current).find(([id,other])=>
        id!==pose&&other&&!poseFootAnchorsAlign(anchor,other));
      if(shifted)throw new Error('人物脚点与已上传姿态不一致，切换会发生跳动；请在同一画布对齐人物下缘。');
      const url=URL.createObjectURL(file),old=urls.current[pose];
      urls.current[pose]=url;
      dimensions.current[pose]={width:bitmap.width,height:bitmap.height};
      thumbnails.current[pose]=thumbnail;
      footAnchors.current[pose]=anchor;
      onChange(pose,url);onSelect(pose);
      if(old)releaseAfterTransition(old);
      setLoaded(current=>current.includes(pose)?current:[...current,pose]);
      setError('');
    }catch(err){setError(err instanceof Error?err.message:'无法读取透明人物素材。');}
    finally{bitmap?.close();}
  };
  const clear=()=>{
    for(const {id} of POSES){
      const url=urls.current[id];
      if(url){onChange(id,null);releaseAfterTransition(url);}
    }
    for(const {id} of POSES)delete urls.current[id];
    dimensions.current={};thumbnails.current={};footAnchors.current={};setLoaded([]);setError('');onReset();
  };
  return <section className="mt-1 border-t border-[#d9ad8752] pt-2" data-testid="room-pose-review">
    <span className="block text-[#ffd298]">透明人物候选 · 四姿态 {loaded.length}/4</span>
    <p className="text-[10px] leading-4 text-[#ead2bc]">仅本地预览；要求同画布、四角透明、人物脚点稳定、真实不同动作，不能上传带房间的合成 CG。</p>
    <div className="grid grid-cols-2 gap-1">
      {POSES.map(({id,label})=><label key={id} className="min-w-0 rounded border border-[#b18d6d88] bg-[#332138cb] px-1 py-1 text-[10px]">
        <span>{loaded.includes(id)?'✓ ':''}{label}</span>
        <input type="file" accept="image/webp" aria-label={'预览'+label+'透明立绘'}
          data-testid={'room-pose-upload-'+id} onChange={event=>void upload(id,event)}
          className="block w-full text-[9px] file:mr-1 file:border-0 file:bg-[#694258] file:text-white"/>
      </label>)}
    </div>
    <div className="mt-1 flex flex-wrap gap-1">
      {loaded.map(id=><button type="button" key={id} onClick={()=>onSelect(id)}
        data-testid={'room-pose-select-'+id}
        className="min-h-9 rounded border border-[#d6b98b90] px-2 text-[10px] hover:bg-[#533444]">
        {POSES.find(p=>p.id===id)?.label}
      </button>)}
      {loaded.length>0&&<button type="button" data-testid="room-pose-reset"
        className="min-h-9 rounded border border-[#d6b98b90] px-2 text-[10px]" onClick={clear}>清除人物预览</button>}
    </div>
    {error&&<p role="alert" data-testid="room-pose-review-error" className="text-[10px] text-[#ffc0c5]">{error}</p>}
  </section>;
}
