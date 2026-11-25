import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

const allowedRoots=new Set(['.agents','.github','app','art-sources','docs','e2e','public','scripts','src','tests','engine','vendor']);
const retired=/^(?:\.aistudio\/|artwork\/|management\/|docs\/prototypes\/|v2\/|engine\/docs\/|metadata\.json$)/;
// The current public art entry points are documented in public/art/README.md.
// New business-purpose directories require an explicit catalog and gate update.
const publicArtDirs=new Set(['characters','covers','decorations','postcards','room-review','rooms','world-scenes']);
const publicArtRootFiles=new Set(['README.md','r12-53-transition-manifest.json','yuesha-avatar-v3.webp','yuesha-bust-v3.webp','yuesha-portrait-v3.webp']);
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
  if(/^public\/art\/world-scenes\/(?:workshop|town)\/review\//.test(file))failures.push('Retired PC transition directory: '+file);
  if(/^public\/art\/rooms\/(?:brook|cinder|fern|yuesha)\/review\//.test(file))failures.push('Retired room scenic directory: '+file);
  if(file.startsWith('public/art/beauty-beasts/'))failures.push('Retired beauty-beasts directory: '+file);
  // Check consumers, not just tracked asset paths. Historical documents and provenance
  // may legitimately retain their original paths; this gate targets runtime code.
  if(/^(?:app|src|engine\/src)\//.test(file)&&/\.(?:[cm]?[jt]sx?|css|json)$/.test(file)){
    const retiredArt=/(?:art\/(?:beauty-beasts|a05|feature-postcards)\/|art\/world-scenes\/(?:workshop|town)\/review\/|art\/rooms\/(?:brook|cinder|fern|yuesha)\/review\/|art\/lobby-hero-v[234](?:-mobile)?\.webp)/;
    readFileSync(file,'utf8').split('\n').forEach((line,index)=>{
      if(retiredArt.test(line.replaceAll('\\/','/')))failures.push('Retired art reference: '+file+':'+(index+1));
    });
  }
  if(retired.test(file))failures.push('Retired path: '+file);
}
console.log('Tracked root directories: '+[...roots].sort().join(', '));
console.log('Tracked root count: '+roots.size+'; violations: '+failures.length);
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
