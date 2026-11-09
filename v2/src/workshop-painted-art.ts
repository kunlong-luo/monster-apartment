import {Rectangle,Texture} from 'pixi.js';
import type {Craft,WorkerId} from './workshop-model';

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

type MachineLevelKey='1'|'2'|'3';
type MasterMachineArt=Partial<Record<Craft,Partial<Record<MachineLevelKey,Texture>>>>;
type WorkingMachineArt=Partial<Record<Craft,Texture[]>>;
type MachineArtPack={
  masters:MasterMachineArt;
  working:WorkingMachineArt;
  workers:Partial<Record<WorkerId,Texture>>;
  review:boolean;
};

/** The manifest is emitted at build time from audited `status: ready` artwork.
 * It is always present, even when no formal machine paintings are approved.
 * Never request nonexistent production sprites or treat concept AVIF as final.
 */
async function loadMachineMasterArt(assetBase:string):Promise<MachineArtPack>{
  const result:MasterMachineArt={};
  const working:WorkingMachineArt={};
  const workers:Partial<Record<WorkerId,Texture>>={};
  const pack:MachineArtPack={masters:result,working,workers,review:false};
  const previewRequested=typeof window!=='undefined'&&
    new URLSearchParams(window.location.search).get('machine-art')==='review';
  try{
    const response=await fetch(new URL('./assets/machine-art-index.json',assetBase));
    if(!response.ok)return pack;
    const index:unknown=await response.json();
    if(!index||typeof index!=='object'||!('schemaVersion' in index)||
       index.schemaVersion!==1||!('machines' in index)||
       !index.machines||typeof index.machines!=='object')return pack;
    // A review candidate is reachable ONLY from the explicit URL parameter;
    // all normal visits resolve the audited production master index unchanged.
    const reviews='review' in index&&index.review&&typeof index.review==='object'
      ?index.review as Record<string,unknown>:{};
    const machines=previewRequested?reviews:index.machines as Record<string,unknown>;
    for(const craft of ['well','garden','kiln'] as const){
      const levels=machines[craft];
      if(!levels||typeof levels!=='object')continue;
      const byLevel=levels as Record<string,unknown>;
      for(const level of ['1','2','3'] as const){
        const filename=byLevel[level];
        const expected=previewRequested?
          `review/machines/${craft}/lv${level}.webp`:
          `production/machines/${craft}/lv${level}.webp`;
        if(filename!==expected)continue;
        try{
          const image=await loadPaintedTexture(assetBase,filename);
          // The audit gate verifies exactly 512x512; don't promote a tiny
          // review image through the manifest on transient deployments.
          if(image.width!==512||image.height!==512)continue;
          (result[craft]??={})[level]=image;
          if(previewRequested)pack.review=true;
        }catch{/* Failed master: retain the working AVIF / raster fallback. */}
      }
    }
    // Approved full-body 512x768 humans; the URL gate also prevents review
    // sprites being loaded on a normal player visit. No speculative 404s.
    const workerList=previewRequested
      ?('reviewWorkers' in index?index.reviewWorkers:null)
      :('workers' in index?index.workers:null);
    const workerRecords=workerList&&typeof workerList==='object'
      ?workerList as Record<string,unknown>:{};
    for(const worker of ['brook','fern','cinder'] as const){
      const filename=workerRecords[worker];
      const expected=previewRequested
        ?'review/workers/'+worker+'.webp':'workers/'+worker+'.webp';
      if(filename!==expected)continue;
      try{
        const texture=await loadPaintedTexture(assetBase,filename);
        if(texture.width!==512||texture.height!==768)continue;
        workers[worker]=texture;
      }catch{/* An invalid full-body CG must never hide the raster character. */}
    }
    // Four fixed-position 512px frames, sliced from a single audited
    // 2048x512 WebP texture. No per-tick texture allocation or frame probing.
    const atlasValue=previewRequested
      ?('reviewWorking' in index?index.reviewWorking:null)
      :('working' in index?index.working:null);
    const atlases=atlasValue&&typeof atlasValue==='object'
      ?atlasValue as Record<string,unknown>:{};
    for(const craft of ['well','garden','kiln'] as const){
      const filename=atlases[craft];
      const expectedAtlas=previewRequested
        ?`review/machines/${craft}/working.webp`
        :`production/machines/${craft}/working.webp`;
      if(filename!==expectedAtlas)continue;
      try{
        const sheet=await loadPaintedTexture(assetBase,filename);
        if(sheet.width!==2048||sheet.height!==512)continue;
        working[craft]=Array.from({length:4},(_,frame)=>new Texture({
          source:sheet.source,frame:new Rectangle(frame*512,0,512,512),
        }));
        if(previewRequested)pack.review=true;
      }catch{/* A bad animation never removes the still-image fallback. */}
    }
  }catch{/* A cold fetch must never block the factory. */}
  return pack;
}

/** Painted Pixi textures: retry first-load WebP/AVIF decoding once, then fall
 * back without blocking gameplay. All resources resolve relative to the
 * deployed /monster-apartment/workshop/ asset base. */
export async function loadWorkshopPaintedArt(assetBase:string){
  let painted:Texture|null=null;
  let backdropSource:'world-hall-2k'|'high-res-webp'|'legacy-avif'|'procedural'='procedural';
  let paintedFloor:Texture|null=null;
  let kilnArtReview:Texture|null=null;
  let patronPortrait:Texture|null=null;
  // Worker art comes from the SAME audited manifest request as machine art.
  const paintedDetail:Partial<Record<'well'|'garden',Texture>>={};
  const machineMastersPromise=loadMachineMasterArt(assetBase);
  // Independent room painting is a visual backdrop, never an engine input.
  // Keep the old art as a resilient fallback on cold GitHub Pages navigation.
  try{
    painted=await loadPaintedTexture(assetBase,'workshop-gothic-hall.webp');
    backdropSource='world-hall-2k';
  }catch{
    try{
      painted=await loadPaintedTexture(assetBase,'lobby-hero-v3.webp',1);
      backdropSource='high-res-webp';
    }catch{
      try{
        painted=await loadPaintedTexture(assetBase,'lobby-hero-v2.webp',1);
        backdropSource='high-res-webp';
      }catch{
        try{
          painted=await loadPaintedTexture(assetBase,'moon-workshop.avif',1);
          backdropSource='legacy-avif';
        }catch{/* procedural background remains playable */}
      }
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
  const {
    masters:machineMasters,working:machineWorking,
    workers:workerPaintings,review:machinePreviewActive
  }=await machineMastersPromise;
  return {painted,backdropSource,paintedFloor,kilnArtReview,paintedDetail,patronPortrait,workerPaintings,machineMasters,machineWorking,machinePreviewActive};
}
