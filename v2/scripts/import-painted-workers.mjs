/** Opt-in, human-triggered import of THREE original 512x768 transparent
 * full-body worker paintings. Never changes the approved/default game art.
 *
 * Usage: node v2/scripts/import-painted-workers.mjs /path/to/art-folder
 * Required filenames: brook.webp, fern.webp, cinder.webp.
 * A visual review and approval evidence are STILL required before \`ready\`.
 */
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const folder=process.argv[2]&&resolve(process.argv[2]);
if(!folder)throw Error('Usage: node scripts/import-painted-workers.mjs <candidate-folder>');
const manifestPath=resolve(root,'art/asset-pack.v1.json');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
const checks=[],unique=new Set();

for(const worker of ['brook','fern','cinder']){
  const entry=(manifest.productionAssets??[]).find(x=>x.id==='worker.'+worker+'.full');
  const target='art/production/workers/'+worker+'.webp';
  if(!entry||entry.role!=='worker'||entry.workerId!==worker||
    entry.path!==target||entry.canvas?.width!==512||entry.canvas?.height!==768)
    throw Error('Missing expected worker manifest: '+worker);
  if(entry.status==='ready')throw Error('Refusing to overwrite approved worker: '+worker);
  const bytes=await readFile(join(folder,worker+'.webp'));
  if(bytes.length<32000)throw Error('Undersized worker CG: '+worker);
  const meta=await sharp(bytes).metadata();
  if(meta.format!=='webp'||meta.width!==512||meta.height!==768||!meta.hasAlpha)
    throw Error('Worker must be a genuine 512x768 transparent WebP: '+worker);
  const {data,info}=await sharp(bytes).ensureAlpha().raw()
    .toBuffer({resolveWithObject:true});
  let blank=0,border=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
    const a=data[(y*info.width+x)*4+3];
    if(a<6)blank++;
    if(a>6&&(x===0||y===0||x===info.width-1||y===info.height-1))border++;
  }
  blank/=info.width*info.height;
  border/=(info.width*2+info.height*2-4);
  if(blank<.25||blank>.92||border>.005)
    throw Error('Clipped or fake-transparent worker: '+worker+
      ' blank='+blank.toFixed(3)+' border='+border.toFixed(3));
  const sha=createHash('sha256').update(bytes).digest('hex');
  if(unique.has(sha))throw Error('Two workers share the same source image: '+worker);
  unique.add(sha);
  checks.push({worker,entry,bytes,sha,target,blank});
}
// Preflight all three BEFORE changing any image or manifest entry.
for(const item of checks){
  const dst=resolve(root,item.target);
  await mkdir(dirname(dst),{recursive:true});
  await writeFile(dst+'.importing',item.bytes);
  await rename(dst+'.importing',dst);
  item.entry.status='review';
  item.entry.generatedFrom='artist-supplied-transparent-worker-cg';
  item.entry.sourceSha256=item.sha;
  delete item.entry.approval;
  item.entry.notes='512x768 independent adult full-body worker candidate; requires human silhouette, garment and anatomy QA before ready.';
}
manifest.approval.releaseReady=false;
await writeFile(manifestPath+'.importing',JSON.stringify(manifest,null,2)+'\n');
await rename(manifestPath+'.importing',manifestPath);
for(const item of checks)console.log('[worker-cg] '+item.worker+
  ' imported for REVIEW only; alphaBlank='+item.blank.toFixed(3)+
  ' sha='+item.sha.slice(0,12));
