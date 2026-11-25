import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const mediaPattern=/\.(png|webp|jpe?g|avif|gif|svg|ogg|mp3|wav|woff2)$/i;
export const allowedDuplicate={
  paths:[
    'docs/art-reviews/sources/winechan-gothic-manor-full-pack/candidate-05.webp',
    'public/art/room-review/yuesha-salon-candidate.webp'
  ],
  gitBlob:'3e384235b220f3e60502492cdd5fa850e6d43547',
  bytes:155188
};

export function auditMediaDuplicates(entries,exceptions=[allowedDuplicate]){
  const groups=new Map();
  for(const {path,bytes} of entries){
    if(!mediaPattern.test(path))continue;
    const gitBlob=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
    const sha256=createHash('sha256').update(bytes).digest('hex');
    const group=groups.get(sha256)??{sha256,gitBlob,bytes:bytes.length,paths:[]};
    group.paths.push(path);
    groups.set(sha256,group);
  }
  const duplicates=[...groups.values()].filter(group=>group.paths.length>1).map(group=>{
    group.paths.sort();
    return {...group,allowed:exceptions.some(entry=>entry.gitBlob===group.gitBlob&&entry.bytes===group.bytes&&
      JSON.stringify([...entry.paths].sort())===JSON.stringify(group.paths))};
  });
  return {mediaCount:[...groups.values()].reduce((count,group)=>count+group.paths.length,0),duplicates,
    unexpected:duplicates.filter(group=>!group.allowed)};
}

// Section 5 is the human-readable inventory, not a production approval.
export function auditMediaCatalog(entries,markdown){
  const issues=[],inventory=new Map(),groups=new Map();
  for(const {path,bytes} of entries){
    if(!mediaPattern.test(path))continue;
    const gitBlob=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
    inventory.set(path,{bytes:bytes.length,gitBlob});
    const key=path.startsWith('public/art/')?'public/art':
      path.startsWith('public/assets/')?'public/assets':
      path.startsWith('engine/art/')?'engine/art':path.split('/')[0];
    const group=groups.get(key)??{paths:0,bytes:0};
    group.paths++;group.bytes+=bytes.length;groups.set(key,group);
  }
  const start=markdown.search(/^## 5\. /m);
  const tail=start<0?'':markdown.slice(start);
  const next=tail.slice(1).search(/^## /m);
  const body=next<0?tail:tail.slice(0,next+1);
  if(start<0)issues.push('Missing catalog section 5');
  const seen=new Set();
  const rowPattern=/^\| \x60([^\x60]+)\x60 \| (\d+) \| \x60([0-9a-f]{12})\x60 \|[ \t]*\r?$/;
  for(const line of body.split('\n')){
    if(!line.startsWith('| '+String.fromCharCode(96)))continue;
    const row=line.match(rowPattern);
    if(!row){issues.push('Malformed inventory row: '+line);continue;}
    const [,path,size,sha]=row;
    if(seen.has(path))issues.push('Repeated catalog path: '+path);
    seen.add(path);
    const actual=inventory.get(path);
    if(!actual){issues.push('Catalog path is not tracked media: '+path);continue;}
    if(actual.bytes!==Number(size)||!actual.gitBlob.startsWith(sha)){
      issues.push('Catalog byte count or Git blob mismatch: '+path);
    }
  }
  for(const path of inventory.keys())if(!seen.has(path))issues.push('Missing catalog path: '+path);
  return {mediaCount:inventory.size,totalBytes:[...inventory.values()].reduce((sum,row)=>sum+row.bytes,0),
    groups:Object.fromEntries([...groups].sort(([a],[b])=>a.localeCompare(b))),issues};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
  // Tracked assets only: never scan dependency caches or generated export copies.
  const names=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(name=>mediaPattern.test(name));
  const entries=names.map(path=>({path,bytes:readFileSync(resolve(root,path))}));
  const result=auditMediaDuplicates(entries);
  const catalog=auditMediaCatalog(entries,readFileSync(resolve(root,'docs/ART-RESOURCE-CATALOG.md'),'utf8'));
  console.log(JSON.stringify({...result,catalog},null,2));
  if(catalog.issues.length){console.error('Media catalog drift; synchronize section 5 with tracked paths, bytes and Git blob prefixes.');process.exitCode=1;}
  if(result.unexpected.length){console.error('Unexpected duplicate media; reuse the existing path or document a checksum-bound exception.');process.exitCode=1;}
}
