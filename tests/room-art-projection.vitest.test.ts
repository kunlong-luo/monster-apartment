import {describe,expect,it} from 'vitest';
import {projectCoverAnchor,roomProjectedHotspotPosition,roomHotspotPosition} from '../src/core/room-stage-layout';
import {roomSceneFocus} from '../src/core/room-scene-focus';
import art from '../public/art/rooms/manifest.json';

describe('V3.11 background cover projection and shared focus coordinates',()=>{
  it('preserves concept-room hotspots with or without stage measurements',()=>{
    expect(roomProjectedHotspotPosition('yuesha','seal',{width:390,height:315}))
      .toEqual(roomHotspotPosition('yuesha','seal'));
    expect(roomSceneFocus('yuesha','tea','warm',{width:390,height:315}).left)
      .toBe(roomHotspotPosition('yuesha','tea').left);
  });
  it('projects an original 16:9 coordinate into the centered mobile crop',()=>{
    expect(projectCoverAnchor([0.6,0.815],{width:1200,height:675}))
      .toEqual({left:'60%',top:'81.5%'});
    expect(projectCoverAnchor([0.6,0.815],{width:390,height:315}))
      .toEqual({left:'64.36%',top:'81.5%'});
  });
  it('keeps all three candidate props reachable with 44px phone touch targets',()=>{
    const markers=Object.values(art.rooms.yuesha.objectAnchors).map(point=>
      projectCoverAnchor(point as readonly [number,number],{width:390,height:315}));
    const pixels=markers.map(point=>[
      Number.parseFloat(point.left)/100*390,
      Number.parseFloat(point.top)/100*315,
    ]);
    for(const [i,point] of pixels.entries()){
      expect(point[0]).toBeGreaterThanOrEqual(22);
      expect(point[0]).toBeLessThanOrEqual(368);
      expect(point[1]).toBeGreaterThanOrEqual(22);
      expect(point[1]).toBeLessThanOrEqual(293);
      for(const other of pixels.slice(0,i))
        expect(Math.hypot(point[0]-other[0],point[1]-other[1])).toBeGreaterThanOrEqual(44);
    }
  });
  it('rejects invalid dimensions rather than dividing by zero',()=>{
    expect(()=>projectCoverAnchor([0.5,0.5],{width:0,height:315})).toThrow();
  });
});
