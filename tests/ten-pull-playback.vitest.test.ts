import {describe,it,expect} from 'vitest';
import {getNextUnrevealedIndex,getTenPullHoldMs,isFeaturedTenPullRarity,
  TEN_PULL_FIRST_REVEAL_MS,initialTenPullPlayback,reduceTenPullPlayback} from '../src/lib/summon/ten-pull-playback';
describe('ten pull presentation sequence',()=>{
  it('plays the original draw order and resumes only unrevealed positions',()=>{
    expect(getNextUnrevealedIndex(10,[])).toBe(0);
    expect(getNextUnrevealedIndex(10,[0,1,3])).toBe(2);
    expect(getNextUnrevealedIndex(10,[1,3,4])).toBe(0);
    expect(getNextUnrevealedIndex(3,[0,1,2])).toBe(-1);
  });
  it('dwells on SSR characters and never changes what was pulled',()=>{
    expect(getTenPullHoldMs('SSR-Legend')).toBeGreaterThan(getTenPullHoldMs('SR'));
    expect(getTenPullHoldMs('SSR-Mythic')).toBeGreaterThan(getTenPullHoldMs('SSR-Legend'));
    expect(getTenPullHoldMs('N')).toBeLessThan(650);
    expect(TEN_PULL_FIRST_REVEAL_MS).toBeLessThan(650);
    expect(isFeaturedTenPullRarity('SSR-Mythic')).toBe(true);
    expect(isFeaturedTenPullRarity('SSR-Legend')).toBe(true);
    expect(isFeaturedTenPullRarity('SR')).toBe(false);
  });
  it('keeps the ten-card playback independent of resources and settles on best rarity',()=>{
    const initial=initialTenPullPlayback(10,false,8);
    expect(initial).toEqual({revealedIndices:[],selectedIndex:0,playback:'playing'});
    const afterFirst=reduceTenPullPlayback(initial,{type:'advance',count:10});
    expect(afterFirst).toMatchObject({selectedIndex:0,revealedIndices:[0],playback:'playing'});
    const paused=reduceTenPullPlayback(afterFirst,{type:'pause'});
    expect(reduceTenPullPlayback(paused,{type:'advance',count:10})).toEqual(paused);
    const manuallyViewed=reduceTenPullPlayback(paused,{type:'select',count:10,index:7});
    expect(manuallyViewed).toMatchObject({selectedIndex:7,revealedIndices:[0,7],playback:'paused'});
    const playing=reduceTenPullPlayback(manuallyViewed,{type:'resume',count:10});
    expect(playing.playback).toBe('playing');
    let completed=playing;
    for(let i=0;i<8;i++)completed=reduceTenPullPlayback(completed,{type:'advance',count:10});
    expect(completed.revealedIndices).toEqual([0,7,1,2,3,4,5,6,8,9]);
    completed=reduceTenPullPlayback(completed,{type:'complete',bestIndex:8,count:10});
    expect(completed.playback).toBe('complete');
    expect(completed.selectedIndex).toBe(8);
    expect(reduceTenPullPlayback(completed,{type:'replay'})).toEqual(initial);
  });
  it('completes an in-progress reveal instantly when reduced motion is enabled',()=>{
    const mid=reduceTenPullPlayback(initialTenPullPlayback(10,false,4),{type:'advance',count:10});
    const instant=reduceTenPullPlayback(mid,{type:'reveal-all',count:10,bestIndex:4});
    expect(instant).toMatchObject({playback:'complete',selectedIndex:4});
    expect(instant.revealedIndices).toEqual([0,1,2,3,4,5,6,7,8,9]);
    expect(initialTenPullPlayback(10,true,4)).toEqual(instant);
  });

});
