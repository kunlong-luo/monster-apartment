import {Texture} from 'pixi.js';

/** Optional painted AVIF textures: failed codecs or missing files cannot
 * prevent the deterministic factory from booting with generated sprites.
 * Keep the original sequential floor/backdrop decoding behavior. */
export async function loadWorkshopPaintedArt(assetBase:string){
  // The painterly architecture is independent from machines, workers and hit areas.
  // AVIF is an enhancement: unsupported codecs fall back to the legacy scene.
  let painted:Texture|null=null;
  let paintedFloor:Texture|null=null;
  let kilnArtReview:Texture|null=null;
  const paintedDetail:Partial<Record<'well'|'garden',Texture>>={};
  try{
    const image=new Image();
    image.crossOrigin='anonymous';
    image.src=new URL('./assets/moon-workshop.avif',assetBase).href;
    await image.decode();
    painted=Texture.from(image);
    const floorImage=new Image();
    floorImage.crossOrigin='anonymous';
    floorImage.src=new URL('./assets/moonstone-floor.avif',assetBase).href;
    await floorImage.decode();
    paintedFloor=Texture.from(floorImage);
  }catch{/* keep gameplay available even if an asset cannot decode */}
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

  return {painted,paintedFloor,kilnArtReview,paintedDetail};
}
