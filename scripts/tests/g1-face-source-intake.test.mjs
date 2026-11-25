import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {verifyG1FaceSources,verifyCurrentG1FaceSources} from '../verify-g1-face-sources.mjs';

const ids={yuesha:'19',brook:'20',fern:'21',cinder:'22'};
const names=['g1-four-independent-research-contact.webp',
  'g1-grayscale-face-review-not-blindtest.webp'];
const hash=b=>createHash('sha256').update(b).digest('hex');
function png(w,h){
  const b=Buffer.alloc(32);Buffer.from('89504e470d0a1a0a','hex').copy(b);
  b.write('IHDR',12,'ascii');b.writeUInt32BE(w,16);b.writeUInt32BE(h,20);return b;
}
function webp(w,h){
  const b=Buffer.alloc(30);b.write('RIFF',0,'ascii');b.writeUInt32LE(b.length-8,4);
  b.write('WEBP',8,'ascii');b.write('VP8X',12,'ascii');b.writeUIntLE(w-1,24,3);
  b.writeUIntLE(h-1,27,3);return b;
}
function fixture(){
  const root=mkdtempSync(join(tmpdir(),'g1-study-test-'));
  const manifest={schemaVersion:1,generatedPortraits:4,humanApprovedIdentities:0,
    productionPortraitsReplaced:false,canonicalReferencesRetained:true,
    release:{coverDesktopApproved:false,coverMobileApproved:false,fullBodyCgProductionApproved:0},
    subjects:{},images:{}};
  const put=(path,bytes,dims)=>{
    mkdirSync(dirname(join(root,path)),{recursive:true});writeFileSync(join(root,path),bytes);
    return {path,width:dims[0],height:dims[1],bytes:bytes.length,sha256:hash(bytes)};
  };
  for(const [id,round] of Object.entries(ids)){
    const base='art-sources/identity-r12-'+round+'/'+id+'-face-identity-study-v2';
    manifest.subjects[id]={independentSource:true,researchOnly:true,
      canonicalIdentityApproved:false,licensedForProduction:false,fullBodyCg:false,
      faceStudyOriginalPng:put(base+'-original.png',png(1086,1448),[1086,1448]),
      faceStudyWebp:put(base+'.webp',webp(1086,1448),[1086,1448])};
  }
  for(const name of names){
    const p='art-sources/identity-r12-22/'+name;
    const entry=put(p,webp(1796,name.startsWith('g1-four')?770:550),
      [1796,name.startsWith('g1-four')?770:550]);
    manifest.images[name]={path:p,sizeBytes:entry.bytes,sha256:entry.sha256,
      pixelDimensions:[entry.width,entry.height]};
  }
  const save=()=>{
    const path=join(root,'art-sources/identity-r12-22/identity-candidate-manifest.json');
    writeFileSync(path,JSON.stringify(manifest));
  };
  save();return {root,manifest,save,remove:()=>rmSync(root,{force:true,recursive:true})};
}
function run(modify,expect){
  const f=fixture();
  try{modify(f);f.save();assert.throws(()=>verifyG1FaceSources(f.root),expect)}
  finally{f.remove()}
}
test('four separate research faces and two contacts pass byte/pixel/approval checks',()=>{
  const f=fixture();try{assert.deepEqual(verifyG1FaceSources(f.root),
    {verified:10,subjects:4,approved:0,production:false})}finally{f.remove()}
});
test('a modified but present WebP fails SHA-256',()=>run(f=>{
  const p=join(f.root,f.manifest.subjects.brook.faceStudyWebp.path);
  const b=readFileSync(p);b[20]=0xff;writeFileSync(p,b);
},/SHA-256 mismatch/));
test('a forged approval fails before reading any images',()=>run(f=>{
  f.manifest.humanApprovedIdentities=4;
},/research package must not claim production/));
test('injected traversal or swapped character art path fails',()=>run(f=>{
  f.manifest.subjects.fern.faceStudyWebp.path='../private.webp';
},/unexpected asset path/));
test('a smaller WebP cannot pass by rewriting metadata and hash',()=>run(f=>{
  const e=f.manifest.subjects.yuesha.faceStudyWebp;
  const b=webp(512,512);writeFileSync(join(f.root,e.path),b);
  e.bytes=b.length;e.sha256=hash(b);e.width=1086;e.height=1448;
},/pixel dimensions mismatch/));
test('unexpected or missing characters are blocked',()=>run(f=>{
  delete f.manifest.subjects.cinder;
},/wrong identity roster/));
test('a symlinked source is rejected despite matching hash and dimensions',()=>run(f=>{
  const src=join(f.root,f.manifest.subjects.cinder.faceStudyWebp.path);
  const original=readFileSync(src);rmSync(src);const target=join(f.root,'outside.webp');
  writeFileSync(target,original);symlinkSync(target,src);
},/not a regular file/));
test('contact file hash and count are required',()=>run(f=>{
  delete f.manifest.images[names[1]];
},/missing or extra contact assets/));
test('production CG assertion fails even if portraits look valid',()=>run(f=>{
  f.manifest.release.fullBodyCgProductionApproved=5;
},/unapproved cover or CG marked production/));

test('current repository verifies real identity source pairs and their visible avatar bytes',()=>{
  const result=verifyCurrentG1FaceSources(process.cwd());
  assert.equal(result.verified,12);
  assert.equal(result.production,false);
  assert.equal(result.subjects.length,4);
  for(const subject of result.subjects){
    assert.equal(subject.humanApproved,false);
    assert.equal(subject.avatar.width,600);
    assert.equal(subject.avatar.height,600);
    assert.notEqual(subject.front.sha256,subject.angle.sha256);
  }
  assert.equal(result.subjects.find(s=>s.id==='yuesha').angle.status,'rework');
  assert.equal(result.subjects.find(s=>s.id==='brook').angle.status,'rework');
});
