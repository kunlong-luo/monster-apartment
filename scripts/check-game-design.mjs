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
// Keep the three former Gothic palettes wired to ONE canonical source.
const palette=fs.readFileSync(path.join(root,'src/components/game/gothic-premium-tokens.css'),'utf8');
const tailwind=fs.readFileSync(path.join(root,'app/globals.css'),'utf8');
const legacy=fs.readFileSync(path.join(root,'src/components/game/gothic-red-gold.css'),'utf8');
const shared=fs.readFileSync(path.join(root,'src/components/game/gothic-hud.tsx'),'utf8');
const layout=fs.readFileSync(path.join(root,'app/layout.tsx'),'utf8');
for(const t of ['night','panel','wine','brass','champagne','ivory','muted']){
  if(!palette.includes('--craft-'+t+':')){
    console.error('[design] Missing canonical palette token '+t);problems++;
  }
}
for(const t of ['night','panel','wine','brass','ivory','muted']){
  if(!tailwind.includes('--color-gothic-'+t+': var(--craft-')){
    console.error('[design] Tailwind Gothic color must use canonical token '+t);problems++;
  }
}
if(/:root\s*\{[^}]*--moon-ui-/s.test(legacy)){
  console.error('[design] Duplicate root palette in gothic-red-gold.css');problems++;
}
if(/#[a-fA-F0-9]{3,8}\b/.test(shared)){
  console.error('[design] Shared controls still have hardcoded palette colors');problems++;
}
if(!layout.includes("import '@/components/game/gothic-premium-tokens.css';")){
  console.error('[design] Root layout must load the palette for all pages');problems++;
}
for(const c of ['gothic-dock__link','gothic-modal__surface','gothic-resource-pill','gothic-action-button']){
  if(!shared.includes(c)){console.error('[design] Shared HUD missing '+c);problems++;}
}
if(problems)process.exit(1);
console.log('[design] '+inspected+' game UI components checked; no starburst icons. Context documents ready.');
