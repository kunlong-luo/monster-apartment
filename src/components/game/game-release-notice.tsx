'use client';

import {useEffect,useState} from 'react';
import {GAME_UI_RELEASE} from '@/core/game-release';
import {isNewerGameRelease} from '@/lib/game/release-version';
import {siteAssetUrl} from '@/lib/game/site-asset-url';

/** Tiny opt-in update prompt. A running game is never reloaded automatically:
 * progress stays in place, and the prompt appears only for a newer deployed
 * release. Checks run on first mount and tab return, not on a polling timer. */
export function GameReleaseNotice(){
  const [available,setAvailable]=useState<string|null>(null);
  useEffect(()=>{
    let lastCheck=0;
    const controller=new AbortController();
    const check=async()=>{
      if(document.visibilityState==='hidden')return;
      const now=Date.now();
      if(now-lastCheck<15_000)return;
      lastCheck=now;
      try{
        const response=await fetch(siteAssetUrl('/release.json')+'?check='+now,{
          cache:'no-store',signal:controller.signal,
        });
        if(!response.ok)return;
        const data:unknown=await response.json();
        if(!data||typeof data!=='object'||!('release' in data))return;
        const remote=data.release;
        if(typeof remote==='string'&&isNewerGameRelease(remote,GAME_UI_RELEASE))
          setAvailable(remote);
      }catch{
        // Offline, aborted navigation and CDN errors must not interrupt play.
      }
    };
    const onFocus=()=>{void check();};
    const onVisible=()=>{if(document.visibilityState==='visible')void check();};
    window.addEventListener('focus',onFocus);
    document.addEventListener('visibilitychange',onVisible);
    void check();
    return ()=>{
      controller.abort();
      window.removeEventListener('focus',onFocus);
      document.removeEventListener('visibilitychange',onVisible);
    };
  },[]);

  if(!available)return null;
  return <aside data-testid="game-release-notice" role="status"
    aria-label="游戏更新提示"
    className="fixed bottom-[calc(86px+env(safe-area-inset-bottom))] right-3 z-[35]
      flex max-w-[calc(100vw-24px)] items-center gap-3 rounded-xl border
      border-[#e8bc81b8] bg-[linear-gradient(125deg,#31101feb,#160d1bf5)]
      px-3 py-2.5 text-xs text-[#ffe6c2] shadow-[0_8px_32px_#000b]
      backdrop-blur-xl sm:right-5 sm:px-4">
    <span className="min-w-0 leading-5">✦ 新版本 {available} 已发布</span>
    <button type="button" onClick={()=>window.location.reload()}
      className="shrink-0 rounded-md border border-[#dba976] bg-[#64213d]
        px-3 py-2 font-semibold text-[#fff2d6] transition-colors
        hover:bg-[#8b2b50] focus-visible:outline-2
        focus-visible:outline-offset-2 focus-visible:outline-[#ffdb9f]">
      更新画面
    </button>
  </aside>;
}
