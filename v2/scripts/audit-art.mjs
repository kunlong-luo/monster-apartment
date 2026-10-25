import {readFile, stat} from 'node:fs/promises';
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
  return {bytes:buffer.length,dimensions};
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
  if(item.status==='ready'){
    const result=await checkFile(item.path,item.minBytes??16000);
    if(result){
      if(!result.dimensions)errors.push('Cannot verify ready image dimensions: '+item.path);
      else if(result.dimensions.width!==item.canvas.width||
        result.dimensions.height!==item.canvas.height)
        errors.push('Unexpected ready image dimensions: '+item.path);
    }
  }
}
for(const message of warnings)console.warn('[art] '+message);
console.log('[art] '+manifest.runtimePrototypes.length+' active prototype files; '+
  manifest.productionAssets.filter(x=>x.status==='ready').length+' ready / '+
  manifest.productionAssets.length+' specified formal assets.');
console.log('[art] Formal art is NOT release-ready until visual review and all mandatory sprites are approved.');
for(const message of errors)console.error('[art] '+message);
if(errors.length)process.exitCode=1;
