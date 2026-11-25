#!/usr/bin/env node
/** G1 research-only integrity gate. Never promotes an asset or signs human review. */
import {readFileSync, lstatSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {webpDimensions} from './prepare-room-background.mjs';

const SUBJECTS=Object.freeze({yuesha:'19',brook:'20',fern:'21',cinder:'22'});
const CONTACTS=Object.freeze([
  'g1-four-independent-research-contact.webp',
  'g1-grayscale-face-review-not-blindtest.webp',
]);
const fail=msg=>{throw new Error('G1 intake: '+msg)};
const demand=(yes,msg)=>{if(!yes)fail(msg)};
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');

/** The manifest is untrusted staging metadata. Never follow its arbitrary paths. */
function exactAsset(root,entry,expectedPath,expectedSize){
  demand(entry&&entry.path===expectedPath,'unexpected asset path '+expectedPath);
  demand(Number.isSafeInteger(entry.bytes??entry.sizeBytes),'missing byte count '+expectedPath);
  demand(typeof entry.sha256==='string'&&/^[a-f0-9]{64}$/.test(entry.sha256),'missing hash '+expectedPath);
  const file=join(root,expectedPath);
  let stats;
  try{stats=lstatSync(file)}catch{fail('missing '+expectedPath)}
  demand(stats.isFile()&&!stats.isSymbolicLink(),'not a regular file '+expectedPath);
  demand(stats.size===(entry.bytes??entry.sizeBytes),'size mismatch '+expectedPath);
  const bytes=readFileSync(file);
  demand(sha256(bytes)===entry.sha256,'SHA-256 mismatch '+expectedPath);
  let width,height;
  if(expectedPath.endsWith('.png')){
    demand(bytes.length>=24&&bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'))&&
      bytes.toString('ascii',12,16)==='IHDR','invalid PNG '+expectedPath);
    width=bytes.readUInt32BE(16);height=bytes.readUInt32BE(20);
  }else{
    demand(bytes.length>=30&&bytes.toString('ascii',0,4)==='RIFF'&&
      bytes.readUInt32LE(4)===bytes.length-8&&bytes.toString('ascii',8,12)==='WEBP',
      'invalid WebP RIFF '+expectedPath);
    ({width,height}=webpDimensions(bytes));
  }
  const dims=expectedSize??entry.pixelDimensions;
  demand(Array.isArray(dims)&&dims.length===2&&dims.every(Number.isSafeInteger),
    'expected dimensions missing '+expectedPath);
  demand(width===dims[0]&&height===dims[1],
    'pixel dimensions mismatch '+expectedPath+': '+width+'x'+height);
  if(expectedSize){
    demand(entry.width===width&&entry.height===height,
      'manifest dimensions mismatch '+expectedPath);
  }
  return {sha256:entry.sha256,bytes:bytes.length,width,height};
}

export function verifyG1FaceSources(rootDir){
  const root=resolve(rootDir);
  let manifest;
  try{manifest=JSON.parse(readFileSync(join(root,'art-sources/identity-r12-22/identity-candidate-manifest.json'),'utf8'))}
  catch{fail('missing or malformed R12.22 manifest; unpack research ZIP first')}
  demand(manifest.schemaVersion===1&&manifest.generatedPortraits===4,
    'incorrect research manifest or subject count');
  demand(manifest.humanApprovedIdentities===0&&manifest.productionPortraitsReplaced===false&&
    manifest.canonicalReferencesRetained===true,
    'research package must not claim production or human approval');
  demand(manifest.release?.coverDesktopApproved===false&&
    manifest.release?.coverMobileApproved===false&&
    manifest.release?.fullBodyCgProductionApproved===0,
    'unapproved cover or CG marked production');
  demand(manifest.subjects&&JSON.stringify(Object.keys(manifest.subjects).sort())===
    JSON.stringify(Object.keys(SUBJECTS).sort()),'wrong identity roster');
  let checked=0;
  for(const [id,round] of Object.entries(SUBJECTS)){
    const s=manifest.subjects[id];
    demand(s.independentSource===true&&s.researchOnly===true&&
      s.canonicalIdentityApproved===false&&s.licensedForProduction===false&&
      s.fullBodyCg===false,
      'unapproved identity or CG state '+id);
    const dir='art-sources/identity-r12-'+round+'/';
    const prefix=id+'-face-identity-study-v2';
    exactAsset(root,s.faceStudyOriginalPng,dir+prefix+'-original.png',[1086,1448]);checked++;
    exactAsset(root,s.faceStudyWebp,dir+prefix+'.webp',[1086,1448]);checked++;
    demand(s.faceStudyOriginalPng.sha256!==s.faceStudyWebp.sha256,
      'PNG and WebP unexpectedly share the same bytes '+id);
  }
  demand(manifest.images&&JSON.stringify(Object.keys(manifest.images).sort())===
    JSON.stringify([...CONTACTS].sort()),'missing or extra contact assets');
  for(const name of CONTACTS){
    exactAsset(root,manifest.images[name],
      'art-sources/identity-r12-22/'+name);checked++;
  }
  return {verified:checked,subjects:4,approved:0,production:false};
}


/** Current repository transition review; the historical ZIP gate remains separate.
 * Uses existing source catalog, transition ledger and exact runtime avatar slots.
 * No output writes, image conversion, identity signing or production promotion. */
export function verifyCurrentG1FaceSources(rootDir){
  const root=resolve(rootDir);
  const catalog=JSON.parse(readFileSync(join(root,'art-sources/source-catalog.json'),'utf8'));
  const transition=JSON.parse(readFileSync(join(root,'public/art/r12-53-transition-manifest.json'),'utf8'));
  demand(catalog.schemaVersion===1&&transition.schemaVersion===1,'unexpected current manifest schema');
  demand(transition.status==='transition-candidate-not-production-cg'&&transition.humanVisualReview===false,
    'unexpected transition review state; re-evaluate this gate before promotion');
  const unique=(entries,path,label)=>{
    const matches=entries.filter(e=>e.path===path);
    demand(matches.length===1,'missing or duplicated '+label+' '+path);
    return matches[0];
  };
  const result=[];
  for(const id of Object.keys(SUBJECTS)){
    const prefix='art-sources/characters/'+id+'/identity/';
    const readSource=(name,category)=>{
      const path=prefix+name;
      const entry=unique(catalog.assets,path,'source catalog');
      const inventory=unique(transition.sourceInventory,path,'transition inventory');
      demand(entry.category===category&&['review','rework'].includes(entry.status)&&
        inventory.status===entry.status&&inventory.gitBlobSha===entry.gitBlobSha,
        'source status or Git blob mismatch '+path);
      const metadata=exactAsset(root,{path,bytes:entry.bytes,sha256:inventory.sourceSha256,
        pixelDimensions:inventory.size},path);
      const data=readFileSync(join(root,path));
      const blob=createHash('sha1').update('blob '+data.length).update(Buffer.from([0])).update(data).digest('hex');
      demand(blob===entry.gitBlobSha,'Git blob mismatch '+path);
      return {...metadata,path,status:entry.status,notes:entry.notes};
    };
    const front=readSource('front.png','identity');
    const angle=readSource('three-quarter-candidate.png','identity-angle');
    demand(front.width>=1086&&front.height>=1448,'front source below review floor '+id);
    const path='public/art/characters/'+id+'/'+(id==='yuesha'?'yuesha-avatar-v3.webp':'face.webp');
    const outputs=transition.outputs.filter(e=>e.output===path);
    demand(outputs.length===1,'missing or duplicated runtime avatar '+id);
    const output=outputs[0];
    demand(output.kind==='identity-avatar'&&output.source===front.path&&
      output.sourceSha256===front.sha256&&JSON.stringify(output.sourceSize)===JSON.stringify([front.width,front.height]),
      'runtime avatar source mismatch '+id);
    const crop=output.crop;
    demand(Array.isArray(crop)&&crop.length===4&&crop.every(Number.isSafeInteger)&&
      crop[0]>=0&&crop[1]>=0&&crop[2]<=front.width&&crop[3]<=front.height&&
      crop[2]-crop[0]===600&&crop[3]-crop[1]===600&&
      JSON.stringify(output.size)==='[600,600]','invalid runtime avatar crop '+id);
    const avatar=exactAsset(root,{path,bytes:output.bytes,sha256:output.outputSha256,
      pixelDimensions:output.size},path);
    result.push({id,front,angle,avatar:{...avatar,path},angleMeetsPortraitFloor:
      angle.width>=1086&&angle.height>=1448,humanApproved:false});
  }
  return {verified:result.length*3,subjects:result,production:false};
}

/** Named human attestation for production CG. Technical validation is not
 * a cryptographic signature or independent verification of the art review. */
export function verifyG1Approval(rootDir,id,binding){
  const root=resolve(rootDir);
  demand(Object.hasOwn(SUBJECTS,id),'unknown approval subject');
  const prefix='art-sources/characters/'+id+'/identity/';
  const path=prefix+'approval.json';
  demand(binding?.path===path&&/^[a-f0-9]{64}$/.test(binding.sha256??''),
    'G1 approval binding required '+id);
  const proofFile=join(root,path);
  demand(lstatSync(proofFile,{throwIfNoEntry:false})?.isFile(),'missing G1 approval '+id);
  const raw=readFileSync(proofFile);
  demand(sha256(raw)===binding.sha256,'G1 approval hash mismatch '+id);
  const proof=JSON.parse(raw.toString('utf8'));
  demand(proof.schemaVersion===1&&proof.character===id&&proof.approved===true&&
    proof.humanVisualReview===true&&proof.identityConsistent===true&&
    proof.independentNativeSources===true&&proof.rightsConfirmed===true&&
    proof.commercialUse===true&&proof.crossCharacterReview===true,
    'G1 human identity approval incomplete '+id);
  demand(typeof proof.reviewer==='string'&&proof.reviewer.trim().length>=3&&
    Number.isFinite(Date.parse(proof.reviewedAt??''))&&
    typeof proof.reviewNotes==='string'&&proof.reviewNotes.trim().length>=24&&
    typeof proof.sourceReference==='string'&&proof.sourceReference.trim().length>=8,
    'G1 dated reviewer, notes and source reference required '+id);
  const catalog=JSON.parse(readFileSync(join(root,'art-sources/source-catalog.json'),'utf8'));
  const transition=JSON.parse(readFileSync(join(root,'public/art/r12-53-transition-manifest.json'),'utf8'));
  demand(catalog.schemaVersion===1&&transition.schemaVersion===1,'unexpected G1 source schema');
  const unique=(entries,key,value)=>{
    const matches=entries.filter(e=>e[key]===value);
    demand(matches.length===1,'missing or duplicated G1 registration '+value);
    return matches[0];
  };
  const source=(entry,name,category)=>{
    const expected=prefix+name;
    const info=exactAsset(root,entry,expected);
    demand(info.width>=1086&&info.height>=1448&&info.width*4===info.height*3,
      'G1 native 3:4 floor '+expected);
    const registered=unique(catalog.assets,'path',expected);
    const bytes=readFileSync(join(root,expected));
    const blob=createHash('sha1').update('blob '+bytes.length).update(Buffer.from([0])).update(bytes).digest('hex');
    demand(registered.category===category&&registered.status==='review'&&
      registered.bytes===info.bytes&&registered.gitBlobSha===blob,
      'G1 source registration mismatch or rework '+expected);
    return info;
  };
  const front=source(proof.front,'front.png','identity');
  const angle=source(proof.angle,'three-quarter-candidate-v2.png','identity-angle');
  demand(front.sha256!==angle.sha256,'G1 duplicate front and angle '+id);
  const names=id==='yuesha'?['yuesha-avatar-v3.webp','yuesha-portrait-v3.webp','yuesha-bust-v3.webp']:['face.webp'];
  const refs=names.map(name=>'public/art/characters/'+id+'/'+name);
  demand(Array.isArray(proof.references)&&proof.references.length===refs.length,'G1 reference roster mismatch '+id);
  for(const expected of refs){
    const entry=unique(proof.references,'path',expected);
    const info=exactAsset(root,entry,expected);
    const output=unique(transition.outputs,'output',expected);
    demand(output.source===prefix+'front.png'&&output.sourceSha256===front.sha256&&
      output.outputSha256===info.sha256&&output.bytes===info.bytes&&
      JSON.stringify(output.sourceSize)===JSON.stringify([front.width,front.height])&&
      JSON.stringify(output.size)===JSON.stringify([info.width,info.height]),
      'G1 runtime reference source mismatch '+expected);
  }
  return {character:id,path,sha256:binding.sha256};
}

function parseArgs(args){
  if(!args.length)return process.cwd();
  if(args.length===2&&args[0]==='--source-dir'&&args[1])return args[1];
  fail('usage: node scripts/verify-g1-face-sources.mjs [--current | --source-dir /path/to/unpacked-zip]');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{
    if(process.argv.length===3&&process.argv[2]==='--current'){
      const result=verifyCurrentG1FaceSources(process.cwd());
      console.log(JSON.stringify(result,null,2));
    }else{
    const result=verifyG1FaceSources(parseArgs(process.argv.slice(2)));
    console.log('G1 research integrity OK: '+result.verified+'/'+result.verified+
      ' PNG/WebP files; 4 independent study portraits; 0 approved identities; NO promotion.');
    }
  }catch(error){console.error(error.message);process.exitCode=1}
}
