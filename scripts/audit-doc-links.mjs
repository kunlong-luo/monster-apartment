import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const entries=new Set(tracked);
// Current normative documents and navigation entrypoints; historical reports are not gates.
const primary=[
  'README.md','docs/README.md','docs/ART-RESOURCE-CATALOG.md','public/art/README.md','docs/v3/README.md',
  'AGENTS.md','PRODUCT.md','DESIGN.md','docs/CURRENT_ARCHITECTURE.md','docs/DECISIONS.md',
  'docs/engineering/ITERATION-PLAYBOOK.md','docs/engineering/GAP-REGISTER-2026-11-22.md',
  'docs/CHARACTER-CREATION-SOP.md','docs/CHARACTER-CG-NATIVE-PIPELINE.md','docs/IMPECCABLE.md',
  'docs/design/WORKSHOP-ASSET-SPEC.md',
];
const exists=dest=>entries.has(dest)||tracked.some(p=>p.startsWith(dest+'/'));
const failures=[];
let checked=0;
for(const file of primary){
  if(!entries.has(file)){failures.push('Missing entry: '+file);continue;}
  const source=readFileSync(file,'utf8');
  for(const match of source.matchAll(/\]\(([^)\s]+)\)/g)){
    const href=match[1];
    if(/^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|#)/.test(href))continue;
    if(href.startsWith('/')){failures.push(file+': use a repository-relative link: '+href);continue;}
    try{
      const dest=path.posix.normalize(path.posix.join(path.posix.dirname(file),decodeURIComponent(href.split('#')[0]))).replace(/\/$/,'');
      checked++;
      if(!exists(dest))failures.push(file+': broken link '+href);
    }catch{failures.push(file+': invalid link '+href);}
  }
}
console.log('Documentation entrypoints: '+primary.length+'; checked links: '+checked+'; violations: '+failures.length);
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
