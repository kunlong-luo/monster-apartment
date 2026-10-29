import {describe,expect,it} from 'vitest';
import {inspectPoseAssets,portraitReviewHtml} from '../scripts/prepare-room-poses.mjs';

function webp(width=1200,height=1500,alpha=true,salt=0){
  const bytes=Buffer.alloc(13000,0);
  bytes.write('RIFF',0,'ascii');
  bytes.writeUInt32LE(bytes.length-8,4);
  bytes.write('WEBPVP8X',8,'ascii');
  bytes[20]=alpha?16:0;
  bytes.writeUIntLE(width-1,24,3);
  bytes.writeUIntLE(height-1,27,3);
  bytes[100]=salt;
  return bytes;
}
const valid=()=>({idle:webp(1200,1500,true,1),attentive:webp(1200,1500,true,2),
  warm:webp(1200,1500,true,3),guarded:webp(1200,1500,true,4)});
describe('V3.14 all four portrait asset admissions',()=>{
  it('previews four unique same-canvas alpha-marked WebPs without promotion',()=>{
    const frames=inspectPoseAssets(valid());
    expect(Object.keys(frames)).toHaveLength(4);
    expect(frames.idle.width).toBe(1200);
    const html=portraitReviewHtml({room:'yuesha'});
    expect(html).toContain('透明立绘（候选，尚未审核）');
    expect(html).toContain('poses/idle.webp');
  });
  it('rejects duplicate, opaque, undersized and inconsistent candidates',()=>{
    const duplicate=valid();duplicate.guarded=duplicate.idle;
    expect(()=>inspectPoseAssets(duplicate)).toThrow('Duplicate');
    const opaque=valid();opaque.warm=webp(1200,1500,false,3);
    expect(()=>inspectPoseAssets(opaque)).toThrow('alpha');
    const mismatched=valid();mismatched.warm=webp(1200,1600,true,3);
    expect(()=>inspectPoseAssets(mismatched)).toThrow('same pixel canvas');
    const small=valid();small.idle=webp(990,1500,true,1);
    expect(()=>inspectPoseAssets(small)).toThrow('1000');
  });
});
