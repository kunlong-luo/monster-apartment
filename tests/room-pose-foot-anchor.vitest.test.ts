import {describe,expect,it} from 'vitest';
import {inspectPoseAlpha,poseFootAnchorsAlign} from '../src/core/room-pose-preview';
import {inspectAlphaMask,assertConsistentPoseFootAnchors} from '../scripts/check-portrait-pixels.mjs';
function sample(cx:number,cy:number,size=64){
  const rgba=new Uint8ClampedArray(size*size*4),alpha=new Uint8Array(size*size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    if(((x-cx)/(size*.20))**2+((y-cy)/(size*.30))**2>1)continue;
    rgba[(y*size+x)*4+3]=255;alpha[y*size+x]=255;
  }
  return {rgba,alpha};
}
describe('V3.53 human portrait registered foot anchors',()=>{
  it('measures lower silhouette anchors in browser and offline approval consistently',()=>{
    const a=sample(30,30),b=sample(31,30);
    const browser=inspectPoseAlpha(a.rgba,64,64);
    expect(browser.ok).toBe(true);
    if(!browser.ok)throw Error(browser.reason);
    const offline=inspectAlphaMask(a.alpha,64,64);
    expect(browser.footAnchor.x).toBeCloseTo(offline.footAnchor.x,5);
    expect(browser.footAnchor.y).toBeCloseTo(offline.footAnchor.y,5);
    expect(poseFootAnchorsAlign(browser.footAnchor,inspectAlphaMask(b.alpha,64,64).footAnchor)).toBe(true);
    expect(()=>assertConsistentPoseFootAnchors({idle:offline,warm:inspectAlphaMask(b.alpha,64,64)}))
      .not.toThrow();
  });
  it('rejects images floating above the original baseline despite valid alpha',()=>{
    const a=inspectAlphaMask(sample(30,29).alpha,64,64);
    const moved=inspectAlphaMask(sample(30,22).alpha,64,64);
    expect(a.passesPixelPreflight).toBe(true);
    expect(moved.passesPixelPreflight).toBe(true);
    expect(()=>assertConsistentPoseFootAnchors({idle:a,warm:moved}))
      .toThrow('foot anchor mismatch');
  });
  it('rejects horizontal foot drift, not just canvas size drift',()=>{
    const a=inspectAlphaMask(sample(22,30).alpha,64,64);
    const b=inspectAlphaMask(sample(35,30).alpha,64,64);
    expect(poseFootAnchorsAlign(a.footAnchor,b.footAnchor)).toBe(false);
  });
  it('does not accept missing or malformed preview bounds',()=>{
    expect(()=>assertConsistentPoseFootAnchors({idle:{footAnchor:{x:.5,y:.8}},warm:{}}))
      .toThrow('foot anchor mismatch');
    expect(()=>inspectAlphaMask(new Uint8Array(9),64,64)).toThrow('Invalid decoded');
  });
});
