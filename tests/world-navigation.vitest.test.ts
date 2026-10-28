import {describe,it,expect} from 'vitest';
import {CANONICAL_GAME_NAV,WORLD_NAV} from '../src/components/moonwork/world-navigation';

describe('game navigation stays navigable across all seven pages',()=>{
  it('provides all seven unique destinations and a real route back to the lobby',()=>{
    expect(CANONICAL_GAME_NAV).toHaveLength(7);
    expect(WORLD_NAV).toHaveLength(7);
    expect(WORLD_NAV.map(item=>item.href)).toEqual(
      CANONICAL_GAME_NAV.map(item=>item.href)
    );
    expect(new Set(WORLD_NAV.map(item=>item.href)).size).toBe(7);
    expect(WORLD_NAV.find(item=>item.id==='lobby')).toMatchObject({href:'/',full:'大厅'});
  });
  it('keeps the workshop dock distinct from the town-building workshop portal',()=>{
    expect(WORLD_NAV.find(item=>item.id==='workshop')?.full).toBe('工坊');
    expect(WORLD_NAV.find(item=>item.id==='town')?.full).toBe('月光街');
  });
});
