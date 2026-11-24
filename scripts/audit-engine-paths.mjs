import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

// A read-only migration inventory; no path replacement or save-key change.
// Scan tracked text (including YAML, JSON and docs), not media or gitlinks.
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const counts={runtime:0,tests:0,tooling:0,docs:0,internal:0};
const pathPattern=/(?:\bv2[\\/]|--prefix\s+["']?v2\b|(?:working-directory|cwd):\s*["']?v2\b|["']v2["']|\bcd\s+v2\b)/;
const retiredDoc=/(?:v2\/docs\/|ART-ASSET-PACK-V1\.md|ROUTING-V2\.2\.md|adult-character-art-direction\.md|GAME-ROADMAP\.md)/;
for(const file of files){
  if(!/\.(?:[cm]?[jt]sx?|json|ya?ml|md|py|css|txt|sh)$/.test(file)||file.endsWith('package-lock.json')||file==='scripts/audit-engine-paths.mjs')continue;
  const source=readFileSync(file,'utf8');
  const hits=[];
  source.split('\n').forEach((line,index)=>{
    if(pathPattern.test(line)||retiredDoc.test(line))hits.push(index+1);
  });
  if(!hits.length)continue;
  const group=file.startsWith('v2/')?'internal':/^(?:app|src)\//.test(file)?'runtime':/^(?:tests|e2e)\//.test(file)?'tests':file.endsWith('.md')||file.startsWith('docs/')?'docs':'tooling';
  counts[group]++;
  console.log(group+' '+file+' : '+hits.join(','));
}
console.log('Engine migration reference files: '+JSON.stringify(counts));
console.log('Advisory only: paths in history URLs, review manifests, save IDs and public URLs need semantic review; no automatic replacements.');
