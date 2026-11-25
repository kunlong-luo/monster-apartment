import {execFileSync} from 'node:child_process';

const allowedRoots=new Set(['.agents','.github','app','art-sources','docs','e2e','public','scripts','src','tests','engine','vendor']);
const retired=/^(?:\.aistudio\/|artwork\/|management\/|docs\/prototypes\/|v2\/|engine\/docs\/|metadata\.json$)/;
// The current public art entry points are documented in public/art/README.md.
// New business-purpose directories require an explicit catalog and gate update.
const publicArtDirs=new Set(['beauty-beasts','decorations','postcards','room-review','rooms','world-scenes']);
const publicArtRootFiles=new Set(['README.md','r12-53-transition-manifest.json','lobby-hero-v2.webp','lobby-hero-v3.webp','lobby-hero-v4.webp','lobby-hero-v4-mobile.webp','yuesha-avatar-v3.webp','yuesha-bust-v3.webp','yuesha-portrait-v3.webp']);
const paths=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const failures=[];
const roots=new Set();
for(const file of paths){
  const slash=file.indexOf('/');
  if(slash!==-1){
    const root=file.slice(0,slash);
    roots.add(root);
    if(!allowedRoots.has(root))failures.push('Unregistered root: '+file);
  }
  if(file.startsWith('public/art/')){
    const parts=file.slice('public/art/'.length).split('/');
    if(parts.length===1 ? !publicArtRootFiles.has(parts[0]) : !publicArtDirs.has(parts[0])){
      failures.push('Unregistered public art entry: '+file);
    }
  }
  if(retired.test(file))failures.push('Retired path: '+file);
}
console.log('Tracked root directories: '+[...roots].sort().join(', '));
console.log('Tracked root count: '+roots.size+'; violations: '+failures.length);
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
