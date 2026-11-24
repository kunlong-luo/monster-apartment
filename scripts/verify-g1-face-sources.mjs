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

function parseArgs(args){
  if(!args.length)return process.cwd();
  if(args.length===2&&args[0]==='--source-dir'&&args[1])return args[1];
  fail('usage: node scripts/verify-g1-face-sources.mjs [--source-dir /path/to/unpacked-zip]');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{
    const result=verifyG1FaceSources(parseArgs(process.argv.slice(2)));
    console.log('G1 research integrity OK: '+result.verified+'/'+result.verified+
      ' PNG/WebP files; 4 independent study portraits; 0 approved identities; NO promotion.');
  }catch(error){console.error(error.message);process.exitCode=1}
}
