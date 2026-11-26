import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {verifyG1FaceSources,verifyCurrentG1FaceSources,verifyG1Approval,buildG1ApprovalDraft} from '../verify-g1-face-sources.mjs';

import {CG_PATHS,CG_IDENTITY_REFERENCE_PATHS,CG_VIEWPORTS,auditCharacterCg} from '../audit-character-cg.mjs';
import {promoteCharacterCg} from '../promote-character-cg.mjs';
import {checkCharacterCgDifferentiation} from '../check-character-cg-differentiation.mjs';

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

/** Synthetic headers exercise admission metadata; real image decoding and human
 * review are outside these fixtures. No repository approvals are fabricated. */
function approvalFixture(id='brook'){
  const root=mkdtempSync(join(tmpdir(),'g1-approval-test-'));
  const prefix='art-sources/characters/'+id+'/identity/';
  const catalog={schemaVersion:1,assets:[]},transition={schemaVersion:1,outputs:[]};
  const put=(path,bytes,dims)=>{
    mkdirSync(dirname(join(root,path)),{recursive:true});writeFileSync(join(root,path),bytes);
    return {path,bytes:bytes.length,sha256:hash(bytes),pixelDimensions:dims};
  };
  const json=(path,value)=>put(path,Buffer.from(JSON.stringify(value)),[]);
  const source=(name,category,w,h,marker)=>{
    const bytes=png(w,h);bytes[31]=marker;
    const entry=put(prefix+name,bytes,[w,h]);
    catalog.assets.push({path:entry.path,category,status:'review',bytes:bytes.length,
      gitBlobSha:createHash('sha1').update('blob '+bytes.length).update(Buffer.from([0])).update(bytes).digest('hex')});
    return entry;
  };
  const front=source('front.png','identity',1086,1448,1);
  const angle=source('three-quarter-candidate-v2.png','identity-angle',1086,1448,2);
  const refs=id==='yuesha'?[['yuesha-avatar-v3.webp',600,600],['yuesha-portrait-v3.webp',1086,1448],['yuesha-bust-v3.webp',930,910]]:[['face.webp',600,600]];
  const references=refs.map(([name,w,h])=>{
    const entry=put('public/art/characters/'+id+'/'+name,webp(w,h),[w,h]);
    transition.outputs.push({output:entry.path,source:front.path,sourceSha256:front.sha256,
      outputSha256:entry.sha256,bytes:entry.bytes,sourceSize:front.pixelDimensions,size:entry.pixelDimensions});
    return entry;
  });
  const proof={schemaVersion:1,character:id,approved:true,humanVisualReview:true,identityConsistent:true,
    independentNativeSources:true,rightsConfirmed:true,commercialUse:true,crossCharacterReview:true,
    reviewer:'Fixture Reviewer',reviewedAt:'2026-11-25T00:00:00Z',
    reviewNotes:'Synthetic test only; not an actual art approval.',sourceReference:'fixture-only',
    front,angle,references};
  const save=()=>{
    json('art-sources/source-catalog.json',catalog);
    json('public/art/r12-53-transition-manifest.json',transition);
    const e=json(prefix+'approval.json',proof);return {path:e.path,sha256:e.sha256};
  };
  return {root,proof,catalog,transition,save,remove:()=>rmSync(root,{force:true,recursive:true})};
}
function approvalReject(modify,expect){
  const f=approvalFixture();try{modify(f);assert.throws(()=>verifyG1Approval(f.root,'brook',f.save()),expect)}finally{f.remove()}
}
test('G1 production binding accepts complete synthetic registered identity and both YueSha card references',()=>{
  for(const id of ['brook','yuesha']){
    const f=approvalFixture(id);try{const binding=f.save();assert.deepEqual(verifyG1Approval(f.root,id,binding),{character:id,...binding})}finally{f.remove()}
  }
});
test('G1 production rejects missing binding and missing proof',()=>{
  const f=approvalFixture();try{
    assert.throws(()=>verifyG1Approval(f.root,'brook',null),/binding required/);
    assert.throws(()=>verifyG1Approval(f.root,'brook',{path:'art-sources/characters/brook/identity/approval.json',sha256:'a'.repeat(64)}),/missing G1 approval/);
  }finally{f.remove()}
});
test('G1 production rejects a different character approval',()=>approvalReject(f=>{f.proof.character='fern'},/approval incomplete/));
test('G1 production rejects unsigned review',()=>approvalReject(f=>{f.proof.humanVisualReview=false},/approval incomplete/));
test('G1 production rejects side source in rework',()=>approvalReject(f=>{f.catalog.assets[1].status='rework'},/registration mismatch or rework/));
test('G1 production rejects outdated proof hash',()=>{
  const f=approvalFixture();try{const binding=f.save();f.proof.reviewNotes+=' edited';f.save();assert.throws(()=>verifyG1Approval(f.root,'brook',binding),/approval hash mismatch/)}finally{f.remove()}
});
test('G1 production rejects wrong angle path',()=>approvalReject(f=>{f.proof.angle.path=f.proof.front.path},/unexpected asset path/));
test('G1 production rejects changed source bytes',()=>approvalReject(f=>{const p=join(f.root,f.proof.angle.path);const bytes=readFileSync(p);bytes[31]=9;writeFileSync(p,bytes)},/SHA-256 mismatch/));
test('G1 production rejects a smaller side source even with revised hash',()=>approvalReject(f=>{
  const b=png(1086,1300);writeFileSync(join(f.root,f.proof.angle.path),b);
  f.proof.angle.sha256=hash(b);f.proof.angle.pixelDimensions=[1086,1300];
},/native 3:4 floor/));
test('G1 production rejects runtime reference from the wrong resident',()=>approvalReject(f=>{f.transition.outputs[0].source='art-sources/characters/fern/identity/front.png'},/runtime reference source mismatch/));
test('G1 production rejects identical front and angle content',()=>approvalReject(f=>{
  const b=readFileSync(join(f.root,f.proof.front.path));writeFileSync(join(f.root,f.proof.angle.path),b);
  f.proof.angle.sha256=hash(b);f.catalog.assets[1].gitBlobSha=f.catalog.assets[0].gitBlobSha;
},/duplicate front and angle/));

test('G1 draft is unsigned and derives evidence from actual fixture files',()=>{
  const f=approvalFixture();try{
    const draft=buildG1ApprovalDraft(f.root,'brook');
    assert.equal(draft.approved,false);assert.equal(draft.humanVisualReview,false);
    assert.deepEqual(draft.front,f.proof.front);assert.deepEqual(draft.angle,f.proof.angle);
    assert.deepEqual(draft.references,f.proof.references);
    rmSync(join(f.root,f.proof.angle.path));
    assert.equal(buildG1ApprovalDraft(f.root,'brook').angle,null);
    assert.throws(()=>buildG1ApprovalDraft(f.root,'../other'),/unknown approval subject/);
  }finally{f.remove()}
});
function promotionFixture(useResearch=false){
  const f=approvalFixture();
  const put=(path,b)=>{const dest=join(f.root,path);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,b);return dest};
  const json=(path,j)=>put(path,JSON.stringify(j));
  const binding=f.save(),card='brook-tide';
  for(const path of Object.values(CG_IDENTITY_REFERENCE_PATHS)){
    if(path!==f.proof.references[0].path)put(path,webp(600,600));
  }
  const cards=Object.fromEntries(Object.entries(CG_PATHS).map(([id,path])=>[id,{status:'portrait',path:'public/art/characters/'+path}]));
  const art=Buffer.alloc(100000);webp(1086,1448).copy(art);art.writeUInt32LE(art.length-8,4);
  const study=Buffer.from(art);if(!useResearch)study[study.length-1]=1;
  const previewPath='public/art/rooms/brook/scenic/standing.webp';
  put(previewPath,study);Object.assign(cards[card],{previewPath,previewSha256:hash(study),previewSourceKind:'sprite-transition-card'});
  const manifestPath=json('public/art/characters/cg-manifest.json',{version:1,cards});
  const brief=JSON.parse(readFileSync('docs/art-reviews/CG-DIFFERENTIATION-SHOT-LIST.json','utf8'));
  const studyPath='docs/art-reviews/sources/brook-cg-tide-pose-study-v1.webp';
  put(studyPath,study);
  brief.poseStudies={[card]:{path:studyPath,width:1086,height:1448,bytes:study.length,sha256:hash(study),approved:false,status:'research-only'}};
  brief.alternativePoseStudies={};
  json('docs/art-reviews/CG-DIFFERENTIATION-SHOT-LIST.json',brief);
  const source=put('candidate.webp',art);
  const review={card,approved:true,humanVisualReview:true,g1Approval:binding,
    identityReference:{path:f.proof.references[0].path,sha256:f.proof.references[0].sha256},
    image:{width:1086,height:1448,bytes:art.length,sha256:hash(art)},
    sourceType:'artist-original',sourceReference:'fixture-only',original:true,commercialUse:true,rightsConfirmed:true,
    noBakedUI:true,noBakedText:true,fullBodyVisible:true,characterIdentityConsistent:true,handsAndFeetReviewed:true,
    visualReview:Object.fromEntries(CG_VIEWPORTS.map(v=>[v,true])),
    reviewedAt:'2026-11-25T00:00:00Z',reviewer:'Fixture Reviewer',reviewNotes:'Synthetic test only; not an actual art approval.',
    nativeResolution:{width:1086,height:1448}};
  const approval=json('review.json',review);
  return {...f,card,source,approval,review,manifestPath};
}
test('CG promotion accepts independent approved fixture and retains research history',()=>{
  const f=promotionFixture();try{
    assert.equal(auditCharacterCg(f.root).production,0);
    promoteCharacterCg(f,f.root);
    assert.equal(auditCharacterCg(f.root).production,1);
    assert.deepEqual(checkCharacterCgDifferentiation(f.root),{cards:5,studies:1});
    const entry=JSON.parse(readFileSync(f.manifestPath,'utf8')).cards[f.card];
    assert.deepEqual(Object.keys(entry).sort(),['path','status']);
  }finally{f.remove()}
});
test('CG promotion rolls back when production bytes equal archived research',()=>{
  const f=promotionFixture(true);try{
    const before=readFileSync(f.manifestPath);
    assert.throws(()=>promoteCharacterCg(f,f.root),/research bytes cannot become production/);
    assert.deepEqual(readFileSync(f.manifestPath),before);
    assert.equal(auditCharacterCg(f.root).production,0);
  }finally{f.remove()}
});
test('CG promotion rejects missing G1 binding before writing assets',()=>{
  const f=promotionFixture();try{
    f.review.g1Approval=null;writeFileSync(f.approval,JSON.stringify(f.review));
    const before=readFileSync(f.manifestPath);
    assert.throws(()=>promoteCharacterCg(f,f.root),/G1 approval binding required/);
    assert.deepEqual(readFileSync(f.manifestPath),before);
    assert.equal(auditCharacterCg(f.root).production,0);
  }finally{f.remove()}
});
