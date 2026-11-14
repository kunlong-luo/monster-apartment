'use client';

import type {ImageProps} from 'next/image';
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
export function R12SceneBackdrop({area,fallbackSrc,className,testId}:Props&{
  className:string;testId?:string;
}){
  const sources=approvedR12Scene(area);
  return <div className={className} aria-hidden="true"
    data-testid={testId} data-r12-scene-art={sources?'production':'legacy'}
    style={sources?undefined:{backgroundImage:'url('+JSON.stringify(fallbackUrl(fallbackSrc))+')'}}>
    {sources&&<>
      <ReliableImage src={sources.desktop} fallbackSrc={fallbackSrc}
        fill unoptimized sizes="100vw" alt=""
        data-r12-art-image="desktop"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover max-[700px]:hidden"/>
      <ReliableImage src={sources.mobile} fallbackSrc={fallbackSrc}
        fill unoptimized sizes="100vw" alt=""
        data-r12-art-image="mobile"
        className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover max-[700px]:block"/>
    </>}
  </div>;
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
