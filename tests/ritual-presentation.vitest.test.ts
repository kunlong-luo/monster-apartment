import {describe,it,expect} from 'vitest';
import {RITUAL_PHASES,RITUAL_PHASE_DURATION,RITUAL_RARITY_SCENE,
  nextRitualPhase,strongestSummonResult} from '../src/lib/summon/ritual-presentation';
describe('gacha cinematic is presentation-only and deterministic',()=>{
  it('advances through real scene stages and stops at reveal',()=>{
    expect(RITUAL_PHASES).toEqual(['charge','seal','omen','flip','reveal']);
    expect(RITUAL_PHASES.map(nextRitualPhase)).toEqual(['seal','omen','flip','reveal','reveal']);
    expect(Object.values(RITUAL_PHASE_DURATION).every(n=>n>=500&&n<=1250)).toBe(true);
  });
  it('does not infer rarity from theme or change the result',()=>{
    const records=[{rarity:'N' as const},{rarity:'SSR-Legend' as const},{rarity:'R' as const}];
    expect(strongestSummonResult(records)).toMatchObject({rarity:'SSR-Legend',scene:{tone:'gold'}});
    expect(records).toEqual([{rarity:'N'},{rarity:'SSR-Legend'},{rarity:'R'}]);
    expect(strongestSummonResult([{rarity:'SSR-Mythic'}])).toMatchObject({
      rarity:'SSR-Mythic',scene:RITUAL_RARITY_SCENE['SSR-Mythic']});
  });
  it('never reveals a mythical omen for ordinary N or R pulls',()=>{
    expect(strongestSummonResult([{rarity:'N'},{rarity:'R'}]).scene.tone).toBe('blue');
    expect(strongestSummonResult([{rarity:'N'}]).scene.tone).toBe('silver');
  });
});
