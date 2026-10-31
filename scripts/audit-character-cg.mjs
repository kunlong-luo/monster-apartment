import {readFileSync,existsSync} from 'node:fs';
import {resolve,join,dirname,basename} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {webpDimensions} from './prepare-room-background.mjs';

const root=resolve(import.meta.dirname,'..');
const manifestPath=join(root,'public/art/beauty-beasts/characters/cg-manifest.json');
export const CG_PATHS={
  'yuesha-eclipse':'yuesha/cg-eclipse.webp',
  'yuesha-vow':'yuesha/cg-vow.webp',
  'brook-tide':'brook/cg-tide.webp',
  'fern-spring':'fern/cg-spring.webp',
  'cinder-ember':'cinder/cg-ember.webp',
};
export const CG_VIEWPORTS=['desktop-1440x900','desktop-1648x928','mobile-390x844'];
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const check=(yes,message)=>{if(!yes)throw new Error('Character CG: '+message);};
export function inspectCharacterCg(bytes){
  check(Buffer.isBuffer(bytes)&&bytes.length>=100000&&bytes.length<=12*1024*1024,
    'WebP must be 100KB–12MB');
  const info=webpDimensions(bytes);
  check(info.width>=1536&&info.height>=2048,'CG must be >=1536x2048');
  check(Math.abs(info.width/info.height-3/4)<.018,'CG must have a 3:4 canvas');
  return {...info,bytes:bytes.length,sha256:sha256(bytes)};
}
export function assertCharacterCgReview({card,review,bytes}){
  check(Object.hasOwn(CG_PATHS,card),'unrecognized card '+card);
  const info=inspectCharacterCg(bytes);
  check(review?.card===card&&review.approved===true&&review.humanVisualReview===true,
    'review approval and card identity required');
  check(review.image?.sha256===info.sha256&&review.image.width===info.width&&
    review.image.height===info.height&&review.image.bytes===info.bytes,
    'reviewed image bytes or dimensions changed');
  check(['ai-generated','artist-original','licensed'].includes(review.sourceType)&&
    typeof review.sourceReference==='string'&&review.sourceReference.trim().length>=8,
    'asset origin reference is missing');
  check(review.original===true&&review.commercialUse===true&&review.rightsConfirmed===true,
    'originality/rights/commercial permission must be reviewed');
  check(review.noBakedUI===true&&review.fullBodyVisible===true&&
    review.characterIdentityConsistent===true&&review.handsAndFeetReviewed===true&&
    review.noBakedText===true,
    'independent full-body visual review incomplete');
  check(CG_VIEWPORTS.every(v=>review.visualReview?.[v]===true),
    'desktop and mobile previews must all pass');
  check(Number.isFinite(Date.parse(review.reviewedAt??''))&&
    typeof review.reviewer==='string'&&review.reviewer.trim().length>=3&&
    typeof review.reviewNotes==='string'&&review.reviewNotes.trim().length>=24,
    'dated human review notes are required');
  check(Number.isInteger(review.nativeResolution?.width)&&
    Number.isInteger(review.nativeResolution?.height)&&
    review.nativeResolution.width>=1536&&review.nativeResolution.height>=2048,
    'original/native image resolution must be documented and pass requirements');
  return info;
}
export function auditCharacterCg(){
  const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
  check(manifest.version===1,'unexpected manifest version');
  const ids=Object.keys(CG_PATHS);
  check(JSON.stringify(Object.keys(manifest.cards??{}).sort())===JSON.stringify([...ids].sort()),
    'manifest must contain exactly the five playable cards');
  let production=0;
  for(const card of ids){
    const entry=manifest.cards[card];
    const relative='public/art/beauty-beasts/characters/'+CG_PATHS[card];
    check(entry.path===relative,'invalid asset path '+card);
    check(['portrait','production'].includes(entry.status),'invalid status '+card);
    const assetPath=join(root,relative);
    const proofPath=join(dirname(assetPath),'cg-provenance-'+basename(assetPath,'.webp')+'.json');
    if(entry.status==='portrait'){
      check(!existsSync(assetPath)&&!existsSync(proofPath),
        'unreviewed art exists outside production manifest '+card);
      continue;
    }
    check(existsSync(assetPath)&&existsSync(proofPath),'production art/provenance missing '+card);
    const bytes=readFileSync(assetPath);
    const review=JSON.parse(readFileSync(proofPath,'utf8'));
    assertCharacterCgReview({card,review,bytes});
    production++;
  }
  return {production,total:ids.length};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{const result=auditCharacterCg();console.log('Character CG: '+result.production+'/'+result.total+' production cards reviewed');}
  catch(error){console.error(error.message);process.exitCode=1;}
}
