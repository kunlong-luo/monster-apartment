import {Texture} from 'pixi.js';

/** Painted Pixi texture loader. A high-detail WebP is the primary backdrop;
 * older AVIF and procedural textures remain nonfatal codec fallbacks. */
export async function loadWorkshopPaintedArt(assetBase:string){
  // The backdrop loads exactly once per stage mount, never once per shift.
  let painted:Texture|null=null;
  let backdropSource:'high-res-webp'|'legacy-avif'|'procedural'='procedural';
  let paintedFloor:Texture|null=null;
  let kilnArtReview:Texture|null=null;
  let patronPortrait:Texture|null=null;
  // Legacy worker WebP assets were pet-shaped. Do not reload them into the
  // human-form roster or stage; only distinct verified humanoid CG may return.
  const workerPaintings={};
  const paintedDetail:Partial<Record<'well'|'garden',Texture>>={};
  try{
    const image=new Image();
    image.crossOrigin='anonymous';
    image.src=new URL('./assets/lobby-hero-v3.webp',assetBase).href;
    await image.decode();
    painted=Texture.from(image);
    backdropSource='high-res-webp';
  }catch{
    try{
      const image=new Image();
      image.crossOrigin='anonymous';
      image.src=new URL('./assets/lobby-hero-v2.webp',assetBase).href;
      await image.decode();
      painted=Texture.from(image);
      backdropSource='high-res-webp';
    }catch{
      try{
        const image=new Image();
        image.crossOrigin='anonymous';
        image.src=new URL('./assets/moon-workshop.avif',assetBase).href;
        await image.decode();
        painted=Texture.from(image);
        backdropSource='legacy-avif';
      }catch{/* generated background remains playable */}
    }
  }
  try{
    const floorImage=new Image();
    floorImage.crossOrigin='anonymous';
    floorImage.src=new URL('./assets/moonstone-floor.avif',assetBase).href;
    await floorImage.decode();
    paintedFloor=Texture.from(floorImage);
  }catch{/* keep gameplay available even if an asset cannot decode */}
  // High-detail cameo remains independent of the factory floor textures.
  try{
    const image=new Image();
    image.crossOrigin='anonymous';
    image.src=new URL('./assets/yuesha-avatar-v3.webp',assetBase).href;
    await image.decode();
    patronPortrait=Texture.from(image);
  }catch{/* keep the original animated visitor as an offline fallback */}
  // One actual painted, alpha-backed machine crop for visual review only.
  // Never replace all machine art from a flattened screenshot.
  try {
    const kilnImage=new Image();
    kilnImage.crossOrigin='anonymous';
    kilnImage.src=new URL('./assets/kiln-art-review.avif',assetBase).href;
    await kilnImage.decode();
    kilnArtReview=Texture.from(kilnImage);
  } catch {/* retain interactive fallback sprite when codec or file is absent */}
  // Painterly detail overlays keep the procedural lower machines as a
  // temporary physical base; characters from the concept art are masked out.
  for(const kind of ['well','garden'] as const){
    try{
      const image=new Image();
    image.crossOrigin='anonymous';
      image.src=new URL('./assets/'+kind+'-art-review.avif',assetBase).href;
      await image.decode();
      paintedDetail[kind]=Texture.from(image);
    }catch{/* independent codec/image failure does not block production */}
  }

  return {painted,backdropSource,paintedFloor,kilnArtReview,paintedDetail,patronPortrait,workerPaintings};
}
