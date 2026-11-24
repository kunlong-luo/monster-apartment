'use client';

import {useState} from 'react';
import {ReliableImage,retryAssetUrl} from './reliable-image';

/** Approved native originals use exactly ONE browser-selected raster.
 * Rendering two fill <img> elements and hiding one with CSS still risks
 * downloading and decoding both 4K and portrait sources. The native <picture>
 * source is chosen before hydration; source retry is bound to the same art
 * identity and an exhausted image returns a neutral surface, never lobby art.
 * This is production-only: review ZIP images cannot enter here via manifest.
 */
export function R12ApprovedScenePicture({desktop,mobile,kind,alt=''}:{
  desktop:string;mobile:string;kind:'backdrop'|'hero';alt?:string;
}){
  const [failures,setFailures]=useState(0);
  if(failures>=2){
    return kind==='backdrop'
      ?<div aria-hidden="true" data-r12-art-failed="production"
        className="pointer-events-none absolute inset-0"
        style={{background:'linear-gradient(125deg,#21182a,#100e1a 65%,#2b1930)'}}/>
      :<div aria-hidden="true" data-r12-hero-art="production-failed"
        className="mw-world-hero-pending"/>;
  }
  return <picture data-r12-responsive-art={kind}
    className="pointer-events-none absolute inset-0 block">
    <source media="(max-width:700px)"
      srcSet={failures===0?mobile:retryAssetUrl(mobile,1)}/>
    <ReliableImage src={desktop} fill unoptimized
      sizes={kind==='hero'?'(max-width:760px) 100vw, 1200px':'100vw'}
      alt={alt}
      data-r12-art-image={kind==='backdrop'?'production':undefined}
      data-r12-hero-art={kind==='hero'?'production':undefined}
      className={kind==='backdrop'
        ?'pointer-events-none absolute inset-0 h-full w-full object-cover'
        :'mw-world-hero-painting'}
      onError={()=>setFailures(n=>Math.min(2,n+1))}/>
  </picture>;
}
