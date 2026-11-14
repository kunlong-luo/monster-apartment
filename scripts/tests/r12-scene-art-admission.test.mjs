import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {validateSceneManifest} from '../audit-r12-scene-art.mjs';

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
