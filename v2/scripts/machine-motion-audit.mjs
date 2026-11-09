/** Painted Lv.2 machine motion compatibility gate.
 * Artist atlases are separate 2048x512 RGBA WebPs (4 x 512x512).
 * Every review/ready atlas must identify EXACTLY the machine CG it animates.
 * This module has no gameplay, React, or Pixi dependencies.
 */
import sharp from 'sharp';
import {createHash} from 'node:crypto';

export const WORKSHOP_CRAFTS=['well','garden','kiln'];
const SHA=/^[0-9a-f]{64}$/;
const FRAME=512;

export function sha256(bytes){
  return createHash('sha256').update(bytes).digest('hex');
}

export function validateMachineMotionContract(art,painting){
  if(!WORKSHOP_CRAFTS.includes(art?.craft)||art.role!=='machine-animation'||
    art.id!=='machine.'+art.craft+'.working'||
    art.path!=='art/production/machines/'+art.craft+'/working.webp'||
    art.level!==2||
    art.canvas?.width!==2048||art.canvas?.height!==512||
    art.frame?.width!==FRAME||art.frame?.height!==FRAME||
    art.frame?.columns!==4||art.frame?.rows!==1||art.frame?.count!==4)
    throw Error('Invalid four-frame Lv.2 machine-motion contract: '+String(art?.id));
  if(!painting||painting.id!=='machine.'+art.craft+'.lv2'||
    painting.role!=='machine'||painting.level!==2||
    painting.canvas?.width!==512||painting.canvas?.height!==512)
    throw Error('Missing matching Lv.2 painting for '+art.craft);
  if(art.status==='pending')return;
  if(!['ready','review'].includes(art.status))
    throw Error('Unknown machine motion state for '+art.craft);
  // The Pixi art reviewer loads ONLY review masters, so matching review
  // atlases are allowed only alongside a review Lv.2 painting. A production
  // animation requires a ready Lv.2 painting, never a stale review candidate.
  if(painting.status!==art.status)
    throw Error('Atlas and Lv.2 chassis need the SAME art status: '+art.craft);
  if(!SHA.test(painting.sourceSha256??'')||
    art.matchedPaintingSha256!==painting.sourceSha256)
    throw Error('Atlas does not declare the current Lv.2 painting SHA: '+art.craft);
  if(!SHA.test(art.sourceSha256??''))
    throw Error('Machine motion lacks source provenance SHA: '+art.craft);
}

/** Inspect full alpha boundaries, chassis silhouette compatibility, and true
 * four-frame variance. This is a technical preflight, NEVER artistic approval.
 * Artist review must additionally verify moving parts and visual continuity.
 */
export async function inspectPaintedMachineMotion(masterBytes,atlasBytes){
  const [masterMeta,atlasMeta]=await Promise.all([
    sharp(masterBytes).metadata(),sharp(atlasBytes).metadata()
  ]);
  if(masterMeta.format!=='webp'||masterMeta.width!==FRAME||
    masterMeta.height!==FRAME||!masterMeta.hasAlpha)
    throw Error('Lv.2 master must be 512x512 WebP with real alpha');
  if(atlasMeta.format!=='webp'||atlasMeta.width!==FRAME*4||
    atlasMeta.height!==FRAME||!atlasMeta.hasAlpha)
    throw Error('Machine motion must be a 2048x512 WebP RGBA atlas');
  const [master,atlas]=await Promise.all([
    sharp(masterBytes).ensureAlpha().raw().toBuffer(),
    sharp(atlasBytes).ensureAlpha().raw().toBuffer()
  ]);
  const total=FRAME*FRAME;
  let masterVisible=0;
  for(let i=0;i<total;i++)if(master[i*4+3]>20)masterVisible++;
  if(masterVisible<total*.08||masterVisible>total*.85)
    throw Error('Lv.2 painting has an implausible visible silhouette');
  let minSilhouette=1,variation=0;
  for(let frame=0;frame<4;frame++){
    let shared=0,outside=0,visible=0,border=0,changed=0;
    for(let y=0;y<FRAME;y++)for(let x=0;x<FRAME;x++){
      const m=(y*FRAME+x)*4;
      const a=(y*FRAME*4+frame*FRAME+x)*4;
      const mVisible=master[m+3]>20;
      const aVisible=atlas[a+3]>20;
      if(aVisible)visible++;
      if(mVisible&&aVisible)shared++;
      if(!mVisible&&aVisible)outside++;
      if(aVisible&&(x===0||x===FRAME-1||y===0||y===FRAME-1))border++;
      if(frame>0){
        const first=(y*FRAME*4+x)*4;
        if(Math.abs(atlas[a]-atlas[first])+
          Math.abs(atlas[a+1]-atlas[first+1])+
          Math.abs(atlas[a+2]-atlas[first+2])+
          Math.abs(atlas[a+3]-atlas[first+3])>24)changed++;
      }
    }
    const silhouette=shared/masterVisible;
    minSilhouette=Math.min(minSilhouette,silhouette);
    if(silhouette<.70||outside>masterVisible*.28||
      visible<masterVisible*.68||visible>masterVisible*1.40)
      throw Error('Atlas frame '+frame+' does not match painted chassis: overlap='+
        silhouette.toFixed(3)+' outside='+outside);
    if(border>12)throw Error('Atlas frame '+frame+' clips the edge');
    variation+=changed;
  }
  if(variation<250)throw Error('Machine atlas has no distinct working poses or light changes');
  return {minSilhouette,variation,frames:4};
}
