import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {inspectPaintedMachineMotion,validateMachineMotionContract,sha256}
  from '../machine-motion-audit.mjs';

const craft='well';
const masterRecord={id:'machine.well.lv2',role:'machine',level:2,status:'review',
  canvas:{width:512,height:512},sourceSha256:'a'.repeat(64)};
const motionRecord={id:'machine.well.working',role:'machine-animation',
  craft,level:2,status:'review',path:'art/production/machines/well/working.webp',
  canvas:{width:2048,height:512},
  frame:{width:512,height:512,columns:4,rows:1,count:4},
  sourceSha256:'b'.repeat(64),matchedPaintingSha256:'a'.repeat(64)};

function frameSvg(x,fill){
  return Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" '+
    'width="512" height="512" viewBox="0 0 512 512">'+
    '<rect x="'+x+'" y="110" width="250" height="270" rx="30" '+
    'fill="'+fill+'"/></svg>');
}
async function fixture(offset=0){
  const master=await sharp(frameSvg(130,'#405f8d'))
    .webp({quality:100,alphaQuality:100}).toBuffer();
  const frames=await Promise.all(
    ['#405f8d','#4175ab','#5e91bd','#496b99'].map(fill=>
      sharp(frameSvg(130+offset,fill)).png().toBuffer()));
  const atlas=await sharp({create:{width:2048,height:512,channels:4,
    background:{r:0,g:0,b:0,alpha:0}}})
    .composite(frames.map((input,i)=>({input,left:i*512,top:0})))
    .webp({quality:98,alphaQuality:100}).toBuffer();
  return {master,atlas};
}
test('review atlas requires matching SHA and review painting',()=>{
  assert.doesNotThrow(()=>validateMachineMotionContract(motionRecord,masterRecord));
  assert.throws(()=>validateMachineMotionContract(
    {...motionRecord,matchedPaintingSha256:'c'.repeat(64)},masterRecord),/SHA/);
  assert.throws(()=>validateMachineMotionContract(
    {...motionRecord,status:'ready'},masterRecord),/SAME art status/);
  assert.throws(()=>validateMachineMotionContract(
    {...motionRecord,frame:{...motionRecord.frame,count:6}},masterRecord),/contract/);
  assert.equal(sha256(Buffer.from('abc')).length,64);
});
test('matching 4-frame painted machine animation passes silhouette inspection',async()=>{
  const {master,atlas}=await fixture();
  const report=await inspectPaintedMachineMotion(master,atlas);
  assert.equal(report.frames,4);
  assert.ok(report.minSilhouette>.9);
  assert.ok(report.variation>1000);
});
test('mismatched chassis and static single-frame sheets are rejected',async()=>{
  const {master,atlas}=await fixture(190);
  await assert.rejects(inspectPaintedMachineMotion(master,atlas),/does not match painted chassis/);
  const same=await sharp({create:{width:2048,height:512,channels:4,
    background:{r:0,g:0,b:0,alpha:0}}}).composite(
      await Promise.all(Array.from({length:4},async(_,i)=>({
        input:await sharp(frameSvg(130,'#405f8d')).png().toBuffer(),
        left:i*512,top:0
      })))
    ).webp({quality:98,alphaQuality:100}).toBuffer();
  await assert.rejects(inspectPaintedMachineMotion(master,same),/no distinct working poses/);
});
