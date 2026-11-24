import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('..',import.meta.url));
const tracked=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
const entries=new Set(tracked);
const ext=/\.(?:png|jpe?g|webp|avif|svg|gif|mp4|ogg|wav|mp3)$/i;
const target='docs/resource-inventory.json';
const old=JSON.parse(readFileSync(path.join(root,target),'utf8'));
const media=tracked.filter(p=>ext.test(p)).sort().map(p=>{
  const bytes=readFileSync(path.join(root,p));
  return {path:p,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
});
const byHash=new Map();
for(const e of media){
  const paths=byHash.get(e.sha256)??[];
  paths.push(e.path);byHash.set(e.sha256,paths);
}
const duplicateGroups=[...byHash.values()].filter(g=>g.length>1);
const expected={schemaVersion:1,baseline:old.baseline,purpose:old.purpose,media,duplicateGroups};
if(process.argv.includes('--write')){
  writeFileSync(path.join(root,target),JSON.stringify(expected,null,2)+'\n');
}else{
  assert.deepEqual(old,expected,'Physical asset inventory drift. Stage asset paths, run --write, then commit the inventory.');
}
for(const forbidden of ['artwork/','management/','.aistudio/']){
  assert(!tracked.some(p=>p.startsWith(forbidden)),'Retired parallel directory reappeared: '+forbidden);
}
const primary=['README.md','docs/README.md','docs/ART-RESOURCE-CATALOG.md','public/art/README.md','docs/archive/README.md'];
const localExists=dest=>entries.has(dest)||tracked.some(p=>p.startsWith(dest+'/'));
for(const file of primary){
  assert(entries.has(file),'Missing documentation entry: '+file);
  const text=readFileSync(path.join(root,file),'utf8');
  for(const m of text.matchAll(/\]\(([^)\s]+)\)/g)){
    const href=m[1];
    if(/^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|#)/.test(href))continue;
    assert(!href.startsWith('/'),'Use a repository-relative or complete HTTPS link in '+file+': '+href);
    const dest=path.posix.normalize(path.posix.join(path.posix.dirname(file),decodeURIComponent(href.split('#')[0]))).replace(/\/$/,'');
    assert(localExists(dest),'Broken local link in '+file+': '+href);
  }
}
console.info('Repository inventory: '+media.length+' real assets, '+duplicateGroups.length+' duplicate groups; canonical links and retired directories checked.');
