import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {webpDimensions} from './prepare-room-background.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const json=p=>JSON.parse(read(p).toString('utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const catalog=json('art-sources/source-catalog.json');
const report=json('public/art/world-scenes/r12-61-workshop-town-review.json');
assert.equal(report.productionApproved,false);
assert.equal(report.mobileSourceAvailable,false);
assert.equal(report.sourceCommit,catalog.sourceCommit);
assert.equal(report.outputs.length,4);
assert.equal(new Set(report.outputs.map(e=>e.outputSha256)).size,4);
for(const scene of ['workshop','town'])for(const variant of [1,2]){
  const e=report.outputs.find(row=>row.scene===scene&&row.variant===variant);
  assert(e);
  assert.equal(e.source,'art-sources/scenes/'+scene+'/desktop-candidate-v'+variant+'.png');
  const selected=(scene==='workshop'&&variant===1)||(scene==='town'&&variant===2);
  const output=selected?'public/art/world-scenes/'+scene+'/'+scene+'-desktop-transition.webp':
    'docs/art-reviews/sources/'+scene+'-desktop-candidate-v'+variant+'.webp';
  assert.equal(e.output,output);
  assert.equal(e.status,'review-only');
  assert.equal(e.device,'desktop');
  const src=read(e.source),out=read(e.output);
  const item=catalog.assets.find(row=>row.path===e.source);
  assert.equal(item.status,'review');
  assert.equal(createHash('sha1').update('blob '+src.length+'\0').update(src).digest('hex'),item.gitBlobSha);
  assert.equal(e.sourceGitBlobSha,item.gitBlobSha);
  assert.equal(sha(src),e.sourceSha256);
  assert.equal(sha(out),e.outputSha256);
  assert.equal(out.length,e.bytes);
  const size=[src.readUInt32BE(16),src.readUInt32BE(20)];
  assert.deepEqual(size,e.nativeSize);
  assert.deepEqual(size,e.outputSize);
  const dims=webpDimensions(out);
  assert.deepEqual([dims.width,dims.height],size);
}
console.info('Four native desktop candidates verified; no mobile or production approval.');
