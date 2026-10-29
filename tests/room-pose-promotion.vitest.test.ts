import {describe,expect,it} from 'vitest';
import {inspectPoseAssets} from '../scripts/prepare-room-poses.mjs';
import {verifyPortraitApproval} from '../scripts/promote-room-poses.mjs';
function webp(id:number){
  const bytes=Buffer.alloc(13000);
  bytes.write('RIFF',0,'ascii');bytes.writeUInt32LE(bytes.length-8,4);
  bytes.write('WEBPVP8X',8,'ascii');bytes[20]=16;
  bytes.writeUIntLE(1199,24,3);bytes.writeUIntLE(1499,27,3);bytes[100]=id;
  return bytes;
}
const assets={idle:webp(1),attentive:webp(2),warm:webp(3),guarded:webp(4)};
const approval={
  room:'yuesha',approved:true,humanVisualReview:true,original:true,
  commercialUse:true,rightsConfirmed:true,sourceType:'ai-generated',
  sourceReference:'original-character-reference-001',
  reviewer:'Visual Artist',reviewNotes:'Reviewed four distinct poses, consistent face, hair, costume and baseline.',
  reviewedAt:'2026-10-29T01:00:00Z',sameFootAnchor:true,transparentEdgesReviewed:true,
  noBakedBackgroundInResident:true,identityConsistent:true,
  poseReview:{idle:true,attentive:true,warm:true,guarded:true},
  frames:inspectPoseAssets(assets),
};
describe('V3.15 signed portrait admission',()=>{
  it('binds approved files to unique hashes and reviewer metadata',()=>{
    const result=verifyPortraitApproval({room:'yuesha',review:approval,assets});
    expect(result.frames.warm.sha256).toBe(approval.frames.warm.sha256);
  });
  it('rejects absent review, missing pose sign-off, swapped image and source gaps',()=>{
    expect(()=>verifyPortraitApproval({room:'yuesha',
      review:{...approval,approved:false},assets})).toThrow('Human');
    expect(()=>verifyPortraitApproval({room:'yuesha',
      review:{...approval,poseReview:{...approval.poseReview,guarded:false}},assets})).toThrow('Each');
    expect(()=>verifyPortraitApproval({room:'yuesha',
      review:approval,assets:{...assets,guarded:webp(8)}})).toThrow('differs');
    expect(()=>verifyPortraitApproval({room:'yuesha',
      review:{...approval,sourceReference:''},assets})).toThrow('source');
  });
  it('cannot promote four cloned images',()=>{
    expect(()=>verifyPortraitApproval({room:'yuesha',review:approval,
      assets:{...assets,guarded:assets.idle}})).toThrow('Duplicate');
  });
});
