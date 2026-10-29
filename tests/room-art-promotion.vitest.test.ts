import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {sha256,verifyRoomApproval} from '../scripts/promote-room-background.mjs';
import roomManifest from '../public/art/rooms/manifest.json';
const bytes=readFileSync('public/art/yuesha-bust-v3.webp');
const anchors=roomManifest.rooms.yuesha.objectAnchors;
const approval={
  approved:true,humanVisualReview:true,room:'yuesha',
  asset:'background-candidate.webp',assetSha256:sha256(bytes),
  sourceType:'ai-generated',sourceReference:'original-image-project-reference',
  original:true,commercialUse:true,rightsConfirmed:true,
  noBakedUI:true,noBakedCharacterInBackground:true,
  reviewer:'QA Artist',reviewNotes:'All three hotspots reviewed in three viewports, no baked character or text.',
  reviewedAt:'2026-10-29T00:00:00Z',
  objectAnchors:anchors,
  visualReview:{'desktop-1200x675':true,'mobile-390x315':true,'compact-320x315':true},
};
describe('V3.13 room-art promotion requires true reviewed-byte match',()=>{
  it('rejects fake, stale and missing human approval before publishing',()=>{
    expect(()=>verifyRoomApproval({room:'yuesha',review:{...approval,approved:false},imageBytes:bytes,anchors}))
      .toThrow('human-approved');
    expect(()=>verifyRoomApproval({room:'yuesha',review:{...approval,assetSha256:'0'.repeat(64)},imageBytes:bytes,anchors}))
      .toThrow('SHA-256');
    expect(()=>verifyRoomApproval({room:'yuesha',review:{...approval,visualReview:{}},imageBytes:bytes,anchors}))
      .toThrow('visual review');
    expect(()=>verifyRoomApproval({room:'yuesha',review:{...approval,objectAnchors:{...anchors,seal:[.2,.2]}},imageBytes:bytes,anchors}))
      .toThrow('coordinates');
    expect(()=>verifyRoomApproval({room:'yuesha',review:{...approval,reviewNotes:'ok'},imageBytes:bytes,anchors}))
      .toThrow('review notes');
  });
  it('retains dimensional gate even when reviewers have checked a low-res image',()=>{
    expect(()=>verifyRoomApproval({room:'yuesha',review:approval,imageBytes:bytes,anchors}))
      .toThrow('1920x1080');
  });
});
