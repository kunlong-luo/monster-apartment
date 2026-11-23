#!/usr/bin/env node
/** Research-only coordinate feasibility; this is NOT a real browser or click test. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const draft=JSON.parse(readFileSync('docs/art-reviews/R12-14-S02-mobile-hotspot-draft.json','utf8'));
assert.equal(draft.taskId,'ART-S02-M');
assert.equal(draft.status,'research-hotspot-draft-only-not-wired');
assert.equal(draft.productionApproved,false);
assert.equal(draft.runtimeHotspotsAdded,false);
assert.equal(draft.interactiveBrowserProof,false);
assert.equal(draft.humanVisualReview,false);
assert.equal(draft.sourceWidth,941);
assert.equal(draft.sourceHeight,1672);
const pts=draft.doorCentersNormalized;
assert.equal(pts.length,6);
assert.deepEqual(pts.map(p=>p.roomIndex).sort((a,b)=>a-b),[0,1,2,3,4,5]);
for(const p of pts){
  assert.ok(Number.isFinite(p.x)&&p.x>0&&p.x<1);
  assert.ok(Number.isFinite(p.y)&&p.y>0&&p.y<1);
  assert.equal(p.side,p.roomIndex<3?'left':'right');
}
const stage=[{width:390,height:844},{width:390,height:550}];
for(const {width,height} of stage){
  const scale=Math.max(width/draft.sourceWidth,height/draft.sourceHeight);
  const offsetX=(width-draft.sourceWidth*scale)/2;
  const offsetY=(height-draft.sourceHeight*scale)/2;
  const center=pts.map(p=>({
    x:p.x*draft.sourceWidth*scale+offsetX,
    y:p.y*draft.sourceHeight*scale+offsetY,
  }));
  let minEdge=Infinity,minSeparation=Infinity;
  for(let i=0;i<center.length;i++){
    const {x,y}=center[i];
    minEdge=Math.min(minEdge,x,y,width-x,height-y);
    for(let j=i+1;j<center.length;j++)
      minSeparation=Math.min(minSeparation,Math.hypot(x-center[j].x,y-center[j].y));
  }
  assert.ok(minEdge>=22,`${width}x${height}: estimated edge clearance ${minEdge}`);
  assert.ok(minSeparation>=44,`${width}x${height}: estimated hotspot separation ${minSeparation}`);
  console.log(`S02 mobile research-only ${width}x${height}: edge ${minEdge.toFixed(1)}px, separation ${minSeparation.toFixed(1)}px; NOT a click test`);
}
