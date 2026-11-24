import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {webpDimensions} from './prepare-room-background.mjs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url));
const json=path=>JSON.parse(read(path).toString('utf8'));
const hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');
const catalog=json('art-sources/source-catalog.json');
const review=json('public/art/rooms/r12-57-review-manifest.json');
const rooms=json('public/art/rooms/manifest.json');
assert.equal(review.sourceCommit,catalog.sourceCommit);
assert.equal(review.humanVisualReview,false);
assert.equal(review.productionApproved,false);
assert.equal(review.outputs.length,8);
assert.equal(new Set(review.outputs.map(row=>row.outputSha256)).size,8);
for(const id of ['yuesha','brook','fern','cinder']){
  for(const kind of ['background','standing']){
    const matches=review.outputs.filter(row=>row.resident===id&&row.kind===kind);
    assert.equal(matches.length,1,id+' '+kind);
    const row=matches[0];
    const source=kind==='background'?'art-sources/rooms/'+id+'/background.png':'art-sources/characters/'+id+'/sprites/standing.png';
    const output='public/art/rooms/'+id+'/review/'+kind+'-candidate.webp';
    const size=kind==='background'?[1672,941]:[1086,1448];
    assert.equal(row.source,source);
    assert.equal(row.output,output);
    assert.deepEqual(row.size,size);
    assert.equal(row.status,'review-only');
    const sourceBytes=read(source),bytes=read(output);
    const entry=catalog.assets.find(x=>x.path===source);
    assert.equal(entry.status,'review');
    assert.equal(hash(Buffer.concat([Buffer.from('blob '+sourceBytes.length+'\0'),sourceBytes]),'sha1'),entry.gitBlobSha);
    assert.equal(row.sourceGitBlobSha,entry.gitBlobSha);
    assert.equal(hash(sourceBytes),row.sourceSha256);
    assert.equal(hash(bytes),row.outputSha256);
    assert.equal(bytes.length,row.bytes);
    const dims=webpDimensions(bytes);
    assert.deepEqual([dims.width,dims.height],size);
    const alpha=bytes.toString('ascii',12,16)==='VP8X'&&(bytes[20]&16)!==0;
    assert.equal(alpha,kind==='standing');
    if(kind==='standing'){
      const report=row.alphaReport;
      assert(report.transparentFraction>.05&&report.nearOpaqueFraction>=.08);
      assert(report.cornerAlpha.length===4&&report.cornerAlpha.every(value=>value<=32));
      assert.equal(report.requiresAlphaRework,false);
    }else assert.equal(row.alphaReport,null);
  }
  assert.equal(rooms.rooms[id].backgroundStatus,'concept');
  assert.equal(rooms.rooms[id].residentStatus,'concept');
  assert(rooms.rooms[id].poses.every(path=>!path.includes('/review/')));
}
console.info('R12.57: eight verified native WebP review layers; production manifest remains concept.');
