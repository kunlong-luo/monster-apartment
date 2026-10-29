import {describe,it,expect} from 'vitest';
import {CANONICAL_GAME_NAV,WORLD_NAV,destinationByHref} from '../src/components/moonwork/world-navigation';
describe('one unambiguous route registry for all seven game scenes',()=>{
  it('contains exactly seven unique routes with matching names and roles',()=>{
    expect(WORLD_NAV).toBe(CANONICAL_GAME_NAV);
    expect(WORLD_NAV).toHaveLength(7);
    expect(new Set(WORLD_NAV.map(x=>x.href)).size).toBe(7);
    expect(WORLD_NAV.find(x=>x.id==='lobby')).toMatchObject({href:'/',full:'大厅'});
    expect(WORLD_NAV.every(x=>x.purpose.length>=8)).toBe(true);
  });
  it('does not confuse a street market with the entire game map',()=>{
    expect(destinationByHref('/town/')).toMatchObject({id:'town',full:'月光街'});
    expect(destinationByHref('/workshop/')).toMatchObject({id:'workshop',full:'工坊'});
    expect(destinationByHref('/unknown/')).toBeUndefined();
  });
});
