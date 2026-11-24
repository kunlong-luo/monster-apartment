#!/usr/bin/env node
/** Verify R12.22 G1 face studies in a staged/unpacked source directory.
 * No production promotion, no implied human approval. */
import {readFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {webpDimensions} from './prepare-room-background.mjs';

const flag=process.argv.indexOf('--source-dir');
if(flag!==-1&&(!process.argv[flag+1]||flag!==process.argv.length-2))
  throw new Error('Usage: node scripts/verify-g1-face-sources.mjs [--source-dir /path/to/unpacked-zip]');
const root=resolve(flag<0?'.':process.argv[flag+1]);
const manifestFile=join(root,'art-sources/identity-r12-22/identity-candidate-manifest.json');
if(!existsSync(manifestFile))throw new Error('Missing research manifest. Unpack R12.22 ZIP into source directory first.');
const m=JSON.parse(readFileSync(manifestFile,'utf8'));
function check(cond,msg){if(!cond)throw new Error('G1 intake: '+msg)}
function asset(meta,png=false){
  const path=join(root,meta.path);
  check(existsSync(path),'missing '+meta.path);
  const b=readFileSync(path);
  check(b.length===(meta.bytes??meta.sizeBytes),'byte count changed: '+meta.path);
  check(createHash('sha256').update(b).digest('hex')===meta.sha256,'hash changed: '+meta.path);
  let w,h;
  if(png){
    check(b.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')),'not a PNG: '+meta.path);
    w=b.readUInt32BE(16);h=b.readUInt32BE(20);
  }else{({width:w,height:h}=webpDimensions(b));}
  const [ew,eh]=meta.pixelDimensions??[meta.width,meta.height];
  check(w===ew&&h===eh,'dimensions mismatch '+meta.path);
}
check(m.generatedPortraits===4&&m.humanApprovedIdentities===0&&!m.productionPortraitsReplaced,
  'unreviewed research cannot claim production approval');
const ids=['yuesha','brook','fern','cinder'];
check(JSON.stringify(Object.keys(m.subjects).sort())===JSON.stringify([...ids].sort()),'wrong subject roster');
for(const id of ids){
  const s=m.subjects[id];
  check(s.independentSource===true&&s.researchOnly===true&&s.canonicalIdentityApproved===false,
    'identity status invalid: '+id);
  asset(s.faceStudyOriginalPng,true);asset(s.faceStudyWebp);
  check(s.faceStudyOriginalPng.width===1086&&s.faceStudyOriginalPng.height===1448,'original not 1086×1448: '+id);
}
for(const contact of Object.values(m.images))asset(contact);
console.log('G1 research intake OK: 8 portrait source/export files and '+Object.keys(m.images).length+
  ' review aids; 4 independent faces; 0 human approvals. No files promoted.');
