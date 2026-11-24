import {execFileSync} from 'node:child_process';

const allowedRoots=new Set(['.agents','.github','app','art-sources','docs','e2e','public','scripts','src','tests','engine','vendor']);
const retired=/^(?:\.aistudio\/|artwork\/|management\/|docs\/prototypes\/|v2\/|metadata\.json$)/;
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
  if(retired.test(file))failures.push('Retired path: '+file);
}
console.log('Tracked root directories: '+[...roots].sort().join(', '));
console.log('Tracked root count: '+roots.size+'; violations: '+failures.length);
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
