'use client';
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {workshopAssetRoot} from '@/lib/moonwork/asset-root';
import gothicHero from '../../../public/lobby-hero.webp';

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
  const router=useRouter();
  const [error,setError]=useState('');
  useEffect(()=>{
    const root=host.current?.querySelector<HTMLElement>('#root');
    if(!root)return;
    root.classList.add('gothic-workshop');
    root.style.backgroundImage='linear-gradient(110deg,#0c0712be,#0d0815d5),url('+gothicHero.src+')';
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
      if(cancelled)cleanup();else dispose=cleanup;
    }).catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:String(e));});
    return ()=>{
      cancelled=true;
      root.removeEventListener('click',onGate);
      style.remove();
      dispose?.();
    };
  },[router]);
  return <div ref={host} data-testid="next-workshop-shell">
    <div dangerouslySetInnerHTML={{__html:markup}}/>
    {error&&<p role="alert" className="mw-runtime-error">
      工坊画面未能启动：{error}。请检查浏览器 WebGL 支持并刷新。</p>}
  </div>;
}
