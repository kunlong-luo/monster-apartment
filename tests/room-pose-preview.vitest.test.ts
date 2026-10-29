import {describe,expect,it} from 'vitest';
import {inspectPoseAlpha} from '../src/core/room-pose-preview';
const frame=(size=64)=>{
  const data=new Uint8ClampedArray(size*size*4);
  for(let y=12;y<56;y++)for(let x=15;x<50;x++)data[(y*size+x)*4+3]=255;
  return data;
};
describe('V3.14 transparent actor frame screening',()=>{
  it('accepts a visible actor surrounded by true transparent corners',()=>{
    expect(inspectPoseAlpha(frame(),64,64).ok).toBe(true);
  });
  it('rejects a room CG with an opaque baked background',()=>{
    const pixels=new Uint8ClampedArray(64*64*4);pixels.fill(255);
    expect(inspectPoseAlpha(pixels,64,64).ok).toBe(false);
    expect(inspectPoseAlpha(pixels,64,64).reason).toContain('四角');
  });
  it('rejects empty, invalid or almost invisible actor images',()=>{
    const empty=new Uint8ClampedArray(64*64*4);
    expect(inspectPoseAlpha(empty,64,64).ok).toBe(false);
    expect(inspectPoseAlpha(empty,64,12).ok).toBe(false);
  });
});
