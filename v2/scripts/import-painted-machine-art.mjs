/** Import nine externally painted Gothic equipment sprites as REVIEW files.
 *
 * Usage: node scripts/import-painted-machine-art.mjs /path/to/candidate-folder
 *
 * The import is deliberately an explicit maintainer operation, never build
 * automation. No asset becomes ready/approved without visual review.
 * It replaces ONLY nine candidate 512x512 WEBPs and marks procedural Lv.2
 * motion atlases pending rather than mixing mismatched machine silhouettes.
 */
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {access,mkdir,readFile,rename,writeFile} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const folder=process.argv[2]&&resolve(process.argv[2]);
if(!folder)throw Error('Usage: node scripts/import-painted-machine-art.mjs <unpacked candidate directory>');
const path=resolve(root,'art/asset-pack.v1.json');
const manifest=JSON.parse(await readFile(path,'utf8'));
const entries=manifest.productionAssets??[];
const expected=['well','garden','kiln'].flatMap(craft=>[1,2,3].map(level=>({
  craft,level,id:`machine.${craft}.lv${level}`,
  name:`${craft}-lv${level}.webp`,
  destination:`art/production/machines/${craft}/lv${level}.webp`,
})));

async function sourceFor(name){
  for(const base of [folder,join(folder,'production-candidates')]){
    const candidate=join(base,name);
    try{await access(candidate);return candidate;}
    catch{/* Try the other explicit source directory, never guess paths. */}
  }
  throw Error('Missing candidate '+name);
}

function alphaQuality(data,info){
  if(info.channels!==4||!info.width||!info.height)return {transparent:0,border:1};
  const {width,height,channels}=info;
  let transparent=0,border=0;
  for(let y=0;y<height;y++){
    for(let x=0;x<width;x++){
      const a=data[(y*width+x)*channels+3];
      if(a<6)transparent++;
      if((x===0||y===0||x===width-1||y===height-1)&&a>6)border++;
    }
  }
  return {transparent:transparent/(width*height),border:border/(2*width+2*height-4)};
}
const verified=[];
for(const asset of expected){
  const entry=entries.find(x=>x.id===asset.id);
  if(!entry||entry.path!==asset.destination||entry.role!=='machine')
    throw Error('Mismatched asset manifest: '+asset.id);
  if(entry.status==='ready')throw Error('Refusing to replace approved production CG: '+asset.id);
  const source=await sourceFor(asset.name);
  const bytes=await readFile(source);
  const meta=await sharp(bytes).metadata();
  if(meta.format!=='webp'||meta.width!==512||meta.height!==512||!meta.hasAlpha)
    throw Error('Expected true 512x512 RGBA WebP: '+asset.name);
  if(bytes.length<Math.max(entry.minBytes??16000,12000))
    throw Error('Suspiciously small candidate '+asset.name);
  const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const {transparent,border}=alphaQuality(data,info);
  if(transparent<.12||transparent>.92||border>.01)
    throw Error('Image has paper background / clipped transparent edges: '+asset.name+
      ' transparency='+transparent.toFixed(3)+' edge='+border.toFixed(3));
  verified.push({...asset,bytes,
    sha256:createHash('sha256').update(bytes).digest('hex'),
    transparency:transparent});
}
// The full set has passed preflight before any original file is changed.
for(const asset of verified){
  const dest=resolve(root,asset.destination);
  await mkdir(dirname(dest),{recursive:true});
  const stage=dest+'.importing';
  await writeFile(stage,asset.bytes);
  await rename(stage,dest);
  const item=entries.find(x=>x.id===asset.id);
  item.status='review';
  item.generatedFrom='artist-import';
  item.sourceSha256=asset.sha256;
  item.notes='Transparent painted candidate, imported from machine concept art set; final CG still requires human art approval.';
}
for(const craft of ['well','garden','kiln']){
  const working=entries.find(x=>x.id==='machine.'+craft+'.working');
  if(!working)throw Error('Missing atlas manifest for '+craft);
  if(working.status==='ready')
    throw Error('Ready working atlas must be reviewed separately before swapping the chassis for '+craft);
  working.status='pending';
  working.generatedFrom='await-matched-painting-animation';
  working.notes='Needs a new four-frame 2048x512 atlas aligned to this painted Lv.2 chassis; do not reuse old prototype atlas.';
}
manifest.approval.stage='painted-machine-cg-review';
manifest.approval.paintingDelivered=false;
manifest.approval.browserVisualReviewPassed=false;
manifest.approval.releaseReady=false;
await writeFile(path+'.importing',JSON.stringify(manifest,null,2)+'\n');
await rename(path+'.importing',path);
console.log('[machine-CG] imported nine transparent candidate WebPs as review, no formal approval.');
console.log('[machine-CG] Lv.2 motion atlases marked pending until matching 4-frame art exists.');
for(const asset of verified)
  console.log('[machine-CG] '+asset.id+' alphaBlank='+asset.transparency.toFixed(2)+
    ' sha256='+asset.sha256.slice(0,12));
