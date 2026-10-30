'use client';

import Image from 'next/image';
import type {ImageProps} from 'next/image';
import {useState} from 'react';

/** Keep Next's proven Image rendering and its static image dimensions.
 * Retry only when the browser actually reports an image load error.
 * Query tokens avoid a cached transient failure; no network polling. */
export function retryAssetUrl(src:string,attempt:number):string{
  if(!attempt||/^(?:blob:|data:)/i.test(src))return src;
  const hash=src.indexOf('#');
  const base=hash<0?src:src.slice(0,hash);
  const suffix=hash<0?'':src.slice(hash);
  return base+(base.includes('?')?'&':'?')+'asset_retry='+attempt+suffix;
}

function imageUrl(src:ImageProps['src']):string{
  return typeof src==='string'?src:'src' in src?src.src:src.default.src;
}

function retrySource(src:ImageProps['src'],attempt:number):ImageProps['src']{
  if(typeof src==='string')return retryAssetUrl(src,attempt);
  if('src' in src)return {...src,src:retryAssetUrl(src.src,attempt)};
  return {default:{...src.default,src:retryAssetUrl(src.default.src,attempt)}};
}

export type ReliableImageProps=ImageProps&{
  /** Optional same-subject/scene art, used only after two failed requests. */
  fallbackSrc?:ImageProps['src'];
};

export function ReliableImage({src,fallbackSrc,onError,...props}:ReliableImageProps){
  const [failure,setFailure]=useState<{url:string;step:number}>({url:'',step:0});
  const url=imageUrl(src);
  const step=failure.url===url?failure.step:0;
  const resolved=step===0?src:step===1?retrySource(src,1):fallbackSrc??src;
  return <Image {...props} src={resolved}
    data-image-load={step===0?'original':step===1?'retry':'fallback'}
    onError={event=>{
      onError?.(event);
      if(step===0)setFailure({url,step:1});
      else if(step===1&&fallbackSrc)setFailure({url,step:2});
    }}/>;
}
