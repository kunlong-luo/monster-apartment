import {describe,expect,it} from 'vitest';
import {poseLooksDuplicated,poseSimilarity,poseThumbnail} from '../src/core/room-pose-comparison';

function art(x:number,y:number,tone=140){
  const width=64,height=64,data=new Uint8ClampedArray(width*height*4);
  for(let row=0;row<height;row++)for(let col=0;col<width;col++){
    if(((col-x)/14)**2+((row-y)/21)**2>1)continue;
    const index=(row*width+col)*4;
    data[index]=tone;data[index+1]=tone;data[index+2]=tone;data[index+3]=255;
  }
  return poseThumbnail(data,width,height);
}
describe('V3.51 local art review recognizes near-clone four poses',()=>{
  it('rejects byte-different art that only changes an accessory tint',()=>{
    const a=art(30,30,140),b=art(30,30,144);
    expect(a.tone).not.toEqual(b.tone);
    expect(poseLooksDuplicated(a,b)).toBe(true);
    expect(poseSimilarity(a,b).alphaDifference).toBe(0);
  });
  it('accepts actual figure movement and different silhouettes',()=>{
    const a=art(30,30),b=art(42,30);
    expect(poseLooksDuplicated(a,b)).toBe(false);
    expect(poseSimilarity(a,b).alphaDifference).toBeGreaterThan(.018);
  });
  it('does not count fully transparent pixels as meaningful tonal changes',()=>{
    const a=art(30,30),b=art(30,30);
    b.tone[0]=255;
    expect(poseLooksDuplicated(a,b)).toBe(true);
  });
  it('refuses mismatched pixel buffers',()=>{
    const a=art(30,30);
    expect(()=>poseSimilarity(a,{alpha:new Uint8Array(3),tone:new Uint8Array(3)}))
      .toThrow('Invalid pose comparison');
    expect(()=>poseThumbnail(new Uint8ClampedArray(9),64,64))
      .toThrow('Invalid decoded');
  });
});
