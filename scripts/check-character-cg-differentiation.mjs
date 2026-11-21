import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// This only validates that distinct art briefs are specified; it CANNOT judge generated pixels.
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const brief=JSON.parse(readFileSync(resolve(root,'docs/art-reviews/CG-DIFFERENTIATION-SHOT-LIST.json'),'utf8'));
const manifest=JSON.parse(readFileSync(resolve(root,'public/art/beauty-beasts/characters/cg-manifest.json'),'utf8'));
const fail=message=>{throw new Error('CG differentiation brief: '+message);};
if(brief.schemaVersion!==1||brief.productionApproved!==false)fail('unexpected version or production approval');
const ids=Object.keys(manifest.cards).sort(),specified=Object.keys(brief.cards).sort();
if(JSON.stringify(ids)!==JSON.stringify(specified)||ids.length!==5)fail('all five active card IDs must have briefs');
for(const field of ['poseId','silhouetteId','weaponId','wardrobeId']){
  const values=ids.map(id=>brief.cards[id][field]);
  if(values.some(v=>typeof v!=='string'||!v.trim())||new Set(values).size!==ids.length)
    fail(field+' must be unique and nonempty for every card');
}
const names=ids.filter(x=>!x.startsWith('yuesha'));
const faces=names.map(id=>brief.cards[id].face);
if(faces.some(x=>!x||x.length<15)||new Set(faces).size!==3)fail('the three non-Yuesha facial briefs must differ');
if(brief.cards['yuesha-eclipse'].identity!=='yuesha-v3'||
   brief.cards['yuesha-vow'].identity!=='yuesha-v3'||
   brief.cards['yuesha-eclipse'].face!==brief.cards['yuesha-vow'].face)fail('YueSha variants must preserve same face');
if(brief.expectedNativeCanvas.width!==1536||brief.expectedNativeCanvas.height!==2048)fail('native canvas minimum was lowered');
for(const id of ids){const x=brief.cards[id];if(['pose','weapon','wardrobe'].some(k=>typeof x[k]!=='string'||x[k].length<10)||['scene','camera','motion'].some(k=>typeof x[k]!=='string'||x[k].length<6))fail(id+' incomplete shot brief');
 if(!Array.isArray(x.prohibited)||x.prohibited.length<3)fail(id+' must list three forbidden repetitions');}
console.log('CG differentiation: 5 structural briefs passed (NOT visual or commercial-use approval).');
