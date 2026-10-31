import {describe,it,expect} from 'vitest';
import {getNextUnrevealedIndex,getTenPullHoldMs,isFeaturedTenPullRarity,
  TEN_PULL_FIRST_REVEAL_MS} from '../src/lib/summon/ten-pull-playback';
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
});
