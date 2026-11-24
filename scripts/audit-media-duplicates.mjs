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

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
  // Tracked assets only: never scan dependency caches or generated export copies.
  const names=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(name=>mediaPattern.test(name));
  const result=auditMediaDuplicates(names.map(path=>({path,bytes:readFileSync(resolve(root,path))})));
  console.log(JSON.stringify(result,null,2));
  if(result.unexpected.length){console.error('Unexpected duplicate media; reuse the existing path or document a checksum-bound exception.');process.exitCode=1;}
}
