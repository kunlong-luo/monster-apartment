import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {webpDimensions} from './prepare-room-background.mjs';
import {coverUpsampleProfiles} from './r12-pixel-geometry.mjs';

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

/** Compare real native source and published output pixels with the same
 * CSS cover viewport/DPR matrix as the independent ZIP review inspector.
 * This prevents a nominal 2560×1440 image passing while still being enlarged
 * on the supported 1648×928 DPR2 monitor.
 */
function assertNoRetinaUpsample(width,height,kind,path){
  const failures=coverUpsampleProfiles(width,height,kind);
  assert(failures.length===0,
    'DPR/cover upsampling at '+path+': '+
    failures.map(x=>x.id+' '+x.scale.toFixed(3)+'x').join(', '));
}


/** The six actual S02 room buttons need distinct anchor sites in BOTH
 * original compositions. Coordinates are normalized on the un-cropped master,
 * not percentage values on a particular viewport. Cover projection preserves
 * correct door positions when the phone and desktop ratios differ.
 */
export function sceneCoverAnchor(point,source,viewport){
  const scale=Math.max(viewport.width/source.width,viewport.height/source.height);
  return {
    x:point.x*source.width*scale-
      (source.width*scale-viewport.width)/2,
    y:point.y*source.height*scale-
      (source.height*scale-viewport.height)/2,
  };
}

function assertApartmentRoomHotspots(review,entry){
  const groups=review.roomHotspots;
  assert(groups&&typeof groups==='object'&&!Array.isArray(groups),
    'S02 six room art hotspots required on both compositions');
  const viewports={
    desktop:[{width:1440,height:900},{width:1648,height:928}],
    mobile:[{width:390,height:844},{width:390,height:550}],
  };
  for(const kind of ['desktop','mobile']){
    const points=groups[kind];
    assert(Array.isArray(points)&&points.length===6,
      'S02 requires exactly six '+kind+' room art hotspots');
    const source=kind==='desktop'?entry.candidate:entry.mobileCandidate;
    const ids=new Set();
    for(const point of points){
      assert(Number.isInteger(point?.roomIndex)&&point.roomIndex>=0&&
        point.roomIndex<6&&!ids.has(point.roomIndex),
        'S02 room art hotspot ID must be unique and match rooms 0-5');
      ids.add(point.roomIndex);
      assert(Number.isFinite(point.x)&&Number.isFinite(point.y)&&
        point.x>=0&&point.x<=1&&point.y>=0&&point.y<=1,
        'S02 room hotspot position must be normalized to original artwork');
    }
    for(const viewport of viewports[kind]){
      const positions=points.map(point=>sceneCoverAnchor(point,
        {width:source.nativeWidth,height:source.nativeHeight},viewport));
      for(let i=0;i<positions.length;i++){
        const point=positions[i];
        // The 22px clearance gives a room a 44px minimum tap target.
        assert(point.x>=22&&point.x<=viewport.width-22&&
          point.y>=22&&point.y<=viewport.height-22,
          'S02 room hotspot cropped outside safe '+kind+' viewport');
        for(let j=0;j<i;j++){
          // The runtime button occupies a square hit box, even if it is
          // visually rounded. Diagonal centers can be >44px apart while
          // their 44x44 pointer rectangles still intersect.
          assert(Math.abs(point.x-positions[j].x)>=44||
            Math.abs(point.y-positions[j].y)>=44,
            'S02 '+kind+' room hotspots overlap at viewport '+viewport.width+'x'+viewport.height);
        }
      }
    }
  }
  assert(review.roomHotspotBrowserProof?.desktop===true&&
    review.roomHotspotBrowserProof?.mobile===true,
    'S02 room hotspot browser interaction review required on both devices');
}

/** Inspect the actual original PNG bytes (not a claimed filename or WebP export).
 * The trusted SHA links this file to the signed review of the same master.
 */
export function pngNativeDimensions(bytes){
  assert(Buffer.isBuffer(bytes)&&bytes.length>=24,'incomplete original PNG');
  assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
    'original master is not a PNG');
  assert(bytes.toString('ascii',12,16)==='IHDR','original PNG lacks IHDR');
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
  assert(width>0&&height>0,'invalid original PNG dimensions');
  return {width,height};
}

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

    if(entry.mobileCandidate){
      const mobile=entry.mobileCandidate;
      assert(entry.candidate,'mobile art requires a desktop candidate '+area);
      assert(['ai-generated','artist-original','licensed'].includes(mobile.sourceType),
        'mobile candidate origin required for '+area);
      assert(typeof mobile.sourceReference==='string'&&mobile.sourceReference.trim().length>=30,
        'mobile candidate provenance required for '+area);
      assert(SHA.test(mobile.sourceSHA256??'')&&
        mobile.sourceSHA256!==entry.candidate.sourceSHA256,
        'independent mobile source hash required for '+area);
      assert(Number.isInteger(mobile.nativeWidth)&&Number.isInteger(mobile.nativeHeight)&&
        mobile.nativeWidth>0&&mobile.nativeHeight>0&&mobile.independentComposition===true,
        'separately composed mobile source dimensions required for '+area);
    }

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
    // Compare the native source masters, not merely the exported WebP headers.
    // Enlarging a 1672x941 PNG to 2560x1440 cannot satisfy this source gate.
    assert(entry.candidate?.nativeWidth>=2560&&entry.candidate?.nativeHeight>=1440,
      'native desktop source below production threshold '+area);
    assert(entry.mobileCandidate?.nativeWidth>=1080&&entry.mobileCandidate?.nativeHeight>=1920,
      'native independent mobile source below production threshold '+area);

    assert(review.sourceSHA256===entry.candidate.sourceSHA256&&
      review.mobileSourceSHA256===entry.mobileCandidate.sourceSHA256,
      'review source hashes must match both original compositions '+area);
    // Proof must be present in Git: declared original pixels alone are not
    // verifiable. Source masters live outside /public and aren't shipped.
    for(const [field,meta,minW,minH] of [
      ['desktop',entry.candidate,2560,1440],
      ['mobile',entry.mobileCandidate,1080,1920],
    ]){
      const sourcePath='art-sources/r12/'+area+'-'+field+'.png';
      assert(meta.originalPath===sourcePath,'original source path required '+area+'/'+field);
      assert(exists(join(root,sourcePath)),'missing original source PNG '+sourcePath);
      const sourceBytes=read(join(root,sourcePath));
      assert(checksum(sourceBytes)===meta.sourceSHA256,
        'original source hash drift '+sourcePath);
      const size=pngNativeDimensions(sourceBytes);
      assert(size.width===meta.nativeWidth&&size.height===meta.nativeHeight&&
        size.width>=minW&&size.height>=minH,
        'native original file resolution mismatch '+sourcePath);
      assertNoRetinaUpsample(size.width,size.height,field,sourcePath);
    }
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
      assertNoRetinaUpsample(width,height,field,path);
      const original=field==='desktop'?entry.candidate:entry.mobileCandidate;
      // Cover projection is measured on the original, so the output must
      // preserve its full composition. Allow at most one output pixel of
      // integer encoder rounding, never a changed crop or stretched canvas.
      assert(Math.abs(width*original.nativeHeight-height*original.nativeWidth)<=
        Math.max(original.nativeWidth,original.nativeHeight),
        'output aspect ratio differs from original '+path);
      assert(width<=original.nativeWidth&&height<=original.nativeHeight,
        'output is larger than native original '+path);
      const pinned=review.output?.[field];
      assert(pinned?.sha256===checksum(bytes)&&
        pinned?.width===width&&pinned?.height===height&&pinned?.bytes===bytes.length,
        'image metadata/checksum drift '+path);
      assert(!productionHashes.has(pinned.sha256),
        'two distinct scenes/compositions share image bytes '+path);
      productionHashes.add(pinned.sha256);
    }
    if(area==='apartment')assertApartmentRoomHotspots(review,entry);
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
