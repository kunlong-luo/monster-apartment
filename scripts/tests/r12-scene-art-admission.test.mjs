import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {coverUpsampleProfiles} from '../r12-pixel-geometry.mjs';
import {validateSceneManifest,pngNativeDimensions,sceneCoverAnchor} from '../audit-r12-scene-art.mjs';

const manifest=JSON.parse(readFileSync(
  resolve(import.meta.dirname,'../../public/art/world-scenes/r12-scene-manifest.json'),
  'utf8',
));
const clone=()=>structuredClone(manifest);

test('S02/S05/S06 review candidates cannot accidentally become production',()=>{
  const result=validateSceneManifest(manifest);
  assert.deepEqual(result,{promoted:0,pending:3});
});

test('cannot claim production without human art and rights review',()=>{
  const edit=clone();
  edit.scenes.orders.status='production';
  assert.throws(()=>validateSceneManifest(edit),/manual approval and rights review/);
});

test('cannot store unapproved files at reserved live scene paths',()=>{
  const fake=clone();
  assert.throws(
    ()=>validateSceneManifest(fake,{exists:p=>p.endsWith('apartment-desktop.webp')}),
    /unreviewed file placed in live scene slot/,
  );
});

test('cannot redirect a scene to another route or unsafe file path',()=>{
  const wrong=clone();
  wrong.scenes.orders.route='/warehouse/';
  assert.throws(()=>validateSceneManifest(wrong),/route\/id mismatch/);
  const unsafe=clone();
  unsafe.scenes.orders.desktop='public/art/world-scenes/r12/../../lobby-hero-v3.webp';
  assert.throws(()=>validateSceneManifest(unsafe),/unexpected desktop path/);
});

test('a candidate needs an immutable source fingerprint',()=>{
  const wrong=clone();
  wrong.scenes.apartment.candidate.sourceSHA256='pending';
  assert.throws(()=>validateSceneManifest(wrong),/candidate source hash required/);
});

test('S06 warehouse has a separately generated portrait master, not a wide-screen crop',()=>{
  const entry=clone().scenes.warehouse;
  assert.equal(entry.status,'review');
  assert.equal(entry.candidate.nativeWidth,1672);
  assert.equal(entry.mobileCandidate.nativeWidth,941);
  assert.equal(entry.mobileCandidate.nativeHeight,1672);
  assert.equal(entry.mobileCandidate.independentComposition,true);
  assert.notEqual(entry.mobileCandidate.sourceSHA256,entry.candidate.sourceSHA256);
});

test('portrait source cannot reuse the desktop original hash',()=>{
  const wrong=clone();
  wrong.scenes.warehouse.mobileCandidate.sourceSHA256=wrong.scenes.warehouse.candidate.sourceSHA256;
  assert.throws(()=>validateSceneManifest(wrong),/independent mobile source hash required/);
});

function signedReview(entry){
  return {
    approved:true,humanVisualReview:true,rightsConfirmed:true,commercialUse:true,
    noBakedUI:true,noBakedText:true,nativeDesktopArtwork:true,
    nativeMobileArtwork:true,notUpscaledFromSmallerImage:true,
    reviewer:'QA reviewer',reviewedAt:'2026-11-16T00:00:00Z',
    notes:'A signed placeholder used exclusively to test admission rejections; not a real approval.',
    sourceSHA256:entry.candidate.sourceSHA256,
    mobileSourceSHA256:entry.mobileCandidate.sourceSHA256,
    sourceReference:entry.candidate.sourceReference,
    crops:{
      'desktop-1440x900':true,'desktop-1648x928-dpr2':true,
      'mobile-390x844':true,'mobile-390x550':true,
    },
  };
}

test('cannot claim upscaled 1672-pixel desktop source as native 2560 art',()=>{
  const wrong=clone();
  const entry=wrong.scenes.warehouse;
  entry.status='production';
  entry.review=signedReview(entry);
  assert.throws(()=>validateSceneManifest(wrong),/native desktop source below production threshold/);
});

test('cannot claim 941-pixel portrait master as native 1080 art',()=>{
  const wrong=clone();
  const entry=wrong.scenes.warehouse;
  entry.status='production';
  entry.review=signedReview(entry);
  entry.candidate.nativeWidth=2560;
  entry.candidate.nativeHeight=1440;
  assert.throws(()=>validateSceneManifest(wrong),/native independent mobile source below production threshold/);
});

test('human review must fingerprint each separate original master',()=>{
  const wrong=clone();
  const entry=wrong.scenes.warehouse;
  entry.status='production';
  entry.review=signedReview(entry);
  // Isolate the fingerprint rule: otherwise native-size admission fails first.
  entry.candidate.nativeWidth=2560;
  entry.candidate.nativeHeight=1440;
  entry.mobileCandidate.nativeWidth=1080;
  entry.mobileCandidate.nativeHeight=1920;
  entry.review.mobileSourceSHA256=entry.candidate.sourceSHA256;
  assert.throws(()=>validateSceneManifest(wrong),/review source hashes must match both original compositions/);
});

test('cannot promote with a signed review but no independent mobile original',()=>{
  const wrong=clone();
  const entry=wrong.scenes.warehouse;
  entry.status='production';
  entry.review=signedReview(entry);
  entry.candidate.nativeWidth=2560;
  entry.candidate.nativeHeight=1440;
  delete entry.mobileCandidate;
  assert.throws(()=>validateSceneManifest(wrong),/native independent mobile source below production threshold/);
});

test('declared native dimensions are insufficient without original files in Git',()=>{
  const wrong=clone();
  const entry=wrong.scenes.warehouse;
  entry.status='production';
  entry.review=signedReview(entry);
  entry.candidate.nativeWidth=2560;
  entry.candidate.nativeHeight=1440;
  entry.mobileCandidate.nativeWidth=1080;
  entry.mobileCandidate.nativeHeight=1920;
  assert.throws(()=>validateSceneManifest(wrong),/original source path required/);
  entry.candidate.originalPath='art-sources/r12/warehouse-desktop.png';
  entry.mobileCandidate.originalPath='art-sources/r12/warehouse-mobile.png';
  assert.throws(()=>validateSceneManifest(wrong),/missing original source PNG/);
});

test('actual PNG dimensions must come from the source file header',()=>{
  const fake=Buffer.alloc(30);
  Buffer.from([137,80,78,71,13,10,26,10]).copy(fake,0);
  fake.write('IHDR',12,'ascii');
  fake.writeUInt32BE(1672,16);
  fake.writeUInt32BE(941,20);
  assert.deepEqual(pngNativeDimensions(fake),{width:1672,height:941});
  fake[0]=0;
  assert.throws(()=>pngNativeDimensions(fake),/original master is not a PNG/);
});

test('S02 has a different independently composed portrait source, not a screenshot crop',()=>{
  const entry=manifest.scenes.apartment;
  assert.equal(entry.status,'review');
  assert.equal(entry.candidate.nativeWidth,1672);
  assert.equal(entry.candidate.nativeHeight,941);
  assert.equal(entry.mobileCandidate.nativeWidth,941);
  assert.equal(entry.mobileCandidate.nativeHeight,1672);
  assert.equal(entry.mobileCandidate.independentComposition,true);
  assert.notEqual(entry.mobileCandidate.sourceSHA256,entry.candidate.sourceSHA256);
  assert.equal(entry.mobileCandidate.availableInRepo,false);
});

test('S02 portrait candidate cannot be approved by reusing the desktop SHA',()=>{
  const wrong=clone();
  wrong.scenes.apartment.mobileCandidate.sourceSHA256=wrong.scenes.apartment.candidate.sourceSHA256;
  assert.throws(()=>validateSceneManifest(wrong),/independent mobile source hash required/);
});

test('S02 941px portrait is correctly rejected as native production mobile art',()=>{
  const wrong=clone();
  const entry=wrong.scenes.apartment;
  entry.status='production';
  entry.review={
    approved:true,humanVisualReview:true,rightsConfirmed:true,commercialUse:true,
    noBakedUI:true,noBakedText:true,nativeDesktopArtwork:true,nativeMobileArtwork:true,
    notUpscaledFromSmallerImage:true,reviewer:'Test reviewer',
    notes:'A test fixture, not a real visual signoff or artwork rights approval.',
    reviewedAt:'2026-11-16T00:00:00Z',
    sourceSHA256:entry.candidate.sourceSHA256,
    sourceReference:entry.candidate.sourceReference,
    mobileSourceSHA256:entry.mobileCandidate.sourceSHA256,
  };
  entry.candidate.nativeWidth=2560;
  entry.candidate.nativeHeight=1440;
  assert.throws(()=>validateSceneManifest(wrong),/native independent mobile source below production threshold/);
});

test('S02, S05 and S06 maintain distinct original sources through production',()=>{
  const scenes=clone().scenes;
  const hashes=new Set();
  for(const [area,entry] of Object.entries(scenes)){
    assert.ok(entry.mobileCandidate,area+' needs independent portrait source');
    assert.equal(entry.mobileCandidate.independentComposition,true);
    if(entry.status!=='production'){
      assert.equal(entry.review,null,area+' unapproved art needs null review');
      assert.equal(entry.mobileCandidate.humanVisualReview,false);
    }
    for(const art of [entry.candidate,entry.mobileCandidate]){
      assert.equal(hashes.has(art.sourceSHA256),false,area+' source must be unique');
      hashes.add(art.sourceSHA256);
    }
  }
  assert.equal(hashes.size,6);
});

test('S05 separate mobile master cannot reuse the S05 desktop source SHA',()=>{
  const bad=clone();
  bad.scenes.orders.mobileCandidate.sourceSHA256=bad.scenes.orders.candidate.sourceSHA256;
  assert.throws(()=>validateSceneManifest(bad),/independent mobile source hash required for orders/);
});

test('S05 review-only portrait is rejected as a native production original',()=>{
  const bad=clone();
  const entry=bad.scenes.orders;
  entry.status='production';
  entry.review={
    approved:true,humanVisualReview:true,rightsConfirmed:true,commercialUse:true,
    noBakedUI:true,noBakedText:true,nativeDesktopArtwork:true,nativeMobileArtwork:true,
    notUpscaledFromSmallerImage:true,reviewer:'Fixture Reviewer',
    notes:'This test fixture only verifies source-size rejection, never actual rights approval.',
    reviewedAt:'2026-11-16T12:00:00Z',
    sourceSHA256:entry.candidate.sourceSHA256,
    mobileSourceSHA256:entry.mobileCandidate.sourceSHA256,
    sourceReference:entry.candidate.sourceReference,
  };
  entry.candidate.nativeWidth=2560;
  entry.candidate.nativeHeight=1440;
  // Pin the intentionally low-resolution test master: legitimate future HD
  // promotion must not make this negative test fail.
  entry.mobileCandidate.nativeWidth=941;
  entry.mobileCandidate.nativeHeight=1672;
  assert.throws(()=>validateSceneManifest(bad),/native independent mobile source below production threshold orders/);
});


function testPng(width,height){
  const b=Buffer.alloc(30);
  Buffer.from([137,80,78,71,13,10,26,10]).copy(b,0);
  b.write('IHDR',12,'ascii');
  b.writeUInt32BE(width,16);
  b.writeUInt32BE(height,20);
  return b;
}

function testWebp(width,height){
  const b=Buffer.alloc(120000);
  b.write('RIFF',0,'ascii');
  b.writeUInt32LE(b.length-8,4);
  b.write('WEBP',8,'ascii');
  b.write('VP8X',12,'ascii');
  b.writeUIntLE(width-1,24,3);
  b.writeUIntLE(height-1,27,3);
  return b;
}

function fakeSignedWarehouse({sourceDesktopWidth,outputDesktopWidth}){
  const m=clone();
  const entry=m.scenes.warehouse;
  const originals={
    'art-sources/r12/warehouse-desktop.png':testPng(sourceDesktopWidth,1856),
    'art-sources/r12/warehouse-mobile.png':testPng(1080,1920),
  };
  const outputs={
    'public/art/world-scenes/r12/warehouse-desktop.webp':testWebp(outputDesktopWidth,1856),
    'public/art/world-scenes/r12/warehouse-mobile.webp':testWebp(1080,1920),
  };
  const files={...originals,...outputs};
  const hash=b=>createHash('sha256').update(b).digest('hex');
  entry.candidate.nativeWidth=sourceDesktopWidth;
  entry.candidate.nativeHeight=1856;
  entry.candidate.originalPath='art-sources/r12/warehouse-desktop.png';
  entry.candidate.sourceSHA256=hash(originals[entry.candidate.originalPath]);
  entry.mobileCandidate.nativeWidth=1080;
  entry.mobileCandidate.nativeHeight=1920;
  entry.mobileCandidate.originalPath='art-sources/r12/warehouse-mobile.png';
  entry.mobileCandidate.sourceSHA256=hash(originals[entry.mobileCandidate.originalPath]);
  entry.status='production';
  entry.review=signedReview(entry);
  const matchPath=full=>Object.keys(files).find(key=>full.endsWith(key));
  return {
    manifest:m,
    options:{
      exists:path=>!!matchPath(path),
      read:path=>{
        const key=matchPath(path);
        if(!key)throw new Error('Unrecognized test file '+path);
        return files[key];
      },
    },
  };
}

test('R12 production rejects a nominal 2560px original that still upscales at DPR2',()=>{
  assert.deepEqual(coverUpsampleProfiles(3296,1856,'desktop'),[]);
  assert.ok(coverUpsampleProfiles(2560,1440,'desktop')
    .some(profile=>profile.id==='pc-1648-dpr2'&&profile.scale>1.28));
  const sample=fakeSignedWarehouse({sourceDesktopWidth:2560,outputDesktopWidth:3296});
  assert.throws(()=>validateSceneManifest(sample.manifest,sample.options),
    /DPR\/cover upsampling at art-sources\/r12\/warehouse-desktop.png/);
});

test('R12 production also rejects a downsampled WebP that reintroduces DPR2 blur',()=>{
  const sample=fakeSignedWarehouse({sourceDesktopWidth:3296,outputDesktopWidth:2560});
  assert.throws(()=>validateSceneManifest(sample.manifest,sample.options),
    /DPR\/cover upsampling at public\/art\/world-scenes\/r12\/warehouse-desktop.webp/);
});


function signedS02SixRoomFixture(){
  const m=clone();
  const entry=m.scenes.apartment;
  const originalPaths={
    desktop:'art-sources/r12/apartment-desktop.png',
    mobile:'art-sources/r12/apartment-mobile.png',
  };
  const outputPaths={
    desktop:'public/art/world-scenes/r12/apartment-desktop.webp',
    mobile:'public/art/world-scenes/r12/apartment-mobile.webp',
  };
  const bytes={
    [originalPaths.desktop]:testPng(3296,1856),
    [originalPaths.mobile]:testPng(1080,1920),
    [outputPaths.desktop]:testWebp(3296,1856),
    [outputPaths.mobile]:testWebp(1080,1920),
  };
  const hash=b=>createHash('sha256').update(b).digest('hex');
  entry.candidate.nativeWidth=3296;entry.candidate.nativeHeight=1856;
  entry.candidate.originalPath=originalPaths.desktop;
  entry.candidate.sourceSHA256=hash(bytes[originalPaths.desktop]);
  entry.mobileCandidate.nativeWidth=1080;entry.mobileCandidate.nativeHeight=1920;
  entry.mobileCandidate.originalPath=originalPaths.mobile;
  entry.mobileCandidate.sourceSHA256=hash(bytes[originalPaths.mobile]);
  entry.status='production';
  entry.review=signedReview(entry);
  entry.review.output=Object.fromEntries(['desktop','mobile'].map(kind=>{
    const data=bytes[outputPaths[kind]];
    const meta=kind==='desktop'?{width:3296,height:1856}:{width:1080,height:1920};
    return [kind,{...meta,sha256:hash(data),bytes:data.length}];
  }));
  const match=full=>Object.keys(bytes).find(path=>full.endsWith(path));
  const options={
    exists:path=>!!match(path),
    read:path=>{
      const key=match(path);
      if(!key)throw new Error('Missing test original '+path);
      return bytes[key];
    },
  };
  return {manifest:m,review:entry.review,options};
}

function validSixRoomAnchors(){
  return {
    desktop:[
      {roomIndex:0,x:.18,y:.42},{roomIndex:1,x:.30,y:.42},
      {roomIndex:2,x:.42,y:.42},{roomIndex:3,x:.58,y:.42},
      {roomIndex:4,x:.70,y:.42},{roomIndex:5,x:.82,y:.42},
    ],
    mobile:[
      {roomIndex:0,x:.30,y:.28},{roomIndex:1,x:.50,y:.28},
      {roomIndex:2,x:.70,y:.28},{roomIndex:3,x:.30,y:.66},
      {roomIndex:4,x:.50,y:.66},{roomIndex:5,x:.70,y:.66},
    ],
  };
}

test('scene cover point projects independent mobile source center to viewport center',()=>{
  assert.deepEqual(sceneCoverAnchor({x:.5,y:.5},
    {width:1080,height:1920},{width:390,height:844}),
    {x:195,y:422});
});

test('S02 source QA cannot approve all six rooms without hotspot maps',()=>{
  const fixture=signedS02SixRoomFixture();
  assert.throws(()=>validateSceneManifest(fixture.manifest,fixture.options),
    /S02 six room art hotspots required/);
});

test('S02 must map all six unique room IDs on both desktop and phone compositions',()=>{
  const fixture=signedS02SixRoomFixture();
  fixture.review.roomHotspots=validSixRoomAnchors();
  fixture.review.roomHotspotBrowserProof={desktop:true,mobile:true};
  fixture.review.roomHotspots.mobile[3].roomIndex=2;
  assert.throws(()=>validateSceneManifest(fixture.manifest,fixture.options),
    /S02 room art hotspot ID must be unique/);
});

test('S02 rejects phone room doors cropped out by 390px cover geometry',()=>{
  const fixture=signedS02SixRoomFixture();
  fixture.review.roomHotspots=validSixRoomAnchors();
  fixture.review.roomHotspotBrowserProof={desktop:true,mobile:true};
  fixture.review.roomHotspots.mobile[0].x=.01;
  assert.throws(()=>validateSceneManifest(fixture.manifest,fixture.options),
    /S02 room hotspot cropped outside safe mobile viewport/);
});

test('S02 rejects neighboring hotspots with overlapping 44px click targets',()=>{
  const fixture=signedS02SixRoomFixture();
  fixture.review.roomHotspots=validSixRoomAnchors();
  fixture.review.roomHotspotBrowserProof={desktop:true,mobile:true};
  fixture.review.roomHotspots.desktop[1].x=fixture.review.roomHotspots.desktop[0].x;
  assert.throws(()=>validateSceneManifest(fixture.manifest,fixture.options),
    /S02 desktop room hotspots overlap/);
});

test('S02 six mapped room entrances need both PC and mobile real-browser signoff',()=>{
  const fixture=signedS02SixRoomFixture();
  fixture.review.roomHotspots=validSixRoomAnchors();
  assert.throws(()=>validateSceneManifest(fixture.manifest,fixture.options),
    /S02 room hotspot browser interaction review required/);
});

test('S02 accepts six safely mapped room-entrance anchors only with full original proof',()=>{
  const fixture=signedS02SixRoomFixture();
  fixture.review.roomHotspots=validSixRoomAnchors();
  fixture.review.roomHotspotBrowserProof={desktop:true,mobile:true};
  assert.deepEqual(validateSceneManifest(fixture.manifest,fixture.options),
    {promoted:1,pending:2});
});
