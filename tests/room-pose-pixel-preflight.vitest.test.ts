import {describe,expect,it} from 'vitest';
import {inspectAlphaMask} from '../scripts/check-portrait-pixels.mjs';
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
