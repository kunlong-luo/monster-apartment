'use client';

import type {ImageProps} from 'next/image';
import type {ReactNode} from 'react';
import {useSearchParams} from 'next/navigation';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {createPortal} from 'react-dom';
import {ReliableImage} from './reliable-image';
import {R12ApprovedScenePicture} from './r12-approved-scene-picture';
import {approvedR12Scene} from '@/lib/game/r12-scene-assets';
import type {R12SceneArea} from '@/lib/game/r12-scene-assets';
import {R12_REPOSITORY_REVIEW_ART} from '@/lib/game/r12-scene-review-art';
import {siteAssetUrl} from '@/lib/game/site-asset-url';

type Props={area:R12SceneArea;fallbackSrc:ImageProps['src']};

function fallbackUrl(src:ImageProps['src']):string{
  return typeof src==='string'?src:'src' in src?src.src:src.default.src;
}

/** Environment art is separate from all gameplay, dialogs and hit targets.
 * The existing backdrop is preserved until an approved desktop AND mobile
 * painting is present. Failed approved originals reveal a neutral backdrop.
 */
type LocalPreview={url:string;name:string;width:number;height:number;origin?:'repo'};
type PreviewKind='desktop'|'mobile';
type PendingProbe={url:string;image:HTMLImageElement};
type PreviewResources={
  pending:Record<PreviewKind,PendingProbe|null>;
  active:Record<PreviewKind,string|null>;
};
const previewKinds=['desktop','mobile'] as const;
function cancelPendingProbe(resources:PreviewResources,kind:PreviewKind){
  const pending=resources.pending[kind];
  if(!pending)return;
  resources.pending[kind]=null;
  pending.image.onload=null;
  pending.image.onerror=null;
  URL.revokeObjectURL(pending.url);
}
function releaseActivePreview(resources:PreviewResources,kind:PreviewKind){
  const url=resources.active[kind];
  resources.active[kind]=null;
  if(url)URL.revokeObjectURL(url);
}
function releasePreviewResources(resources:PreviewResources){
  for(const kind of previewKinds){
    cancelPendingProbe(resources,kind);
    releaseActivePreview(resources,kind);
  }
}
const serverMobileSnapshot=()=>false;
const subscribeMobileViewport=(update:()=>void)=>{
  const query=window.matchMedia('(max-width:700px)');
  query.addEventListener('change',update);
  return ()=>query.removeEventListener('change',update);
};
const readMobileViewport=()=>window.matchMedia('(max-width:700px)').matches;


/** Use the exact production image/retry path for opt-in local review as well.
 * A failed scene must not silently become the unrelated, blurry lobby image.
 * On two errors, reveal a clear native fallback plane behind the real HUD.
 */
type BackdropArtKind='desktop'|'mobile'|'local-review';
function R12VerifiedBackdropImage({src,kind,onDecoded,onFailed}:{src:string;kind:BackdropArtKind;onDecoded?:()=>void;onFailed?:()=>void}){
  const [failures,setFailures]=useState(0);
  const responsiveClass=kind==='desktop'?' max-[700px]:hidden':
    kind==='mobile'?' hidden max-[700px]:block':'';
  if(failures>=2)return <div aria-hidden="true"
    data-r12-art-failed={kind}
    className={'pointer-events-none absolute inset-0'+responsiveClass}
    style={{background:'linear-gradient(125deg,#21182a,#100e1a 65%,#2b1930)'}}/>;
  return <ReliableImage src={src} fill unoptimized sizes="100vw" alt=""
    data-r12-art-image={kind}
    className={'pointer-events-none absolute inset-0 h-full w-full object-cover'+responsiveClass}
    onLoad={onDecoded} onError={()=>{onFailed?.();setFailures(count=>Math.min(2,count+1));}}/>;
}

/** Opt-in, entirely local reviewer surface. User-selected images never leave
 * the browser, and never change the production manifest or stored game data.
 */
type BackdropProps=Props&{className:string;testId?:string;renderDoorReview?:(kind:PreviewKind)=>ReactNode};

/** The URL owns review-mode lifetime. Remounting the local preview state on
 * opt-in changes also releases any object URLs via existing cleanup effects.
 * No effect-driven setState reset (which violates react-hooks lint rules).
 */
export function R12SceneBackdrop(props:BackdropProps){
  const reviewMode=useSearchParams().get('r12-art-review')==='1';
  return <R12SceneBackdropView {...props} reviewMode={reviewMode}
    key={reviewMode?'research-opt-in':'player-view'}/>;
}

function R12SceneBackdropView({area,fallbackSrc,className,testId,reviewMode,renderDoorReview}:
  BackdropProps&{reviewMode:boolean}){
  const sources=approvedR12Scene(area);
  const mobileViewport=useSyncExternalStore(
    subscribeMobileViewport,readMobileViewport,serverMobileSnapshot);
  const [desktopPreview,setDesktopPreview]=useState<LocalPreview|null>(null);
  const [mobilePreview,setMobilePreview]=useState<LocalPreview|null>(null);
  const [message,setMessage]=useState('');
  const [decodedUrl,setDecodedUrl]=useState<string|null>(null);
  const [doorReview,setDoorReview]=useState(false);
  // Own pending AND accepted blob URLs independently of React render timing.
  // Viewport switches keep both accepted images alive; reset/repo/unmount
  // invalidate pending probes before they can publish stale state.
  const resourcesRef=useRef<PreviewResources>({
    pending:{desktop:null,mobile:null},active:{desktop:null,mobile:null},
  });
  useEffect(()=>{
    const resources=resourcesRef.current;
    return ()=>releasePreviewResources(resources);
  },[]);
  // If no independent portrait has been chosen, the desktop source can still
  // be cropped for layout preview — explicitly flagged as NOT mobile approval.
  const preview=reviewMode?(mobileViewport?(mobilePreview??desktopPreview):desktopPreview):null;
  const portraitMissing=reviewMode&&mobileViewport&&!!desktopPreview&&!mobilePreview;
  // The matching S05/S06 banner must preview the same original image rather
  // than continuing to show the unrelated 360px workshop placeholder.
  useEffect(()=>{
    if(!reviewMode)return;
    const notify=(url:string|null)=>{
      window.dispatchEvent(new CustomEvent('r12:local-art-change',{detail:{area,url}}));
    };
    notify(preview?.url??null);
    return ()=>notify(null);
  },[area,preview,reviewMode]);
  const chooseFile=(file:File|undefined,kind:PreviewKind)=>{
    if(!file)return;
    setDoorReview(false);
    const resources=resourcesRef.current;
    cancelPendingProbe(resources,kind);
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>20*1024*1024){
      setMessage('仅支持 20 MB 内的 PNG、JPEG 或 WebP 环境原图。');
      return;
    }
    const url=URL.createObjectURL(file);
    const probe=new window.Image();
    const pending={url,image:probe};
    resources.pending[kind]=pending;
    probe.onload=()=>{
      if(resources.pending[kind]!==pending)return;
      if(!probe.naturalWidth||!probe.naturalHeight){
        cancelPendingProbe(resources,kind);
        setMessage('图片无法读取，请更换有效的原始图片。');
        return;
      }
      // Transfer ownership from pending probe to accepted preview. Its URL
      // remains available until a successful replacement, reset or unmount.
      resources.pending[kind]=null;
      probe.onload=null;
      probe.onerror=null;
      releaseActivePreview(resources,kind);
      resources.active[kind]=url;
      const next={url,name:file.name,width:probe.naturalWidth,height:probe.naturalHeight};
      if(kind==='desktop')setDesktopPreview(next);
      else setMobilePreview(next);
      setMessage('');
    };
    probe.onerror=()=>{
      if(resources.pending[kind]!==pending)return;
      cancelPendingProbe(resources,kind);
      setMessage('图片解码失败；原画没有被替换。');
    };
    probe.src=url;
  };
  // Only an explicit click in opt-in review mode loads these existing
  // Git-reviewed candidates; never treat a research WebP as production.
  const previewRepositoryStudy=()=>{
    setDoorReview(false);
    releasePreviewResources(resourcesRef.current);
    const pair=R12_REPOSITORY_REVIEW_ART[area];
    setDesktopPreview({url:siteAssetUrl(pair.desktop.path),
      name:'仓库研究稿 · PC',width:pair.desktop.width,
      height:pair.desktop.height,origin:'repo'});
    setMobilePreview({url:siteAssetUrl(pair.mobile.path),
      name:'仓库研究稿 · 手机',width:pair.mobile.width,
      height:pair.mobile.height,origin:'repo'});
    setMessage('');
  };
  const showProduction=!!sources&&!preview;
  const previewKind=mobileViewport&&!!mobilePreview?'mobile':'desktop';
  // R12.30: 1648x928 at DPR2 needs native 3296x1856 before cover crop.
  // Use a 3840x2160 desktop review floor with composition headroom;
  // phones must use separately composed 1080x1920 originals.
  const canReviewDoors=area==='apartment'&&!!renderDoorReview&&preview?.origin==='repo'&&preview.url===decodedUrl;
  const inspectDoors=canReviewDoors&&doorReview;
  const targetWidth=previewKind==='mobile'?1080:3840;
  const targetHeight=previewKind==='mobile'?1920:2160;
  const hasPixels=!!preview&&preview.width>=targetWidth&&preview.height>=targetHeight;
  return <>
    <div className={className} aria-hidden="true"
      data-testid={testId}
      data-r12-scene-art={preview?'local-review':sources?'production':'legacy'}
      data-r12-review-origin={preview?.origin??'none'}
      style={sources||preview?undefined:
        {backgroundImage:'url('+JSON.stringify(fallbackUrl(fallbackSrc))+')'}}>
      {preview&&<R12VerifiedBackdropImage key={preview.url}
        src={preview.url} kind="local-review" onDecoded={()=>setDecodedUrl(preview.url)}
        onFailed={()=>setDecodedUrl(null)}/>}
      {preview?.origin==='repo'&&<span data-testid="r12-repository-study-watermark"
        className="pointer-events-none absolute left-3 top-3 z-[3] rounded border border-amber-300/70 bg-[#210c18e6] px-3 py-1 text-xs font-semibold tracking-wide text-amber-100">
        仓库研究图 · 未批准 · 不作正式原画
      </span>}
      {showProduction&&<R12ApprovedScenePicture
        key={sources.desktop+'|'+sources.mobile} kind="backdrop"
        desktop={sources.desktop} mobile={sources.mobile}/>}

    </div>
    {inspectDoors&&renderDoorReview?.(previewKind)}
    {reviewMode&&createPortal(inspectDoors?
      <aside data-testid="r12-local-art-review" aria-label="六门研究图交互检查"
        className="fixed bottom-3 right-4 z-[10000] rounded-lg border border-gothic-brass bg-gothic-panel/95 p-2 text-xs text-gothic-ivory shadow-lg">
        <p>未批准 · 六门门位检查</p>
        <button type="button" data-testid="r12-exit-door-review" onClick={()=>setDoorReview(false)}
          className="mt-1 min-h-11 rounded border border-gothic-brass px-3">返回 HUD 检查</button>
      </aside>:
      <aside data-testid="r12-local-art-review" aria-label="R12 本地环境画审核"
        className="fixed bottom-20 right-4 z-[10000] w-[min(330px,calc(100vw-32px))] rounded-xl border border-[#c8a578] bg-[#140e1af0] p-3 text-[#f4dfbf] shadow-2xl backdrop-blur-md">
        <p className="text-xs font-semibold tracking-wider">R12 · {area} 本地场景审稿</p>
        <p className="mt-1 text-xs text-[#d8bf9f]">只在当前浏览器显示。不会上传、保存或发布图片。</p>
        <button type="button" data-testid="r12-preview-repository-scene"
          onClick={previewRepositoryStudy}
          className="mt-3 w-full rounded-md border border-[#d1ad75] bg-[#4c2c33]/65 px-3 py-2 text-sm font-semibold hover:bg-[#6b3b46]/80">
          预览仓库已有 PC／手机独立场景研究图
        </button>
        <p className="mt-1 text-xs text-[#ffd29b]">
          仅用于审查构图与 HUD，非 4K 原画；不晋级、不保存、普通玩家不可见。
        </p>
        {canReviewDoors&&<button type="button" data-testid="r12-start-door-review" onClick={()=>setDoorReview(true)}
          className="mt-2 min-h-11 w-full rounded-md border border-gothic-brass px-3 text-sm">检查六扇实体门</button>}
        <label className="mt-3 block cursor-pointer rounded-md border border-[#b99c7d] px-3 py-2 text-center text-sm hover:bg-[#61402a]/40">
          选择 PC 横版原图
          <input data-testid="r12-local-art-file" type="file" accept="image/png,image/jpeg,image/webp"
            className="sr-only" onChange={event=>{
              chooseFile(event.currentTarget.files?.[0],'desktop');
              event.currentTarget.value='';
            }}/>
        </label>
        <label className="mt-2 block cursor-pointer rounded-md border border-[#b99c7d] px-3 py-2 text-center text-sm hover:bg-[#61402a]/40">
          选择手机独立竖版原图
          <input data-testid="r12-local-art-file-mobile" type="file" accept="image/png,image/jpeg,image/webp"
            className="sr-only" onChange={event=>{
              chooseFile(event.currentTarget.files?.[0],'mobile');
              event.currentTarget.value='';
            }}/>
        </label>
        {(desktopPreview||mobilePreview)&&<div className="mt-2 grid gap-1 text-xs" aria-live="polite">
          <p className="break-all" data-testid="r12-local-desktop-meta">
            PC：{desktopPreview?desktopPreview.name+' · '+desktopPreview.width+'×'+desktopPreview.height:'未选择'}
          </p>
          <p className="break-all" data-testid="r12-local-mobile-meta">
            手机：{mobilePreview?mobilePreview.name+' · '+mobilePreview.width+'×'+mobilePreview.height:'未选择'}
          </p>
          {preview&&<p className="break-all" data-testid="r12-local-active">
            当前预览：{previewKind==='mobile'?'手机独立原图':'PC 横版原图'} · {preview.width}×{preview.height}
          </p>}
          {portraitMissing&&<p className="text-[#ffd29b]">
            手机暂无独立竖图，正在查看 PC 原图裁切；不得作为手机美术验收。
          </p>}
          {preview&&<p data-testid="r12-local-pixel-gate"
            data-required-resolution={targetWidth+'x'+targetHeight}
            data-pixel-pass={hasPixels?'true':'false'}
            className={hasPixels?'text-[#c4e3b2]':'text-[#ffd29b]'}>
            {hasPixels?'达到原生 '+targetWidth+'×'+targetHeight+' 尺寸门槛；仍需人工审核与 DPI/裁切检查':
              '未达到 '+targetWidth+'×'+targetHeight+' 原生像素门槛，仅供构图预览；禁止插值放大晋级'}
          </p>}
          <button type="button" onClick={()=>{
            setDoorReview(false);
            setDecodedUrl(null);
            releasePreviewResources(resourcesRef.current);
            setDesktopPreview(null);setMobilePreview(null);setMessage('');
          }} className="mt-2 rounded border border-[#b99c7d] px-3 py-1">
            恢复原场景
          </button>
        </div>}
        {message&&<p role="alert" className="mt-2 text-xs text-[#ffd29b]">{message}</p>}
      </aside>,document.body)}
  </>;
}

/** A failed original must never expose the legacy 360×228 workshop thumbnail.
 * Retry once via ReliableImage; then fall back to the crisp built-in panel,
 * rather than silently restoring the blurred, wrong-location raster.
 */
type HeroArtKind='desktop'|'mobile'|'local-review';
function R12VerifiedHeroImage({src,alt,kind}:{
  src:string;alt:string;kind:HeroArtKind;
}){
  const [failures,setFailures]=useState(0);
  const responsiveClass=kind==='desktop'?' max-[700px]:hidden':
    kind==='mobile'?' hidden max-[700px]:block':'';
  if(failures>=2)return <div aria-hidden="true"
    data-r12-hero-art={kind+'-failed'}
    className={'mw-world-hero-pending'+responsiveClass}/>;

  return <ReliableImage src={src} fill unoptimized
    sizes={kind==='mobile'?'100vw':'(max-width:760px) 100vw, 1200px'}
    alt={alt} data-r12-hero-art={kind}
    className={'mw-world-hero-painting'+responsiveClass}
    onError={()=>setFailures(count=>Math.min(2,count+1))}/>;
}

/** The reviewed independent environment will replace this placeholder only
 * after both source images are admitted. There is no low-resolution fallback. */
export function R12SceneHeroPainting({area,alt}:{
  area:R12SceneArea;alt:string;
}){
  const [localPreview,setLocalPreview]=useState<string|null>(null);
  useEffect(()=>{
    const onReview=(event:Event)=>{
      const detail=(event as CustomEvent<{area:R12SceneArea;url:string|null}>).detail;
      if(detail?.area===area)setLocalPreview(detail.url);
    };
    window.addEventListener('r12:local-art-change',onReview);
    return ()=>window.removeEventListener('r12:local-art-change',onReview);
  },[area]);
  const sources=approvedR12Scene(area);
  if(localPreview)return <R12VerifiedHeroImage key={localPreview}
    src={localPreview} alt={alt} kind="local-review"/>;
  if(!sources)return <div aria-hidden="true"
    data-r12-hero-art="pending" className="mw-world-hero-pending"/>;

  return <R12ApprovedScenePicture key={sources.desktop+'|'+sources.mobile}
    kind="hero" desktop={sources.desktop} mobile={sources.mobile} alt={alt}/>;
}
