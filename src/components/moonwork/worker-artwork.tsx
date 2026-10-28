'use client';
import Image from 'next/image';
import {useEffect,useRef,useState} from 'react';
import {workshopAssetRoot} from '@/lib/moonwork/asset-root';
import {drawCreature} from '../../../v2/src/worker-canvas';
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
  const [approved,setApproved]=useState<{id:WorkerId;src:string}|null>(null);
  const painting=approved?.id===id?approved.src:null;
  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const pose=drawCreature(id,frame);
    canvas.width=pose.width;
    canvas.height=pose.height;
    canvas.getContext('2d')?.drawImage(pose,0,0);
  },[id,frame]);
  useEffect(()=>{
    let active=true;
    const url=new URL(window.location.href);
    url.pathname=url.pathname.replace(
      /\/(town|orders|characters|warehouse|apartment)\/?$/, '/workshop/');
    const src=new URL('assets/workers/'+id+'.webp',workshopAssetRoot(url.href)).href;
    const probe=new window.Image();
    probe.onload=()=>{
      if(active&&probe.naturalWidth>=256&&probe.naturalHeight>=256)setApproved({id,src});
    };
    probe.onerror=()=>{};
    probe.src=src;
    return()=>{active=false;probe.onload=null;probe.onerror=null;};
  },[id]);

  return <span className={'worker-artwork relative block size-full overflow-hidden '+
    (compact?'worker-artwork--compact ':'')+'worker-artwork--'+id}
    role="img" aria-label={name+'的透明角色绘景'}
    data-art-source={painting?'painted-transparent':'hi-dpi-transparent'}>
    <canvas ref={canvasRef} aria-hidden="true" width={498} height={498}
      className={'absolute inset-0 size-full object-contain object-center '+(painting?'hidden':'')}/>
    {painting&&<Image src={painting} fill unoptimized
      sizes={compact?'44px':'(max-width: 620px) 42vw, 350px'}
      alt="" draggable={false} className="object-contain object-bottom"/>}
  </span>;
}
