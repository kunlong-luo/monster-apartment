'use client';
import {useEffect,useState} from 'react';
import type {RefObject} from 'react';
import type {RoomStageSize} from '@/core/room-stage-layout';
/** Shared measurement keeps focus and markers aligned after modal resize. */
export function useRoomStageSize(stageRef:RefObject<HTMLDivElement|null>):RoomStageSize|null{
  const [size,setSize]=useState<RoomStageSize|null>(null);
  useEffect(()=>{
    const stage=stageRef.current;
    if(!stage)return;
    const measure=()=>{
      const rect=stage.getBoundingClientRect();
      const width=Math.round(rect.width),height=Math.round(rect.height);
      if(width<=0||height<=0)return;
      setSize(prev=>prev?.width===width&&prev.height===height?prev:{width,height});
    };
    measure();
    const observer=new ResizeObserver(measure);
    observer.observe(stage);
    return ()=>observer.disconnect();
  },[stageRef]);
  return size;
}
