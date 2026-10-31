'use client';
import type {MouseEvent} from 'react';
import type {RoomStageSize} from '@/core/room-stage-layout';
import {projectCoverAnchor} from '@/core/room-stage-layout';
import {YUESHA_REVIEW_OBJECTS,stageClickToSourceAnchor} from '@/core/room-art-review-geometry';
import type {YueshaReviewId,YueshaAnchorDraft,ReviewAnchor} from '@/core/room-art-review-geometry';

/** QA-only image-coordinate annotation. This captures clicks but never calls
 * gameplay inspect, writes to localStorage or promotes an art manifest. */
export function RoomArtAnchorEditor({stageSize,selected,draft,onPlace}:{
  stageSize:RoomStageSize|null;selected:YueshaReviewId;draft:YueshaAnchorDraft;
  onPlace:(point:ReviewAnchor)=>void;
}){
  const place=(event:MouseEvent<HTMLButtonElement>)=>{
    const rect=event.currentTarget.getBoundingClientRect();
    const point=stageClickToSourceAnchor(event.clientX-rect.left,event.clientY-rect.top,
      {width:rect.width,height:rect.height});
    if(point)onPlace(point);
  };
  return <div className="absolute inset-0 z-[20]" data-testid="room-art-anchor-editor">
    <button type="button" onClick={place}
      data-testid="room-art-anchor-canvas"
      aria-label={'在背景中选择'+YUESHA_REVIEW_OBJECTS.find(v=>v.id===selected)?.label+'的真实位置'}
      className="absolute inset-0 cursor-crosshair bg-transparent focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-gothic-glow"/>
    <div className="pointer-events-none absolute left-3 top-3 max-w-[min(75%,360px)] rounded-md border border-gothic-brass/70 bg-gothic-night/90 px-3 py-2 text-xs leading-5 text-gothic-ivory shadow-[0_10px_20px_#0009]">
      <span className="block text-gothic-glow">美术定位 · 仅候选，不保存</span>
      在绘景中点击「{YUESHA_REVIEW_OBJECTS.find(v=>v.id===selected)?.label}」的真实位置
    </div>
    {stageSize&&YUESHA_REVIEW_OBJECTS.map(({id,label})=>{
      const point=draft[id];
      if(!point)return null;
      const pos=projectCoverAnchor(point,stageSize);
      return <span key={id} data-testid={'room-art-anchor-marker-'+id}
        className={'pointer-events-none absolute z-[1] flex min-h-11 -translate-x-1/2 -translate-y-1/2 items-center rounded-md border px-2 text-[11px] shadow-[0_6px_18px_#000b] '+
          (selected===id?'border-gothic-glow bg-gothic-wine text-gothic-ivory':'border-gothic-brass bg-gothic-night/90 text-gothic-champagne')}
        style={{left:pos.left,top:pos.top}}>
        {label}
      </span>;
    })}
  </div>;
}
