import {preparePaintedMachineLightStudy} from './prepare-painted-machine-light-study.mjs';
import {
  validateMachineMotionContract,inspectPaintedMachineMotion,sha256
} from './machine-motion-audit.mjs';
import {build} from 'esbuild';
import {mkdir,copyFile,readFile,writeFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {prepareMachineReviewSprite} from './prepare-machine-review-sprite.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
// All entry points (Pages, Playwright's direct webServer, npm build) must
// generate audited review art before copying it. Do not depend on npm scripts.
await import('./prepare-machine-working-art.mjs');
await mkdir(resolve(root,'dist/assets'),{recursive:true});
// A revoked or pending candidate must not linger from a previous local build.
// The published index controls loads; these removals also prevent direct stale
// files from remaining publicly accessible after a status change.
for(const path of [
  'production/machines','review/machines','workers','review/workers'
]){
  await rm(resolve(root,'dist/assets',path),{recursive:true,force:true});
}
function requireArtApproval(item){
  if(item.status!=='ready')return;
  if(item.approval?.visualReviewed!==true||
    typeof item.approval?.evidence!=='string'||
    item.approval.evidence.length<12)
    throw Error('Unapproved art cannot be published as ready: '+item.id);
}
// Next.js owns /workshop/ route; the sidecar IIFE only mounts on request.
await build({
  entryPoints:[resolve(root,'src/runtime.ts')],
  outfile:resolve(root,'dist/assets/workshop-runtime.js'),
  bundle:true,minify:true,format:'iife',globalName:'MoonworkRuntime',
  target:'es2022',logLevel:'info',
});
// Independent Pixi overlay for the Gothic App Router scenes.
await build({
  entryPoints:[resolve(root,'src/gothic-atmosphere.ts')],
  outfile:resolve(root,'dist/assets/gothic-atmosphere.js'),
  bundle:true,minify:true,format:'iife',globalName:'GothicAtmosphereRuntime',
  target:'es2022',logLevel:'info',
});
await copyFile(
  resolve(root,'node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff2'),
  resolve(root,'dist/assets/noto-sans-sc.woff2'),
);
await copyFile(resolve(root,'../public/art/world-scenes/workshop-gothic-hall.webp'),
  resolve(root,'dist/assets/workshop-gothic-hall.webp'));
await copyFile(resolve(root,'../public/art/lobby-hero-v3.webp'),
  resolve(root,'dist/assets/lobby-hero-v3.webp'));
await copyFile(resolve(root,'../public/art/yuesha-avatar-v3.webp'),
  resolve(root,'dist/assets/yuesha-avatar-v3.webp'));
await copyFile(resolve(root,'../public/art/lobby-hero-v2.webp'),
  resolve(root,'dist/assets/lobby-hero-v2.webp'));
await copyFile(resolve(root,'art/moon-workshop.avif'),resolve(root,'dist/assets/moon-workshop.avif'));
await copyFile(resolve(root,'art/moonveil-portrait.avif'),resolve(root,'dist/assets/moonveil-portrait.avif'));
await copyFile(resolve(root,'art/moonstone-floor.avif'),resolve(root,'dist/assets/moonstone-floor.avif'));
await copyFile(resolve(root,'art/kiln-art-review.avif'),resolve(root,'dist/assets/kiln-art-review.avif'));
await copyFile(resolve(root,'art/well-art-review.avif'),resolve(root,'dist/assets/well-art-review.avif'));
await copyFile(resolve(root,'art/garden-art-review.avif'),resolve(root,'dist/assets/garden-art-review.avif'));

/** All painting outputs are controlled by the audited manifest. An unlisted,
 * pending, or unapproved worker file must NOT enter the published app. */
const pack=JSON.parse(await readFile(resolve(root,'art/asset-pack.v1.json'),'utf8'));
const machineIndex={
  schemaVersion:1,machines:{},working:{},review:{},reviewWorking:{},
  workers:{},reviewWorkers:{},reviewLightStudies:{}
};
for(const worker of ['brook','fern','cinder']){
  const item=(pack.productionAssets??[]).find(x=>x.id==='worker.'+worker+'.full');
  const expected='art/production/workers/'+worker+'.webp';
  if(!item||item.path!==expected||item.workerId!==worker||item.role!=='worker'||
     item.canvas?.width!==512||item.canvas?.height!==768)
    throw Error('Invalid 512x768 worker art manifest for '+worker);
  if(item.status!=='ready'&&item.status!=='review')continue;
  requireArtApproval(item);
  const input=resolve(root,item.path);
  const bytes=await readFile(input);
  const sha=createHash('sha256').update(bytes).digest('hex');
  if(!/^[a-f0-9]{64}$/.test(item.sourceSha256??'')||
    sha!==item.sourceSha256)
    throw Error('Worker art was replaced without provenance: '+worker);
  const metadata=await sharp(bytes).metadata();
  if(metadata.width!==512||metadata.height!==768||!metadata.hasAlpha||
    metadata.format!=='webp')throw Error('Invalid worker RGBA master: '+worker);
  const rel=(item.status==='ready'?'workers/':'review/workers/')+worker+'.webp';
  const dest=resolve(root,'dist/assets',rel);
  await mkdir(dirname(dest),{recursive:true});
  await copyFile(input,dest);
  machineIndex[item.status==='ready'?'workers':'reviewWorkers'][worker]=rel;
}
for(const item of pack.productionAssets??[]){
  if(item.role==='machine'||item.role==='machine-animation')requireArtApproval(item);
  if(item.role==='machine'&&item.status==='review'){
    if(!['well','garden','kiln'].includes(item.craft)||
       ![1,2,3].includes(item.level)||
       item.path!==`art/production/machines/${item.craft}/lv${item.level}.webp`)
      throw Error('Unexpected review machine candidate: '+item.id);
    const output=`review/machines/${item.craft}/lv${item.level}.webp`;
    const destination=resolve(root,'dist/assets',output);
    await mkdir(dirname(destination),{recursive:true});
    if(item.generatedFrom==='curated-cg-import'){
      // The source remains SHA-audited and byte-for-byte intact. Only the
      // review output gets a conservative neutral-white underside cleanup.
      await prepareMachineReviewSprite(resolve(root,item.path),destination);
    }else{
      await copyFile(resolve(root,item.path),destination);
    }
    machineIndex.review[item.craft]??={};
    machineIndex.review[item.craft][String(item.level)]=output;
    continue;
  }
  if(item.role==='machine-animation'&&item.status==='review'){
    const painting=pack.productionAssets.find(
      p=>p.id==='machine.'+item.craft+'.lv2');
    validateMachineMotionContract(item,painting);
    const masterBytes=await readFile(resolve(root,painting.path));
    if(sha256(masterBytes)!==painting.sourceSha256)
      throw Error('Matching review machine painting changed: '+item.craft);
    const atlasBytes=await readFile(resolve(root,item.path));
    if(sha256(atlasBytes)!==item.sourceSha256)
      throw Error('Machine review atlas changed: '+item.craft);
    await inspectPaintedMachineMotion(masterBytes,atlasBytes);
    if(!['well','garden','kiln'].includes(item.craft)||item.level!==2||
       item.path!==`art/production/machines/${item.craft}/working.webp`||
       item.canvas?.width!==2048||item.canvas?.height!==512||
       item.frame?.count!==4||item.frame?.width!==512||
       item.frame?.height!==512||item.frame?.columns!==4||item.frame?.rows!==1)
      throw Error('Unexpected review machine atlas: '+item.id);
    const output=`review/machines/${item.craft}/working.webp`;
    const destination=resolve(root,'dist/assets',output);
    await mkdir(dirname(destination),{recursive:true});
    await copyFile(resolve(root,item.path),destination);
    machineIndex.reviewWorking[item.craft]=output;
    continue;
  }
  if(item.status!=='ready'||!['machine','machine-animation'].includes(item.role))continue;
  if(item.role==='machine-animation'){
    const painting=pack.productionAssets.find(
      p=>p.id==='machine.'+item.craft+'.lv2');
    validateMachineMotionContract(item,painting);
    const masterBytes=await readFile(resolve(root,painting.path));
    if(sha256(masterBytes)!==painting.sourceSha256)
      throw Error('Approved Lv.2 master changed: '+item.craft);
    const atlasBytes=await readFile(resolve(root,item.path));
    if(sha256(atlasBytes)!==item.sourceSha256)
      throw Error('Approved machine atlas changed: '+item.craft);
    await inspectPaintedMachineMotion(masterBytes,atlasBytes);
    if(item.level!==2||!['well','garden','kiln'].includes(item.craft)||
       item.path!==`art/production/machines/${item.craft}/working.webp`||
       item.canvas?.width!==2048||item.canvas?.height!==512||
       item.frame?.count!==4||item.frame?.width!==512||
       item.frame?.height!==512||item.frame?.columns!==4||item.frame?.rows!==1)
      throw Error('Unexpected ready machine animation: '+item.id);
    const output=`production/machines/${item.craft}/working.webp`;
    const destination=resolve(root,'dist/assets',output);
    await mkdir(dirname(destination),{recursive:true});
    await copyFile(resolve(root,item.path),destination);
    machineIndex.working[item.craft]=output;
    continue;
  }
  if(!['well','garden','kiln'].includes(item.craft)||
     ![1,2,3].includes(item.level)||
     item.path!==`art/production/machines/${item.craft}/lv${item.level}.webp`)
    throw Error('Unexpected ready machine asset: '+item.id);
  const output='production/machines/'+item.craft+'/lv'+item.level+'.webp';
  const destination=resolve(root,'dist/assets',output);
  await mkdir(dirname(destination),{recursive:true});
  await copyFile(resolve(root,item.path),destination);
  machineIndex.machines[item.craft]??={};
  machineIndex.machines[item.craft][String(item.level)]=output;
}
/** R10.3: Review-only four-frame lighting studies of the exact painted Lv.2
 * chassis. Not in `working` or `reviewWorking`: they are NOT machine actuators.
 * Every source is the filtered preview generated above, and no source art or
 * permanent binary is changed. */
for(const craft of ['well','garden','kiln']){
  const lv2=(pack.productionAssets??[]).find(x=>x.id==='machine.'+craft+'.lv2');
  if(lv2?.status!=='review'||lv2.generatedFrom!=='curated-cg-import')continue;
  const source=resolve(root,'dist/assets/review/machines',craft,'lv2.webp');
  const rel='review/machines/'+craft+'/light-study.webp';
  const dest=resolve(root,'dist/assets',rel);
  await preparePaintedMachineLightStudy(source,dest,craft);
  machineIndex.reviewLightStudies[craft]=rel;
}
await writeFile(resolve(root,'dist/assets/machine-art-index.json'),
  JSON.stringify(machineIndex));
