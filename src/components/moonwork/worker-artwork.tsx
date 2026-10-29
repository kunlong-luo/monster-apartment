'use client';
import {useEffect,useRef} from 'react';
import {drawHumanoid} from '../../../v2/src/worker-canvas';
import type {WorkerId} from '../../../v2/src/workshop-model';

/** Both the gallery and the shift controls render the same identity and
 * the same transparent 498px Canvas frame as the Pixi stage. The old, tiny
 * three-character AVIF is no longer shown at any size. */
export function WorkerArtwork({
  id,name,frame=0,compact=false,
}:{
  id:WorkerId;name:string;frame?:number;compact?:boolean;
}){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const pose=drawHumanoid(id,frame);
    canvas.width=pose.width;
    canvas.height=pose.height;
    canvas.getContext('2d')?.drawImage(pose,0,0);
  },[id,frame]);

  return <span className={'worker-artwork relative block size-full overflow-hidden '+
    (compact?'worker-artwork--compact ':'')+'worker-artwork--'+id}
    role="img" aria-label={name+'的成年人物绘景'}
    data-figure-kind="humanoid" data-art-source="hi-dpi-transparent-human">
    <canvas ref={canvasRef} aria-hidden="true" width={498} height={498}
      className="absolute inset-0 size-full object-contain object-center"/>
  </span>;
}
