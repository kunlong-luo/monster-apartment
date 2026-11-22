import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {CG_PATHS} from '../audit-character-cg.mjs';
import {NATIVE_CG_DIMENSIONS,buildCharacterCgPrompt,buildNativeCgRequest} from '../generate-native-character-cg.mjs';

const root=resolve(import.meta.dirname,'../..');
const briefs=JSON.parse(readFileSync(resolve(root,'docs/art-reviews/CG-DIFFERENTIATION-SHOT-LIST.json'),'utf8'));

test('native CG dimensions are original 3:4 and above production minimum',()=>{
  assert.deepEqual(NATIVE_CG_DIMENSIONS,{width:1536,height:2048});
  assert.equal(NATIVE_CG_DIMENSIONS.width/NATIVE_CG_DIMENSIONS.height,3/4);
  assert.ok(NATIVE_CG_DIMENSIONS.width*NATIVE_CG_DIMENSIONS.height<=4_194_304);
});

test('five identity-anchored one-person prompts and image requests remain distinct',()=>{
  const ids=Object.keys(CG_PATHS).sort();
  const poses=new Set(),weapons=new Set(),wardrobes=new Set();
  assert.equal(ids.length,5);
  for(const card of ids){
    const brief=briefs.cards[card];
    assert.ok(brief);
    const prompt=buildCharacterCgPrompt(card,brief);
    assert.ok(prompt.includes(brief.face));
    assert.ok(prompt.includes(brief.pose));
    assert.ok(prompt.includes(brief.weapon));
    assert.ok(prompt.includes(brief.wardrobe));
    assert.match(prompt,/ONE SINGLE ADULT FEMALE/);
    assert.match(prompt,/NOT a lineup, contact sheet, collage/);
    assert.match(prompt,/NO other people; NO text/);
    assert.match(prompt,/8 percent clear safe margin/);
    poses.add(brief.poseId);weapons.add(brief.weaponId);wardrobes.add(brief.wardrobeId);
    const req=buildNativeCgRequest({card,brief,faceBase64:'identity',poseBase64:'pose',seed:42});
    assert.equal(req.width,1536);assert.equal(req.height,2048);
    assert.equal(req.output_format,'webp');
    assert.equal(req.disable_pup,true);
    assert.equal(req.input_image,'identity');
    assert.equal(req.input_image_2,'pose');
    assert.equal(req.seed,42);
  }
  assert.equal(poses.size,5);assert.equal(weapons.size,5);assert.equal(wardrobes.size,5);
  assert.equal(briefs.cards['yuesha-eclipse'].identity,briefs.cards['yuesha-vow'].identity);
});

test('native request refuses missing references and invalid seed',()=>{
  const brief=briefs.cards['yuesha-eclipse'];
  assert.throws(()=>buildNativeCgRequest({card:'yuesha-eclipse',brief,faceBase64:'',poseBase64:'foo'}),/reference images/);
  assert.throws(()=>buildNativeCgRequest({card:'yuesha-eclipse',brief,faceBase64:'foo',poseBase64:'bar',seed:-1}),/Seed/);
  assert.throws(()=>buildNativeCgRequest({card:'bogus',brief,faceBase64:'foo',poseBase64:'bar'}),/Unknown/);
});
