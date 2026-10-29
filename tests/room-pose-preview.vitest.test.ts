import {describe,expect,it} from 'vitest';
import {inspectPoseAlpha} from '../src/core/room-pose-preview';
const frame=(size=64)=>{
  const data=new Uint8ClampedArray(size*size*4);
  for(let y=7;y<56;y++)for(let x=9;x<56;x++){
    const dx=(x-32)/22,dy=(y-31)/24;
    if(dx*dx+dy*dy<=1)data[(y*size+x)*4+3]=255;
  }
  return data;
};
describe('V3.16 real decoded alpha silhouette admission',()=>{
  it('accepts a rounded real transparent figure with clean outer edges',()=>{
    expect(inspectPoseAlpha(frame(),64,64).ok).toBe(true);
  });
  it('rejects full-scene opaque CG and empty actors',()=>{
    const scene=new Uint8ClampedArray(64*64*4);scene.fill(255);
    expect(inspectPoseAlpha(scene,64,64).reason).toContain('四角');
    const empty=new Uint8ClampedArray(64*64*4);
    expect(inspectPoseAlpha(empty,64,64).ok).toBe(false);
  });
  it('rejects straight cutouts even when padded with true transparent pixels',()=>{
    const cropped=new Uint8ClampedArray(64*64*4);
    for(let y=6;y<57;y++)for(let x=17;x<47;x++)
      cropped[(y*64+x)*4+3]=255;
    expect(inspectPoseAlpha(cropped,64,64).reason).toContain('裁切边');
  });
  it('rejects mismatched data dimensions',()=>{
    expect(inspectPoseAlpha(frame(),64,12).ok).toBe(false);
  });
});
