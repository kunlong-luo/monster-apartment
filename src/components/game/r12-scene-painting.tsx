'use client';

import type {ImageProps} from 'next/image';
import {useEffect,useState,useSyncExternalStore} from 'react';
import {createPortal} from 'react-dom';
import {ReliableImage} from './reliable-image';
import {approvedR12Scene} from '@/lib/game/r12-scene-assets';
import type {R12SceneArea} from '@/lib/game/r12-scene-assets';

type Props={area:R12SceneArea;fallbackSrc:ImageProps['src']};

function fallbackUrl(src:ImageProps['src']):string{
  return typeof src==='string'?src:'src' in src?src.src:src.default.src;
}

/** Environment art is separate from all gameplay, dialogs and hit targets.
 * The existing backdrop is preserved until an approved desktop AND mobile
 * painting is present. ReliableImage falls back on a real loading error.
 */
type LocalPreview={url:string;name:string;width:number;height:number};
const noSubscription=()=>()=>{};
const readReviewQuery=()=>new URLSearchParams(window.location.search).get('r12-art-review')==='1';
const serverReviewQuery=()=>false;

/** Opt-in, entirely local reviewer surface. User-selected images never leave
 * the browser, and never change the production manifest or stored game data.
 */
export function R12SceneBackdrop({area,fallbackSrc,className,testId}:Props&{
  className:string;testId?:string;
}){
  const sources=approvedR12Scene(area);
  const reviewMode=useSyncExternalStore(noSubscription,readReviewQuery,serverReviewQuery);
  const [preview,setPreview]=useState<LocalPreview|null>(null);
  const [message,setMessage]=useState('');
  useEffect(()=>()=>{
    if(preview)URL.revokeObjectURL(preview.url);
  },[preview]);
  const chooseFile=(file:File|undefined)=>{
    if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>20*1024*1024){
      setMessage('仅支持 20 MB 内的 PNG、JPEG 或 WebP 环境原图。');
      return;
    }
    const url=URL.createObjectURL(file);
    const probe=new window.Image();
    probe.onload=()=>{
      if(!probe.naturalWidth||!probe.naturalHeight){
        URL.revokeObjectURL(url);
        setMessage('图片无法读取，请更换有效的原始图片。');
        return;
      }
      setPreview({url,name:file.name,width:probe.naturalWidth,height:probe.naturalHeight});
      setMessage('');
    };
    probe.onerror=()=>{
      URL.revokeObjectURL(url);
      setMessage('图片解码失败；原画没有被替换。');
    };
    probe.src=url;
  };
  const showProduction=!!sources&&!preview;
  const isPortrait=preview?preview.height>preview.width:false;
  const targetWidth=isPortrait?1080:2560;
  const targetHeight=isPortrait?1920:1440;
  const hasPixels=preview?preview.width>=targetWidth&&preview.height>=targetHeight:false;
  return <>
    <div className={className} aria-hidden="true"
      data-testid={testId}
      data-r12-scene-art={preview?'local-review':sources?'production':'legacy'}
      style={preview?{backgroundImage:'url('+JSON.stringify(preview.url)+')'}:
        sources?undefined:{backgroundImage:'url('+JSON.stringify(fallbackUrl(fallbackSrc))+')'}}>
      {showProduction&&<>
        <ReliableImage src={sources.desktop} fallbackSrc={fallbackSrc}
          fill unoptimized sizes="100vw" alt=""
          data-r12-art-image="desktop"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover max-[700px]:hidden"/>
        <ReliableImage src={sources.mobile} fallbackSrc={fallbackSrc}
          fill unoptimized sizes="100vw" alt=""
          data-r12-art-image="mobile"
          className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover max-[700px]:block"/>
      </>}
    </div>
    {reviewMode&&createPortal(
      <aside data-testid="r12-local-art-review" aria-label="R12 本地环境画审核"
        className="fixed bottom-20 right-4 z-[10000] w-[min(330px,calc(100vw-32px))] rounded-xl border border-[#c8a578] bg-[#140e1af0] p-3 text-[#f4dfbf] shadow-2xl backdrop-blur-md">
        <p className="text-xs font-semibold tracking-wider">R12 · {area} 本地场景审稿</p>
        <p className="mt-1 text-xs text-[#d8bf9f]">只在当前浏览器显示。不会上传、保存或发布图片。</p>
        <label className="mt-3 block cursor-pointer rounded-md border border-[#b99c7d] px-3 py-2 text-center text-sm hover:bg-[#61402a]/40">
          选择原始 PNG / WebP
          <input data-testid="r12-local-art-file" type="file" accept="image/png,image/jpeg,image/webp"
            className="sr-only" onChange={event=>{
              chooseFile(event.currentTarget.files?.[0]);
              event.currentTarget.value='';
            }}/>
        </label>
        {preview&&<div className="mt-2 text-xs" aria-live="polite">
          <p className="break-all">{preview.name} · {preview.width}×{preview.height}</p>
          <p className={hasPixels?'text-[#c4e3b2]':'text-[#ffd29b]'}>
            {hasPixels?'尺寸达到本画幅最低像素要求；仍需人工审核':
              '低于当前画幅的原生最低尺寸，仅供构图预览'}
          </p>
          <button type="button" onClick={()=>setPreview(null)}
            className="mt-2 rounded border border-[#b99c7d] px-3 py-1">恢复原场景</button>
        </div>}
        {message&&<p role="alert" className="mt-2 text-xs text-[#ffd29b]">{message}</p>}
      </aside>,document.body)}
  </>;
}

/** No 360×228 workshop prototype is rendered once this scene is promoted.
 * The original painting remains a safe retry/fallback during asset errors.
 */
export function R12SceneHeroPainting({area,fallbackSrc,alt}:Props&{alt:string}){
  const sources=approvedR12Scene(area);
  if(!sources)return <ReliableImage src={fallbackSrc} fill unoptimized
    sizes="(max-width:760px) 100vw, 1200px" alt={alt}
    data-r12-hero-art="legacy" className="mw-world-hero-painting"/>;

  return <>
    <ReliableImage src={sources.desktop} fallbackSrc={fallbackSrc}
      fill unoptimized sizes="(max-width:760px) 100vw, 1200px" alt={alt}
      data-r12-hero-art="desktop"
      className="mw-world-hero-painting max-[700px]:hidden"/>
    <ReliableImage src={sources.mobile} fallbackSrc={fallbackSrc}
      fill unoptimized sizes="100vw" alt={alt}
      data-r12-hero-art="mobile"
      className="mw-world-hero-painting hidden max-[700px]:block"/>
  </>;
}
