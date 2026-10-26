'use client';
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {workshopAssetRoot} from '@/lib/moonwork/asset-root';
import {GothicDock,GothicResourcePill} from '@/components/game/gothic-hud';
import {WORLD_NAV} from './world-navigation';
import {useWorkshopWorld} from './world-save-react';
import {CHANGE_EVENT} from '@/lib/moonwork/world-store';
import {WorkshopReactControls} from './workshop-react-controls';

declare global {
  interface Window {
    MoonworkRuntime?:{
      mountWorkshopGame:(root:HTMLElement,assetBase?:string)=>Promise<()=>void>
    };
    __moonworkRuntimeLoading?:Promise<void>;
  }
}
function assetRoot(){
  return workshopAssetRoot(window.location.href);
}
function loadRuntime(base:string){
  if(window.MoonworkRuntime)return Promise.resolve();
  if(window.__moonworkRuntimeLoading)return window.__moonworkRuntimeLoading;
  const script=document.createElement('script');
  script.src=new URL('assets/workshop-runtime.js',base).href;
  script.async=true;
  const loaded=new Promise<void>((resolve,reject)=>{
    script.onload=()=>window.MoonworkRuntime?resolve():
      reject(Error('The PixiJS runtime did not expose a mount function.'));
    script.onerror=()=>reject(Error('The workshop script could not be loaded.'));
  });
  window.__moonworkRuntimeLoading=loaded.catch(error=>{
    window.__moonworkRuntimeLoading=undefined;
    script.remove();
    throw error;
  });
  document.head.appendChild(script);
  return window.__moonworkRuntimeLoading;
}
export function WorkshopClient({markup}:{markup:string}){
  const host=useRef<HTMLDivElement>(null);
  const [gameRoot,setGameRoot]=useState<HTMLElement|null>(null);
  const router=useRouter();
  const game=useWorkshopWorld();
  const [error,setError]=useState('');
  useEffect(()=>{
    const root=host.current?.querySelector<HTMLElement>('#root');
    if(!root)return;
    root.dataset.reactControls='true';
    root.classList.add('gothic-workshop');
    root.style.backgroundImage='linear-gradient(110deg,#0c0712be,#0d0815d5),url('+'../lobby-hero.webp'+')';
    const base=assetRoot();
    const style=document.createElement('link');
    style.rel='stylesheet';style.href=new URL('assets/workshop.css',base).href;
    let cancelled=false;
    let dispose:(()=>void)|undefined;
    const onGate=(event:MouseEvent)=>{
      const target=event.target;
      if(!(target instanceof Element))return;
      const area=target.closest<HTMLAnchorElement>('[data-world-route]');
      const name=area?.dataset.worldRoute;
      if(name&&['town','orders','characters','warehouse'].includes(name)){
        event.preventDefault();
        router.push('/'+name+'/');
      }else if(target.closest('.world-gate')){
        event.preventDefault();
        router.push('/town/');
      }
    };
    root.addEventListener('click',onGate);
    // Static markup keeps relative asset names for standalone compatibility.
    // Rebase the portrait only for the local two-server development setup.
    const portrait=root.querySelector<HTMLImageElement>('.patron-portrait');
    if(portrait)portrait.src=new URL('assets/moonveil-portrait.avif',base).href;
    const cssReady=new Promise<void>((resolve,reject)=>{
      style.onload=()=>resolve();
      style.onerror=()=>reject(Error('Workshop styling could not be loaded.'));
    });
    document.head.appendChild(style);
    void Promise.all([cssReady,loadRuntime(base)]).then(async()=>{
      if(cancelled)return;
      const runtime=window.MoonworkRuntime;
      if(!runtime)throw Error('PixiJS runtime is missing.');
      const cleanup=await runtime.mountWorkshopGame(root,base);
      if(cancelled)cleanup();else{
        dispose=cleanup;
        // Listen to ephemeral Pixi selection events only after the engine
        // and its delegated native click listener are fully installed.
        setGameRoot(root);
        // The first factory initializes its save in Pixi; publish it to React.
        window.dispatchEvent(new Event(CHANGE_EVENT));
      }
    }).catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:String(e));});
    return ()=>{
      cancelled=true;
      root.removeEventListener('click',onGate);
      style.remove();
      dispose?.();
    };
  },[router]);
  return <div ref={host} data-testid="next-workshop-shell"
    className="gothic-workshop-shell relative isolate min-h-dvh overflow-hidden">
    <div dangerouslySetInnerHTML={{__html:markup}}/>
    <WorkshopReactControls root={gameRoot} world={game}/>
    <div data-testid="workshop-react-hud"
      className="pointer-events-none absolute right-14 top-2 z-[22] flex items-start gap-1.5 sm:right-[68px] sm:top-3 sm:gap-2"
      aria-label="工坊当前资源">
      <span className="pointer-events-auto hidden sm:inline-flex">
        <GothicResourcePill symbol="☾" amount={game?.day??1} label="工坊天数" testId="v2-day"/>
      </span>
      <span className="pointer-events-auto">
        <GothicResourcePill symbol="✦" amount={game?.coins??100} label="星币" testId="v2-coins"/>
      </span>
      <span className="pointer-events-auto">
        <GothicResourcePill symbol="◆" amount={game?.warehouse.core??0} label="晶核"/>
      </span>
    </div>
    <GothicDock label="月光工坊世界" activeHref="/workshop/"
      testId="v2-world-nav"
      items={WORLD_NAV.map(item=>({href:item.href,icon:item.glyph,
        label:item.label,ariaLabel:item.full}))}/>
    {error&&<p role="alert" className="mw-runtime-error">
      工坊画面未能启动：{error}。请检查浏览器 WebGL 支持并刷新。</p>}
  </div>;
}
