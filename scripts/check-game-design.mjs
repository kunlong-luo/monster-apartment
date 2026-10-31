import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const sourceDir=path.join(root,'src/components/summon');
const targets=fs.readdirSync(sourceDir).filter(name=>name.endsWith('.tsx'));
let problems=0;
for(const file of targets){
  const source=fs.readFileSync(path.join(sourceDir,file),'utf8');
  if(/\bSparkles\b|lucide-sparkles/.test(source)){
    console.error('[design] Disallowed Sparkles icon in src/components/summon/'+file);
    problems++;
  }
}
for(const file of ['PRODUCT.md','DESIGN.md','docs/IMPECCABLE.md']){
  if(!fs.existsSync(path.join(root,file))){
    console.error('[design] Missing durable project context: '+file);
    problems++;
  }
}
if(problems)process.exit(1);
console.log('[design] Summon icon vocabulary + product and design documentation: OK');
