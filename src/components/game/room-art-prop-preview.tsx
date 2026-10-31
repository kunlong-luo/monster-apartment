'use client';
import Image from 'next/image';
import {YUESHA_REVIEW_OBJECTS} from '@/core/room-art-review-geometry';
import type {YueshaAnchorDraft} from '@/core/room-art-review-geometry';
import {roomPropPlacement,YUESHA_PROP_SIZE} from '@/core/room-art-prop-composition';
import type {PropArtworkDraft} from '@/core/room-art-prop-composition';
import type {RoomStageSize} from '@/core/room-stage-layout';

/** Non-interactive artifact painting layers, not invented gameplay objects. */
export function RoomArtPropPreview({stageSize,anchors,art}:{
  stageSize:RoomStageSize|null;anchors:YueshaAnchorDraft;art:PropArtworkDraft;
}){
  if(!stageSize)return null;
  return <div className="pointer-events-none absolute inset-0 z-[6] overflow-hidden"
    data-testid="room-art-prop-preview" aria-hidden="true">
    {YUESHA_REVIEW_OBJECTS.map(({id})=>{
      const point=anchors[id],piece=art[id];
      if(!point||!piece)return null;
      const box=roomPropPlacement(point,stageSize,YUESHA_PROP_SIZE[id]);
      return <div key={id} data-testid={'room-art-prop-'+id}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_10px_12px_#0b07139c]"
        style={{left:box.left,top:box.top,width:box.width}}>
        <Image src={piece.url} unoptimized width={piece.width} height={piece.height}
          alt="" draggable={false} className="block h-auto w-full object-contain"/>
      </div>;
    })}
  </div>;
}
