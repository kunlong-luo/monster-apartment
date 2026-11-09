/** Import three artist-drawn four-frame working atlases as REVIEW candidates.
 * Usage: node scripts/import-painted-machine-motion.mjs <candidate-folder>
 * Requires well-working.webp, garden-working.webp, kiln-working.webp.
 * Originals are 2048x512 WebP RGBA; each of four 512px frames must belong to
 * the EXACT current painted Lv.2 chassis. Technical QA is not art approval.
 */
import sharp from 'sharp';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  WORKSHOP_CRAFTS,sha256,validateMachineMotionContract,
  inspectPaintedMachineMotion
} from './machine-motion-audit.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const folder=process.argv[2]&&resolve(process.argv[2]);
if(!folder)throw Error('Usage: node scripts/import-painted-machine-motion.mjs <atlas-folder>');
const manifestPath=resolve(root,'art/asset-pack.v1.json');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
const items=manifest.productionAssets??[];
const validated=[];
for(const craft of WORKSHOP_CRAFTS){
  const painting=items.find(item=>item.id==='machine.'+craft+'.lv2');
  const motion=items.find(item=>item.id==='machine.'+craft+'.working');
  if(!painting||painting.status!=='review')
    throw Error('Only reviewed painted Lv.2 source may receive review motion: '+craft);
  if(!motion||motion.status==='ready')
    throw Error('Cannot replace approved or unknown motion: '+craft);
  const original=await readFile(resolve(root,painting.path));
  if(sha256(original)!==painting.sourceSha256)
    throw Error('Lv.2 painting changed without art review: '+craft);
  const bytes=await readFile(join(folder,craft+'-working.webp'));
  if(bytes.length<24000)throw Error('Undersized artist motion atlas: '+craft);
  const preview={...motion,status:'review',
    sourceSha256:sha256(bytes),matchedPaintingSha256:painting.sourceSha256,
    generatedFrom:'artist-supplied-matched-motion'};
  validateMachineMotionContract(preview,painting);
  const metrics=await inspectPaintedMachineMotion(original,bytes);
  validated.push({craft,bytes,preview,metrics});
}
if(new Set(validated.map(x=>x.preview.sourceSha256)).size!==3)
  throw Error('The three machine animations cannot share a single atlas');
// Preflight all three before replacing ANY existing candidate or manifest state.
for(const {craft,bytes} of validated){
  const destination=resolve(root,'art/production/machines',craft,'working.webp');
  await mkdir(dirname(destination),{recursive:true});
  await writeFile(destination+'.importing',bytes);
  await rename(destination+'.importing',destination);
}
for(const {craft,preview} of validated){
  const record=items.find(item=>item.id==='machine.'+craft+'.working');
  Object.assign(record,preview);
  delete record.approval;
  record.notes='Matched 512x512×4 working-pose REVIEW only; await frame-by-frame artistic inspection, safe transition and working-state QA.';
}
manifest.approval.releaseReady=false;
manifest.approval.browserVisualReviewPassed=false;
await writeFile(manifestPath+'.importing',JSON.stringify(manifest,null,2)+'\n');
await rename(manifestPath+'.importing',manifestPath);
for(const {craft,preview,metrics} of validated)
  console.log('[motion-review] '+craft+
    ' sourceSha='+preview.sourceSha256.slice(0,12)+
    ' matchedChassis='+preview.matchedPaintingSha256.slice(0,12)+
    ' minimumSilhouette='+(metrics.minSilhouette*100).toFixed(1)+'%'+
    ' frameDifferences='+metrics.variation);
console.log('[motion-review] ALL THREE PENDING ARTIST REVIEW, NOT READY');
