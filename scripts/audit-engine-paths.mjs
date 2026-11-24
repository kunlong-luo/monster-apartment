import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const oldPath=/(?:\bv2[\\/]|--prefix\s+["']?v2\b|(?:working-directory|cwd):\s*["']?v2\b|["']v2["']|\bcd\s+v2\b)/;
const newPath=/(?:\bengine[\\/]|--prefix\s+["']?engine\b|["']engine["'])/;
const counts={runtime:0,tests:0,tooling:0,docs:0,internal:0};
const violations=[];
for(const file of files){
  if(!/\.(?:[cm]?[jt]sx?|json|ya?ml|md|py|css|txt|sh)$/.test(file)||file.endsWith('package-lock.json')||file==='scripts/audit-engine-paths.mjs'||file==='scripts/audit-repository-layout.mjs')continue;
  const source=readFileSync(file,'utf8');
  const group=file.startsWith('engine/')?'internal':/^(?:app|src)\//.test(file)?'runtime':/^(?:tests|e2e)\//.test(file)?'tests':file.endsWith('.md')||file.startsWith('docs/')?'docs':'tooling';
  const hits=[];
  source.split('\n').forEach((line,index)=>{
    if(newPath.test(line))hits.push(index+1);
    if(group!=='docs'&&oldPath.test(line))violations.push(file+':'+(index+1)+' '+line.trim());
  });
  if(hits.length){counts[group]++;console.log(group+' '+file+' : '+hits.join(','));}
}
console.log('Engine reference files: '+JSON.stringify(counts));
console.log('Old executable path violations: '+violations.length);
if(violations.length){console.error(violations.join('\n'));process.exitCode=1;}
