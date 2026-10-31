import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const sourceDir=path.join(root,'src/components');
let problems=0;
let inspected=0;

function inspect(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()){inspect(file);continue;}
    if(!entry.isFile()||!entry.name.endsWith('.tsx'))continue;
    inspected++;
    const source=fs.readFileSync(file,'utf8');
    if(/\b(?:Sparkles|WandSparkles)\b|lucide-sparkles/.test(source)){
      console.error('[design] Sparkles family icon is disallowed: '+path.relative(root,file));
      problems++;
    }
  }
}
inspect(sourceDir);
for(const file of ['PRODUCT.md','DESIGN.md','docs/IMPECCABLE.md']){
  if(!fs.existsSync(path.join(root,file))){
    console.error('[design] Missing durable project context: '+file);
    problems++;
  }
}
if(problems)process.exit(1);
console.log('[design] '+inspected+' game UI components checked; no starburst icons. Context documents ready.');
