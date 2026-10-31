import {describe,it,expect} from 'vitest';
import {stageClickToSourceAnchor,reviewAnchorGeometry,buildUnapprovedAnchorJson}
  from '../src/core/room-art-review-geometry';

describe('QA-only room painting anchor review',()=>{
  it('maps a 16:9 desktop click into source-space coordinates',()=>{
    expect(stageClickToSourceAnchor(960,540,{width:1920,height:1080})).toEqual([.5,.5]);
    expect(stageClickToSourceAnchor(480,270,{width:960,height:540})).toEqual([.5,.5]);
  });
  it('inverts centered object-fit:cover cropping for mobile',()=>{
    expect(stageClickToSourceAnchor(195,157.5,{width:390,height:315})).toEqual([.5,.5]);
    // Source x=.1 is entirely outside this phone crop and must not be misreported.
    expect(stageClickToSourceAnchor(-10,150,{width:390,height:315})).not.toEqual([.1,.5]);
    expect(stageClickToSourceAnchor(100,50,{width:0,height:315})).toBeNull();
  });
  it('prevents publishing incomplete, offscreen, overlapping review anchors',()=>{
    expect(reviewAnchorGeometry({}).missing).toHaveLength(3);
    expect(()=>buildUnapprovedAnchorJson({seal:[.5,.5]})).toThrow();
    expect(reviewAnchorGeometry({seal:[.50,.5],tea:[.51,.51],ledger:[.65,.6]}).problems.length).toBeGreaterThan(0);
    expect(reviewAnchorGeometry({seal:[.05,.5],tea:[.5,.6],ledger:[.7,.6]}).problems.length).toBeGreaterThan(0);
  });
  it('exports only the three named coordinates, never an approval flag',()=>{
    const draft={seal:[.42,.5],tea:[.58,.5],ledger:[.5,.77]} as const;
    expect(reviewAnchorGeometry(draft).ready).toBe(true);
    const value=JSON.parse(buildUnapprovedAnchorJson(draft));
    expect(Object.keys(value).sort()).toEqual(['ledger','seal','tea']);
    expect(value.seal).toEqual([.42,.5]);
    expect(value.approved).toBeUndefined();
  });
});
