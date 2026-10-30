import {Texture} from 'pixi.js';
import type {WorkerId} from './workshop-model';

/** Decode the same static asset again after a transient first-navigation
 * failure. A retry query prevents a cached failed response from being reused.
 * Bounded attempts do not turn a missing or unsupported asset into an endless
 * loading spinner, and high-quality WebP always wins when it is available. */
async function loadPaintedTexture(assetBase:string,filename:string,attempts=2):Promise<Texture>{
  let failure:unknown;
  for(let attempt=0;attempt<attempts;attempt++){
    try{
      const url=new URL('./assets/'+filename,assetBase);
      if(attempt)url.searchParams.set('retry',String(attempt));
      const image=new Image();
      image.crossOrigin='anonymous';
      image.decoding='async';
      image.src=url.href;
      await image.decode();
      if(!image.naturalWidth||!image.naturalHeight)throw Error('Decoded texture is empty: '+filename);
      return Texture.from(image);
    }catch(error){
      failure=error;
      if(attempt+1<attempts)
        await new Promise<void>(resolve=>setTimeout(resolve,180));
    }
  }
  throw failure;
}

/** Painted Pixi textures: retry first-load WebP/AVIF decoding once, then fall
 * back without blocking gameplay. All resources resolve relative to the
 * deployed /monster-apartment/workshop/ asset base. */
export async function loadWorkshopPaintedArt(assetBase:string){
  let painted:Texture|null=null;
  let backdropSource:'high-res-webp'|'legacy-avif'|'procedural'='procedural';
  let paintedFloor:Texture|null=null;
  let kilnArtReview:Texture|null=null;
  let patronPortrait:Texture|null=null;
  // Do not reload old pet-shaped worker assets into the real human roster.
  const workerPaintings:Partial<Record<WorkerId,Texture>>={};
  const paintedDetail:Partial<Record<'well'|'garden',Texture>>={};
  try{
    painted=await loadPaintedTexture(assetBase,'lobby-hero-v3.webp');
    backdropSource='high-res-webp';
  }catch{
    try{
      painted=await loadPaintedTexture(assetBase,'lobby-hero-v2.webp',1);
      backdropSource='high-res-webp';
    }catch{
      try{
        painted=await loadPaintedTexture(assetBase,'moon-workshop.avif',1);
        backdropSource='legacy-avif';
      }catch{/* procedural background remains playable */ }
    }
  }
  try{
    paintedFloor=await loadPaintedTexture(assetBase,'moonstone-floor.avif');
  }catch{/* interactive floor fallback remains available */}
  try{
    patronPortrait=await loadPaintedTexture(assetBase,'yuesha-avatar-v3.webp');
  }catch{/* animated visitor remains available */}
  try{
    kilnArtReview=await loadPaintedTexture(assetBase,'kiln-art-review.avif');
  }catch{/* default machine sprite remains available */}
  for(const kind of ['well','garden'] as const){
    try{
      paintedDetail[kind]=await loadPaintedTexture(assetBase,kind+'-art-review.avif');
    }catch{/* the corresponding machine retains its default sprite */}
  }
  return {painted,backdropSource,paintedFloor,kilnArtReview,paintedDetail,patronPortrait,workerPaintings};
}
