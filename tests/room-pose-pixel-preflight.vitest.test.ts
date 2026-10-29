import {describe,expect,it} from 'vitest';
import {inspectAlphaMask,comparePosePixels,assertDistinctPosePixels} from '../scripts/check-portrait-pixels.mjs';
const ellipse=(n=128)=>{
  const a=Array.from({length:n*n},()=>0);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const dx=(x-64)/35,dy=(y-66)/48;
    if(dx*dx+dy*dy<1)a[y*n+x]=255;
  }
  return a;
};
describe('V3.16 actual decoded image alpha-edge gate',()=>{
  it('accepts a complete silhouette with transparent margins',()=>{
    const result=inspectAlphaMask(ellipse(),128,128);
    expect(result.passesPixelPreflight).toBe(true);
  });
  it('rejects clipped composite-sheet crops even after transparent padding',()=>{
    const a=Array.from({length:128*128},()=>0);
    for(let y=12;y<115;y++)for(let x=20;x<108;x++)a[y*128+x]=255;
    expect(()=>inspectAlphaMask(a,128,128)).toThrow('Silhouette clipping');
  });
  it('does not confuse an alpha header with actual transparency',()=>{
    expect(()=>inspectAlphaMask(Array.from({length:128*128},()=>255),128,128))
      .toThrow('Non-transparent');
  });
});


describe('V3.17 pose diversity preflight',()=>{
  function sample(shift=0,color=150){
    const alpha=Array.from({length:64*64},()=>0);
    const tone=Array.from({length:64*64},()=>0);
    for(let y=10;y<54;y++)for(let x=12+shift;x<50+shift;x++){
      alpha[y*64+x]=255;tone[y*64+x]=color;
    }
    return {alpha,tone};
  }
  it('rejects duplicated pose art even when its file hash changes',()=>{
    const idle=sample();
    const recolored=sample(0,155);
    expect(comparePosePixels(idle,recolored).alphaDifference).toBe(0);
    expect(()=>assertDistinctPosePixels({idle,attentive:recolored}))
      .toThrow('Visually near-duplicate');
  });
  it('admits genuinely changed silhouettes regardless of shared clothing color',()=>{
    const idle=sample();
    const warm=sample(8);
    expect(comparePosePixels(idle,warm).alphaDifference).toBeGreaterThan(.018);
    expect(()=>assertDistinctPosePixels({idle,warm})).not.toThrow();
  });
  it('never silently compares mismatched grids',()=>{
    expect(()=>comparePosePixels({alpha:[1],tone:[1]},{alpha:[1,2],tone:[1,2]}))
      .toThrow('Invalid pose');
  });
});
