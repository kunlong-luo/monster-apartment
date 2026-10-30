import {describe,expect,it} from 'vitest';
import {coverProjection,ROOM_OBJECT_IDS,validateRoomAnchors} from '../scripts/room-anchor-review.mjs';
import manifest from '../public/art/rooms/manifest.json';

const points=[[.56,.35],[.65,.5],[.78,.7]] as const;
const named=(room:keyof typeof ROOM_OBJECT_IDS)=>Object.fromEntries(
  ROOM_OBJECT_IDS[room].map((id,i)=>[id,[...points[i]]])
);

describe('V3.15 pre-production room anchors are reviewed without editing the game manifest',()=>{
  it('accepts all four room object identities with legible 390px markers',()=>{
    for(const room of ['yuesha','brook','fern','cinder'] as const){
      const draft=named(room);
      expect(validateRoomAnchors(room,draft)).toBe(draft);
    }
    // Old Yuesha concept coordinates were never approved for a new HD image.
    // Their square 44px hit areas intersect, so promotion must require re-anchoring.
    expect(()=>validateRoomAnchors('yuesha',manifest.rooms.yuesha.objectAnchors))
      .toThrow('390px phone markers overlap');
  });
  it('requires exactly the real investigation props for that resident',()=>{
    expect(()=>validateRoomAnchors('brook',named('fern'))).toThrow('Exactly three');
    expect(()=>validateRoomAnchors('brook',{...named('brook'),bonus:[.5,.5]})).toThrow('Exactly three');
    expect(()=>validateRoomAnchors('brook',null)).toThrow('Exactly three');
    expect(()=>validateRoomAnchors('brook',{...named('brook'),toolbox:[0,.5]})).toThrow('Invalid normalized');
    expect(()=>validateRoomAnchors('brook',{...named('brook'),toolbox:['.5',.5]})).toThrow('Invalid normalized');
  });
  it('rejects both unreachable and overlapping touch targets before approval',()=>{
    expect(()=>validateRoomAnchors('brook',{...named('brook'),nightbell:[.97,.5]}))
      .toThrow('390px phone marker unreachable');
    expect(()=>validateRoomAnchors('brook',{...named('brook'),gauge:[.565,.355]}))
      .toThrow('390px phone markers overlap');
    // Delta x=40px and delta y=40px are >44px diagonally,
    // but the 44px square buttons still overlap on both axes.
    expect(()=>validateRoomAnchors('brook',{...named('brook'),gauge:[.56+40/560,.35+40/315]}))
      .toThrow('390px phone markers overlap');
  });
  it('treats 320px as an honest crop, not a reason to falsify object locations',()=>{
    expect(coverProjection([.78,.7],390,315).visible).toBe(true);
    expect(coverProjection([.78,.7],320,315).visible).toBe(false);
  });
  it('does not mark any candidate background or resident as approved',()=>{
    for(const room of ['yuesha','brook','fern','cinder'] as const){
      expect(manifest.rooms[room].backgroundStatus).toBe('concept');
      expect(manifest.rooms[room].residentStatus).toBe('concept');
    }
  });
});
