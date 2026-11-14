import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {webpDimensions} from './prepare-room-background.mjs';

/**
 * R12 #16/#24: review-only generated images MUST NOT be implicitly promoted.
 * This gate checks headers / hashes / declarations, not human visual quality.
 */
const ROOT=resolve(import.meta.dirname,'..');
export const SCENE_IDS={
  apartment:['S02','/apartment/'],
  orders:['S05','/orders/'],
  warehouse:['S06','/warehouse/'],
};
const MANIFEST_PATH='public/art/world-scenes/r12-scene-manifest.json';
const SHA=/^[0-9a-f]{64}$/;
const assert=(ok,message)=>{if(!ok)throw new Error('[r12-art] '+message);};
const checksum=bytes=>createHash('sha256').update(bytes).digest('hex');

export function validateSceneManifest(manifest,{read=readFileSync,exists=existsSync,root=ROOT}={}){
  assert(manifest?.version===1,'unsupported scene manifest version');
  assert(Object.keys(manifest.scenes??{}).sort().join(',')===
    Object.keys(SCENE_IDS).sort().join(','),'expected exactly S02, S05 and S06');
  const productionHashes=new Set();
  let promoted=0;
  for(const [area,[id,route]] of Object.entries(SCENE_IDS)){
    const entry=manifest.scenes[area];
    assert(entry.id===id&&entry.route===route,'route/id mismatch for '+area);
    assert(['pending','review','production'].includes(entry.status),
      'invalid status for '+area);
    assert(entry.desktop==='public/art/world-scenes/r12/'+area+'-desktop.webp',
      'unexpected desktop path for '+area);
    assert(entry.mobile==='public/art/world-scenes/r12/'+area+'-mobile.webp',
      'unexpected mobile path for '+area);

    if(entry.candidate){
      const c=entry.candidate;
      assert(['ai-generated','artist-original','licensed'].includes(c.sourceType),
        'candidate origin required for '+area);
      assert(typeof c.sourceReference==='string'&&c.sourceReference.trim().length>=30,
        'candidate source reference required for '+area);
      assert(SHA.test(c.sourceSHA256??''),'candidate source hash required for '+area);
      assert(Number.isInteger(c.nativeWidth)&&Number.isInteger(c.nativeHeight)&&
        c.nativeWidth>0&&c.nativeHeight>0,'candidate native dimensions required '+area);
    }else assert(entry.status==='pending','non-pending scene lacks candidate '+area);

    for(const field of ['desktop','mobile']){
      const path=entry[field];
      assert(!path.includes('..')&&path.startsWith('public/art/world-scenes/r12/'),
        'unsafe asset path '+path);
      if(entry.status!=='production')assert(!exists(join(root,path)),
        'unreviewed file placed in live scene slot '+path);
    }
    if(entry.status!=='production'){
      assert(entry.review===null,'unpromoted scenes must not claim approval '+area);
      continue;
    }
    const review=entry.review;
    assert(review?.approved===true&&review.humanVisualReview===true&&
      review.rightsConfirmed===true&&review.commercialUse===true,
      'manual approval and rights review required '+area);
    assert(review.noBakedUI===true&&review.noBakedText===true&&
      review.nativeDesktopArtwork===true&&review.nativeMobileArtwork===true&&
      review.notUpscaledFromSmallerImage===true,
      'native dual composition and art review required '+area);
    assert(typeof review.reviewer==='string'&&review.reviewer.trim().length>=3&&
      typeof review.notes==='string'&&review.notes.trim().length>=30&&
      Number.isFinite(Date.parse(review.reviewedAt??'')),
      'dated human signoff required '+area);
    assert(SHA.test(review.sourceSHA256??'')&&
      typeof review.sourceReference==='string'&&review.sourceReference.length>=30,
      'source provenance required '+area);
    assert(review.crops?.['desktop-1440x900']===true&&
      review.crops?.['desktop-1648x928-dpr2']===true&&
      review.crops?.['mobile-390x844']===true&&
      review.crops?.['mobile-390x550']===true,
      'all desktop/mobile reference crops must be reviewed '+area);

    for(const [field,minW,minH] of [['desktop',2560,1440],['mobile',1080,1920]]){
      const path=entry[field];
      assert(exists(join(root,path)),'missing approved scene image '+path);
      const bytes=read(join(root,path));
      assert(bytes.length>=100000&&bytes.length<=12*1024*1024,
        'scene art must be 100KB-12MB '+path);
      const {width,height}=webpDimensions(bytes);
      assert(width>=minW&&height>=minH,
        'insufficient native source pixels '+path+': '+width+'x'+height);
      const pinned=review.output?.[field];
      assert(pinned?.sha256===checksum(bytes)&&
        pinned?.width===width&&pinned?.height===height&&pinned?.bytes===bytes.length,
        'image metadata/checksum drift '+path);
      assert(!productionHashes.has(pinned.sha256),
        'two distinct scenes/compositions share image bytes '+path);
      productionHashes.add(pinned.sha256);
    }
    promoted++;
  }
  return {promoted,pending:3-promoted};
}
function main(){
  const manifest=JSON.parse(readFileSync(join(ROOT,MANIFEST_PATH),'utf8'));
  const result=validateSceneManifest(manifest);
  console.log('[r12-art] admission passed: '+result.promoted+
    '/3 production; '+result.pending+' waiting for native original art and human review');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{main();}catch(error){console.error(error.message);process.exitCode=1;}
}
