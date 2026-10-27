'use client';
import {useEffect,useRef} from 'react';

declare global {
  interface Window {
    GothicAtmosphereRuntime?:{mountAtmosphere:(host:HTMLElement)=>Promise<()=>void>};
    __gothicAtmosphereLoading?:Promise<void>;
  }
}

/**
 * PixiJS is bundled only in the v2 sidecar. The React/Tailwind HUD never imports
 * Pixi into the Next bundle. If WebGL is unavailable, the painting remains intact.
 */
function runtimeUrl(){
  const url=new URL(window.location.href);
  if((url.hostname==='localhost'||url.hostname==='127.0.0.1')&&url.port==='3000')
    return 'http://127.0.0.1:3901/assets/gothic-atmosphere.js';
  const base=url.pathname.startsWith('/monster-apartment')
    ?'/monster-apartment/':'/';
  return url.origin+base+'workshop/assets/gothic-atmosphere.js';
}
function loadAtmosphere(){
  if(window.GothicAtmosphereRuntime)return Promise.resolve();
  if(window.__gothicAtmosphereLoading)return window.__gothicAtmosphereLoading;
  const script=document.createElement('script');
  script.async=true;
  script.src=runtimeUrl();
  const ready=new Promise<void>((resolve,reject)=>{
    script.onload=()=>window.GothicAtmosphereRuntime?resolve():
      reject(Error('The Gothic Pixi runtime was not initialized.'));
    script.onerror=()=>reject(Error('Gothic Pixi assets are unavailable.'));
  });
  window.__gothicAtmosphereLoading=ready.catch(error=>{
    window.__gothicAtmosphereLoading=undefined;
    script.remove();
    throw error;
  });
  document.head.appendChild(script);
  return window.__gothicAtmosphereLoading;
}
export function GothicAtmosphere({paused=false}:{paused?:boolean}){
  const mount=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el=mount.current;
    if(!el)return;
    if(paused||window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      el.dataset.renderer='disabled';
      return;
    }
    el.dataset.renderer='loading';
    let disposed=false;
    let cleanup:(()=>void)|undefined;
    void loadAtmosphere().then(async()=>{
      if(disposed||!el.isConnected)return;
      const release=await window.GothicAtmosphereRuntime?.mountAtmosphere(el);
      if(disposed)release?.();else{
        cleanup=release;
        // No WebGL is a supported degraded mode; asset failures are not.
        if(!el.dataset.renderer||el.dataset.renderer==='loading')
          el.dataset.renderer=el.querySelector('canvas')?'pixi':'unsupported';
      }
    }).catch(error=>{
      if(disposed||!el.isConnected)return;
      // UI and saved gameplay remain playable, but report the asset failure.
      el.dataset.renderer='asset-error';
      el.dataset.rendererError=error instanceof Error?error.message:String(error);
    });
    return ()=>{disposed=true;cleanup?.();};
  },[paused]);
  return <div ref={mount} data-testid="gothic-pixi-atmosphere" aria-hidden="true"
    className="pointer-events-none absolute inset-0 z-[0] overflow-hidden"/>;
}
