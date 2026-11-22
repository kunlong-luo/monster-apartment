#!/usr/bin/env node
// Validate research artwork binaries against the exact SHA-256 and native
// headers. This is NOT a commercial-rights or visual approval mechanism.
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const path='docs/art-reviews/R12-09-REVIEW-ASSETS-2026-11-22.json';
if(!existsSync(path))throw Error('Missing review manifest '+path);
const data=JSON.parse(readFileSync(path,'utf8'));
if(data.kind!=='unapproved-asset-staging'||!Array.isArray(data.entries))
  throw Error('Invalid review manifest');
const failures=[];
for(const entry of data.entries){
  for(const kind of ['source','candidate']){
    const file=entry[kind];
    const allowed=kind==='source'?'art-sources/review/':'public/art/';
    if(!file?.path||!file.path.startsWith(allowed)||file.path.includes('..')){
      failures.push(entry.taskId+' has unsafe '+kind+' path');continue;
    }
    if(!existsSync(file.path)){
      failures.push('Missing '+file.path+'; files must be unpacked from the review ZIP first');continue;
    }
    const bytes=readFileSync(file.path);
    const digest=createHash('sha256').update(bytes).digest('hex');
    if(digest!==file.sha256)failures.push('SHA mismatch '+file.path);
    let w=0,h=0;
    if(kind==='source'){
      if(bytes.length<24||!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
        failures.push('Not PNG '+file.path);
      else{w=bytes.readUInt32BE(16);h=bytes.readUInt32BE(20);}
    }else if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'){
      failures.push('Not WebP '+file.path);
    }else{
      const chunk=bytes.toString('ascii',12,16);
      if(chunk==='VP8 '){
        const marker=bytes.indexOf(Buffer.from([0x9d,0x01,0x2a]),20);
        if(marker>=0){w=bytes.readUInt16LE(marker+3)&0x3fff;h=bytes.readUInt16LE(marker+5)&0x3fff;}
      }else if(chunk==='VP8L'){
        w=1+(bytes[21]|((bytes[22]&63)<<8));
        h=1+((bytes[22]>>6)|(bytes[23]<<2)|((bytes[24]&15)<<10));
      }else if(chunk==='VP8X'){
        w=1+bytes.readUIntLE(24,3);h=1+bytes.readUIntLE(27,3);
      }else failures.push('Unsupported WebP header '+file.path);
    }
    if(w!==file.width||h!==file.height)
      failures.push('Pixel dimensions mismatch '+file.path+': '+w+'x'+h);
    console.log(entry.taskId,kind,w+'x'+h,digest);
  }
  if(entry.productionApproved!==false||entry.availableInGit!==false)
    failures.push('Do not claim production or Git binary availability in research manifest '+entry.taskId);
}
if(failures.length){
  for(const failure of failures)console.error('ERROR',failure);
  process.exitCode=1;
}else console.log('Review SHA/pixel checks passed; '+data.entries.length+' candidates. Not production-approved.');
