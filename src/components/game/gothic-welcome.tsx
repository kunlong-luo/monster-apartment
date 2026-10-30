'use client';
import {ReliableImage as Image} from '@/components/game/reliable-image';
import {useState,useSyncExternalStore} from 'react';
import coverDesktop from '../../../public/art/beauty-beasts/cover/world-cover.webp';
import coverMobile from '../../../public/art/beauty-beasts/cover/world-cover-mobile.webp';
import {HEROINE_FACE_ART} from '@/components/summon/heroine-portrait-assets';
import {GAME_UI_RELEASE,GAME_UI_CHAPTER} from '@/core/game-release';
import './gothic-welcome.css';

function readExistingSave(){
  if(typeof window==='undefined')return false;
  try{
    return Boolean(
      window.localStorage.getItem('monster-apartment:workshop-v2-lab')||
      window.localStorage.getItem('monster-apartment:character-collection:v1')||
      window.localStorage.getItem('monster-apartment:cozy:v1')
    );
  }catch{return false;}
}
function subscribeExistingSave(callback:()=>void){
  const onStorage=()=>callback();
  window.addEventListener('storage',onStorage);
  return ()=>window.removeEventListener('storage',onStorage);
}
/** Title page contains genuine accessible controls, not a screenshot click-map.
 * Desktop/mobile cover is in the repository as independent WebP binary files. */
export function GothicWelcome({onEnter}:{onEnter:()=>void}){
  const returning=useSyncExternalStore(subscribeExistingSave,readExistingSave,()=>false);
  // <picture> may select the mobile <source> regardless of an img-src retry.
  // Retry that source alongside next/image, then fall back to desktop artwork.
  const [coverFailures,setCoverFailures]=useState(0);
  return <main className="gothic-welcome" data-testid="gothic-welcome"
    aria-label="美女与野兽 · 游戏欢迎页" data-cover-status="integrated-beauty-beasts-cover">
    <link rel="preload" as="image" href={coverMobile.src} media="(max-width:700px)"/>
    <link rel="preload" as="image" href={coverDesktop.src} media="(min-width:701px)"/>
    <picture className="gothic-welcome__painting" aria-hidden="true">
      <source media="(max-width:700px)"
        srcSet={coverFailures===0?coverMobile.src:
          coverFailures===1?coverMobile.src+'?asset_retry=1':undefined}/>
      <Image src={coverDesktop} fallbackSrc={coverMobile} alt="" fill loading="eager"
        fetchPriority="high" unoptimized sizes="100vw"
        onError={()=>setCoverFailures(n=>Math.min(2,n+1))}
        data-testid="welcome-cover-image" className="object-cover"/>
    </picture>
    <div className="gothic-welcome__shade" aria-hidden="true"/>
    <div className="gothic-welcome__stars" aria-hidden="true"/>
    <div className="gothic-welcome__frame" aria-hidden="true"/>
    <section className="gothic-welcome__content" aria-labelledby="welcome-title">
      <span className="gothic-welcome__eyebrow">MONSTER APARTMENT · A CRIMSON TALE</span>
      <div className="gothic-welcome__mark" aria-hidden="true">❦ <span>☾</span> ❦</div>
      <h1 id="welcome-title">美女与野兽
        <span>BEAUTY AND THE BEASTS</span>
      </h1>
      <p className="gothic-welcome__subtitle">月蚀将至，黑蔷薇的契约正在苏醒。</p>
      <p className="gothic-welcome__summary">遇见不同命运的女主人，唤醒独一无二的异兽契约。
        在月光街经营、召唤、收藏，并探索她们的秘密。</p>
      <div className="gothic-welcome__cast" data-testid="welcome-heroine-lineup" aria-label="可结识的四位住客">
        {([['yuesha','月纱'],['brook','泉泡'],['fern','青枝'],['cinder','炽角']] as const)
          .map(([id,name])=><span className="gothic-welcome__cast-member" key={id}>
            <Image src={HEROINE_FACE_ART[id]} alt={name} width={44} height={44} sizes="44px"
              loading="eager"
              className="gothic-welcome__cast-portrait"/>
            <small>{name}</small>
          </span>)}
      </div>
      <button type="button" onClick={onEnter} autoFocus
        data-testid="welcome-enter" className="gothic-welcome__enter">
        <span aria-hidden="true">✦</span>{returning?'继续游戏':'开始游戏'}<span aria-hidden="true">✦</span>
      </button>
      <span className="gothic-welcome__hint">进入大厅后点击左侧「契约召唤」即可体验角色卡池 · 自动保存至此浏览器</span>
    </section>
    <div className="gothic-welcome__edition" aria-hidden="true">
      <span data-testid="game-release">MOONLIT DISTRICT · {GAME_UI_RELEASE}</span><small>{GAME_UI_CHAPTER}</small>
    </div>
  </main>;
}
