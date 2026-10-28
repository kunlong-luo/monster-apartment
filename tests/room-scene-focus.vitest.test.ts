import {describe,expect,it} from 'vitest';
import {roomSceneFocus} from '../src/core/room-scene-focus';
import {roomHotspotPosition} from '../src/core/room-stage-layout';
import {CHARACTER_ROOM_OBJECTS} from '../src/core/character-life';

describe('V3.8 localized focus lighting',()=>{
  it('always follows the matching physical hotspot',()=>{
    for(const id of ['yuesha','brook','fern','cinder'] as const){
      for(const item of CHARACTER_ROOM_OBJECTS[id]){
        const point=roomHotspotPosition(id,item);
        const effect=roomSceneFocus(id,item,'attentive');
        expect(effect.left).toBe(point.left);
        expect(effect.top).toBe(point.top);
        expect(effect.background).toContain(point.left+' '+point.top);
      }
    }
  });
  it('changes its light mood without editing a save or changing the background art',()=>{
    const warm=roomSceneFocus('yuesha','tea','warm');
    const wary=roomSceneFocus('yuesha','tea','guarded');
    expect(warm.left).toBe(wary.left);
    expect(warm.top).toBe(wary.top);
    expect(warm.tint).not.toBe(wary.tint);
    expect(warm.background).toContain('radial-gradient');
  });
});
