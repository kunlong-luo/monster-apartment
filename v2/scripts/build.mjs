import {build} from 'esbuild';
import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(resolve(root,'dist/assets'),{recursive:true});
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

/** Optional original alpha worker paintings. Builds without art in development;
 * when artists submit the approved files, deploy bundles them automatically. */
for(const worker of ['brook','fern','cinder']){
  try{
    await mkdir(resolve(root,'dist/assets/workers'),{recursive:true});
    await copyFile(resolve(root,'art/production/workers',worker+'.webp'),
      resolve(root,'dist/assets/workers',worker+'.webp'));
  }catch(error){
    if(error?.code!=='ENOENT')throw error;
  }
}

/** Production-grade 512px painted machine sprites are opt-in. Only files
 * explicitly marked ready in the audited art pack are deployed. The runtime
 * reads this tiny index and never probes nonexistent artwork (no 404 burst on
 * the first GitHub Pages navigation). Prototypes remain the playable fallback.
 */
const pack=JSON.parse(await readFile(resolve(root,'art/asset-pack.v1.json'),'utf8'));
const machineIndex={schemaVersion:1,machines:{},working:{}};
for(const item of pack.productionAssets??[]){
  if(item.status!=='ready'||!['machine','machine-animation'].includes(item.role))continue;
  if(item.role==='machine-animation'){
    if(!['well','garden','kiln'].includes(item.craft)||
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
await writeFile(resolve(root,'dist/assets/machine-art-index.json'),
  JSON.stringify(machineIndex));
