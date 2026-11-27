'use client';

import {useEffect,useRef,useState} from 'react';
import {projectCoverAnchor,roomHotspotPlacements} from '@/core/room-stage-layout';
import type {RoomStageSize} from '@/core/room-stage-layout';
import {R12_REPOSITORY_REVIEW_ART} from '@/lib/game/r12-scene-review-art';

/** Draft centers tied ONLY to the two existing research images.
 * Desktop visually estimated from the actual source; mobile from R12.14.
 * Never reused for a new image or promoted to a production manifest. */
const centers={
  desktop:[[.093,.56],[.235,.56],[.323,.56],[.680,.56],[.770,.56],[.918,.56]],
  mobile:[[.195,.222],[.188,.42],[.183,.608],[.804,.222],[.811,.419],[.812,.608]],
} as const;

export function R12ApartmentDoorReview({kind,mode}:{
  kind:'desktop'|'mobile';mode:'isolated'|'hud';
}){
  const stage=useRef<HTMLDivElement>(null);
  const [selected,setSelected]=useState<number|null>(null);
  const [size,setSize]=useState<RoomStageSize|null>(null);
  useEffect(()=>{
    const element=stage.current;
    if(!element)return;
    const measure=()=>{
      const {width,height}=element.getBoundingClientRect();
      if(width>0&&height>0)setSize(previous=>
        previous?.width===width&&previous.height===height?previous:{width,height});
    };
    const observer=new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return ()=>observer.disconnect();
  },[]);
  const source=R12_REPOSITORY_REVIEW_ART.apartment[kind];
  const placements=size?roomHotspotPlacements(centers[kind].map((point,index)=>({
    id:String(index),position:projectCoverAnchor(point,size,source),
  })),size):[];
  const hidden=placements.filter(point=>point.visibility!=='visible');
  return <div ref={stage} data-testid="r12-apartment-door-review"
    data-review-device={kind} data-review-mode={mode} role="group" aria-label="六门研究图交互检查"
    className="pointer-events-none absolute inset-0 z-[2]">
    {placements.map((point,index)=>{
      if(point.visibility!=='visible')return null;
      return <button key={point.id} type="button"
        data-testid={'r12-review-door-'+index}
        aria-label={String(index+1)+'号研究门位'}
        aria-pressed={selected===index}
        onClick={()=>setSelected(index)}
        style={point.position}
        className="pointer-events-auto absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-gothic-glow bg-gothic-panel/90 text-sm text-gothic-ivory shadow-lg hover:bg-gothic-wine focus-visible:outline-2 focus-visible:outline-gothic-glow aria-pressed:bg-gothic-wine">
        {String(index+1).padStart(2,'0')}
      </button>;
    })}
    {selected!==null&&<div data-testid="ga-door-review-detail" className="pointer-events-auto absolute bottom-24 left-1/2 z-10 w-max max-w-[90%] -translate-x-1/2 rounded-lg border border-gothic-brass bg-gothic-panel p-3 text-sm text-gothic-ivory"><p>研究门位 {String(selected+1).padStart(2,'0')} · 仅检查图像命中</p><button type="button" className="mt-2 min-h-11 underline" onClick={()=>setSelected(null)}>关闭门位检查</button></div>}
    {hidden.length>0&&<div role="status" className="absolute bottom-24 left-1/2 w-max max-w-[90%] -translate-x-1/2 rounded bg-gothic-panel/95 px-3 py-2 text-xs text-gothic-ivory">
      {hidden.length} 扇门超出安全点击区域，请返回 HUD 检查模式使用房间列表。
    </div>}
  </div>;
}
