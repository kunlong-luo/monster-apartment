import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {validateSceneManifest,pngNativeDimensions} from '../audit-r12-scene-art.mjs';

const manifest=JSON.parse(readFileSync(
  resolve(import.meta.dirname,'../../public/art/world-scenes/r12-scene-manifest.json'),
  'utf8',
));
const clone=()=>structuredClone(manifest);

test('S02/S05 candidates cannot accidentally become production',()=>{
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
