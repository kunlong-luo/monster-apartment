import {readFile, stat} from 'node:fs/promises';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {
  validateMachineMotionContract,inspectPaintedMachineMotion,sha256,
  WORKSHOP_CRAFTS
} from './machine-motion-audit.mjs';
import {resolve, dirname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(await readFile(resolve(root,'art/asset-pack.v1.json'),'utf8'));
const errors=[],warnings=[];
const allowedStatuses=new Set(['pending','review','ready']);
const ids=new Set(),paths=new Set();
function checkedPath(name){
  if(typeof name!=='string'||name.includes('\\')||!name.startsWith('art/')||
    name.split('/').some(v=>v==='..'||v==='.')||name.startsWith('/')) {
    errors.push('Invalid art path: '+String(name));return null;
  }
  const resolved=resolve(root,name);
  if(!resolved.startsWith(root+sep)) {
    errors.push('Escaping art path: '+name);return null;
  }
  return resolved;
}
async function checkFile(path,minBytes=32){
  const absolute=checkedPath(path);
  if(!absolute)return null;
  let buffer;
  try{
    const s=await stat(absolute);
    if(!s.isFile()||s.size<minBytes)throw Error('expected file >='+minBytes+' bytes');
    buffer=await readFile(absolute);
  }catch(error){errors.push('Missing/undersized '+path+': '+error.message);return null;}
  const extension=path.slice(path.lastIndexOf('.')).toLowerCase();
  const png=buffer.length>=24&&buffer.subarray(1,4).toString()==='PNG';
  const webp=buffer.length>=30&&buffer.subarray(0,4).toString()==='RIFF'
    &&buffer.subarray(8,12).toString()==='WEBP';
  const avif=buffer.length>=24&&buffer.subarray(4,8).toString()==='ftyp'
    &&buffer.subarray(8,32).toString().includes('avif');
  if((extension==='.png'&&!png)||(extension==='.webp'&&!webp)||
     (extension==='.avif'&&!avif))errors.push('Invalid file header: '+path);
  let dimensions=null;
  if(png) dimensions={width:buffer.readUInt32BE(16),height:buffer.readUInt32BE(20)};
  if(webp&&buffer.subarray(12,16).toString()==='VP8X'){
    dimensions={width:1+buffer.readUIntLE(24,3),height:1+buffer.readUIntLE(27,3)};
  }
  return {bytes:buffer.length,dimensions,
    hasAlpha:webp&&buffer.subarray(12,16).toString()==='VP8X'&&!!(buffer[20]&0x10)};
}
if(manifest.schemaVersion!==1||!Array.isArray(manifest.runtimePrototypes)||
   !Array.isArray(manifest.productionAssets))errors.push('Malformed asset manifest');
for(const item of manifest.runtimePrototypes??[]){
  if(ids.has(item.id)||paths.has(item.path))errors.push('Duplicate asset: '+item.id);
  ids.add(item.id);paths.add(item.path);
  if(item.status!=='prototype')errors.push('Runtime source is not explicitly prototype: '+item.id);
  const result=await checkFile(item.path);
  if(result&&result.bytes<16*1024)warnings.push('LOW RES PROTOTYPE '+item.path+
    ' ('+result.bytes+' bytes): NOT APPROVED for production.');
}
for(const item of manifest.productionAssets??[]){
  if(ids.has(item.id)||paths.has(item.path))errors.push('Duplicate asset: '+item.id);
  ids.add(item.id);paths.add(item.path);
  if(!allowedStatuses.has(item.status))errors.push('Invalid status: '+item.id);
  if(!item.canvas||!Number.isInteger(item.canvas.width)||
    !Number.isInteger(item.canvas.height)||item.canvas.width<=0||
    item.canvas.height<=0)errors.push('Bad dimensions: '+item.id);
  checkedPath(item.path);
  if(item.frame){
    const p=item.frame;
    if(p.columns*p.frameWidth===item.canvas.width) {/* unused alternative */}
    if(p.width*p.columns!==item.canvas.width||
      p.height*p.rows!==item.canvas.height||
      p.columns*p.rows!==p.count)errors.push('Atlas layout mismatch: '+item.id);
  }
  if(item.status==='ready'||item.status==='review'){
    const result=await checkFile(item.path,item.minBytes??16000);
    if(result){
      if(['machine','machine-animation','worker'].includes(item.role)&&!result.hasAlpha)
        errors.push('Machine/worker painting or atlas needs real alpha transparency: '+item.path);
      if(['machine','machine-animation','worker'].includes(item.role)&&
         item.status==='ready'&&
         (item.approval?.visualReviewed!==true||
          typeof item.approval?.evidence!=='string'||
          item.approval.evidence.length<12))
        errors.push('Unreviewed painting cannot be marked ready: '+item.path);
      if(item.role==='worker'){
        const expected='art/production/workers/'+item.workerId+'.webp';
        if(!['brook','fern','cinder'].includes(item.workerId)||item.path!==expected||
           item.canvas.width!==512||item.canvas.height!==768)
          errors.push('Worker art needs independent 512x768 full-body CG: '+item.path);
        if(typeof item.sourceSha256!=='string'||!/^[a-f0-9]{64}$/.test(item.sourceSha256))
          errors.push('Review/ready worker CG requires SHA-256 provenance: '+item.path);
        else{
          const absolute=checkedPath(item.path);
          if(absolute){
            const actual=createHash('sha256').update(await readFile(absolute)).digest('hex');
            if(actual!==item.sourceSha256)errors.push('Worker painting source changed: '+item.path);
          }
        }
      }
      if(item.role==='machine'&&item.generatedFrom==='curated-cg-import'){
        const expected=item.sourceSha256;
        if(typeof expected!=='string'||!/^[a-f0-9]{64}$/.test(expected))
          errors.push('Curated machine art has no SHA-256 provenance: '+item.path);
        else{
          const absolute=checkedPath(item.path);
          if(absolute){
            const content=await readFile(absolute);
            const actual=createHash('sha256').update(content).digest('hex');
            if(actual!==expected)errors.push('Curated CG changed without approval: '+item.path);
          }
        }
      }
      if(item.role==='machine'||item.role==='machine-animation'){
        try{
          const absolute=checkedPath(item.path);
          if(absolute){
            const {data,info}=await sharp(absolute).ensureAlpha().raw()
              .toBuffer({resolveWithObject:true});
            const {width,height,channels}=info;
            let empty=0,border=0;
            for(let y=0;y<height;y++)for(let x=0;x<width;x++){
              const alpha=data[(y*width+x)*channels+3];
              if(alpha<6)empty++;
              if((x===0||x===width-1||y===0||y===height-1)&&alpha>6)border++;
            }
            const blank=empty/(width*height);
            const edge=border/(width*2+height*2-4);
            if(blank<.10||blank>.92||edge>.01)
              errors.push('Machine CG has clipped edges / opaque background: '+
                item.path+' blank='+blank.toFixed(3)+' edge='+edge.toFixed(3));
          }
        }catch(error){
          errors.push('Cannot sample transparent machine artwork: '+item.path+' '+error.message);
        }
      }
      if(!result.dimensions)errors.push('Cannot verify ready image dimensions: '+item.path);
      else if(result.dimensions.width!==item.canvas.width||
        result.dimensions.height!==item.canvas.height)
        errors.push('Unexpected review/ready image dimensions: '+item.path);
      if(item.role==='machine-animation'&&item.frame?.count===4){
        try{
          const absolute=checkedPath(item.path);
          if(absolute){
            const frames=await Promise.all([0,1,2,3].map(frame=>
              sharp(absolute).extract({left:frame*512,top:0,width:512,height:512})
                .ensureAlpha().raw().toBuffer()));
            if(frames.every(buffer=>buffer.equals(frames[0])))
              errors.push('All four machine working frames are identical: '+item.path);
          }
        }catch(error){errors.push('Cannot inspect atlas: '+item.path+' '+error.message);}
      }
    }
  }
}
// An animated machine must be tied to the exact SHA of a painting of the
// same approval tier. No motion atlas may independently become "ready".
for(const craft of WORKSHOP_CRAFTS){
  const atlas=manifest.productionAssets.find(
    item=>item.id==='machine.'+craft+'.working');
  const painting=manifest.productionAssets.find(
    item=>item.id==='machine.'+craft+'.lv2');
  try{
    validateMachineMotionContract(atlas,painting);
    if(atlas.status!=='pending'){
      const a=checkedPath(atlas.path),p=checkedPath(painting.path);
      if(a&&p){
        const [atlasBytes,paintingBytes]=await Promise.all([readFile(a),readFile(p)]);
        if(sha256(paintingBytes)!==painting.sourceSha256||
          sha256(atlasBytes)!==atlas.sourceSha256)
          throw Error('Working art SHA differs from manifest provenance');
        await inspectPaintedMachineMotion(paintingBytes,atlasBytes);
      }
    }
  }catch(error){
    errors.push('Machine motion compatibility '+craft+': '+error.message);
  }
}
for(const message of warnings)console.warn('[art] '+message);
console.log('[art] '+manifest.runtimePrototypes.length+' active prototype files; '+
  manifest.productionAssets.filter(x=>x.status==='ready').length+' ready / '+
  manifest.productionAssets.length+' specified formal assets.');
console.log('[art] Formal art is NOT release-ready until visual review and all mandatory sprites are approved.');
for(const message of errors)console.error('[art] '+message);
if(errors.length)process.exitCode=1;
