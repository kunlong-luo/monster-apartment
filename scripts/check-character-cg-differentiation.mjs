import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {webpDimensions} from './prepare-room-background.mjs';

// Check brief structure and immutable pose-study file bytes. This cannot assess artistic quality or identity visually.
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
if(brief.cards['yuesha-eclipse'].identity!=='yuesha-r12-45'||
   brief.cards['yuesha-vow'].identity!=='yuesha-r12-45'||
   brief.cards['yuesha-eclipse'].face!==brief.cards['yuesha-vow'].face)fail('YueSha variants must preserve same face');
if(brief.expectedNativeCanvas.width!==1086||brief.expectedNativeCanvas.height!==1448)fail('phase-1 native minimum must be 1086x1448');
if(brief.premiumTargetCanvas?.width!==1536||brief.premiumTargetCanvas?.height!==2048)fail('optional premium target must stay documented');
for(const id of ids){const x=brief.cards[id];if(['pose','weapon','wardrobe'].some(k=>typeof x[k]!=='string'||x[k].length<10)||['scene','camera','motion'].some(k=>typeof x[k]!=='string'||x[k].length<6))fail(id+' incomplete shot brief');
 if(!Array.isArray(x.prohibited)||x.prohibited.length<3)fail(id+' must list three forbidden repetitions');}

// Optional research-only sources must be explicitly whitelisted, hash-locked and distinct
// from approved production slots. Checking bytes does not constitute human art approval.
for(const [id,study] of Object.entries(brief.poseStudies??{})){
  if(!ids.includes(id))fail('research art references unknown card '+id);
  const [resident,cardSlug]=id.split('-');
  // Revisioned pose studies are never the playable candidate or production slot.
  const revision=study.revision??1;
  if(!Number.isInteger(revision)||revision<1||revision>99)
    fail('invalid pose study revision '+id);
  const expected='docs/art-reviews/sources/'+resident+'-cg-'+cardSlug+'-pose-study-v'+revision+'.webp';
  if(study.path!==expected)
    fail('unapproved pose study path cannot point into a live or arbitrary slot '+id);
  if(revision>1&&study.supersedes!=='docs/art-reviews/sources/'+resident+'-cg-'+cardSlug+'-pose-study-v'+(revision-1)+'.webp')
    fail('revised pose study must preserve an explicit predecessor '+id);
  if(study.status!=='research-only'||study.approved!==false)fail('pose study must remain unapproved '+id);
  const bytes=readFileSync(resolve(root,study.path));
  const dim=webpDimensions(bytes);
  if(dim.width!==study.width||dim.height!==study.height||bytes.length!==study.bytes)
    fail('pose study dimensions or byte count changed '+id);
  const actual=createHash('sha256').update(bytes).digest('hex');
  if(study.sha256!==actual)fail('pose study checksum mismatch '+id);
  if(manifest.cards[id].status!=='portrait')fail('research art must not bypass production review '+id);
}

// Alternate concepts are preserved for side-by-side artistic inspection, never selected
// as the current research base, collectible preview or approved CG.
for(const [id,study] of Object.entries(brief.alternativePoseStudies??{})){
  if(!ids.includes(id))fail('unknown alternative pose card '+id);
  const current=brief.poseStudies?.[id];
  if(!current)fail('alternative has no active research baseline '+id);
  const revision=study.revision;
  if(!Number.isInteger(revision)||revision!==(current.revision??1)+1)
    fail('alternative revision must follow active research '+id);
  const [resident,cardSlug]=id.split('-');
  const expected='docs/art-reviews/sources/'+resident+'-cg-'+cardSlug+'-pose-study-v'+revision+'.webp';
  if(study.path!==expected||study.supersedes!==current.path)
    fail('alternative reference path or predecessor invalid '+id);
  if(study.selected!==false||study.approved!==false||study.status!=='research-only')
    fail('alternative must remain unselected and research-only '+id);
  const bytes=readFileSync(resolve(root,study.path));
  const dimension=webpDimensions(bytes);
  if(dimension.width!==study.width||dimension.height!==study.height||bytes.length!==study.bytes)
    fail('alternative size or dimensions changed '+id);
  if(createHash('sha256').update(bytes).digest('hex')!==study.sha256)
    fail('alternative checksum mismatch '+id);
  if(manifest.cards[id].status!=='portrait')
    fail('research alternative cannot approve production card '+id);
}

console.log('CG differentiation: 5 structural briefs and '+Object.keys(brief.poseStudies??{}).length+' checksum-locked research studies passed (NOT visual or commercial-use approval).');
