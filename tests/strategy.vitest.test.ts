import { describe, expect, it } from 'vitest';
import { advanceDay, choosePolicy, chooseNightDecision, dailyEstimate, newGame,
  placeSpirit, moveOrSwap, preferenceDetails, ROOM_TRAITS, POLICIES, managementForecast } from '../src/core/engine';
import { decodeSave, encodeSave } from '../src/lib/save-game';
import { localizeGameText } from '../src/lib/i18n';
const starter = () => placeSpirit(newGame(), 5, 'seedling').state;
describe('Original spirit management balance', () => {
  it('separates daily predictions and hidden future events', () => {
    const state = starter();
    const steady = managementForecast(state);
    expect(steady.remainingNights).toBe(5);
    expect(steady.coinsTonight).toBe(state.coins + dailyEstimate(state).net);
    expect(steady.satisfactionTonight).toBe(72);
    const risk = managementForecast(chooseNightDecision(state, 'profit').state);
    expect(risk.coinsTonight).toBe(steady.coinsTonight + 5);
    expect(risk.satisfactionTonight).toBe(steady.satisfactionTonight - 4);
  });
  it('uses six elemental room traits', () => {
    expect(ROOM_TRAITS).toHaveLength(6);
    const rooms = ['pebble-crab','day-smith','dusk-bell','prism-mole','fern-hare','seedling'] as const;
    expect(preferenceDetails([...rooms]).matches).toBe(6);
    const swapped = [...rooms];
    [swapped[0],swapped[1]]=[swapped[1],swapped[0]];
    expect(preferenceDetails(swapped).matches).toBe(4);
  });
  it('applies policies, resets each night, and never mutates input', () => {
    const state = starter();
    expect(dailyEstimate(state).preference).toBe(3);
    const selected = choosePolicy(state, 'festival').state;
    expect(dailyEstimate(selected).policy).toBe(-5);
    const result = advanceDay(selected).state;
    expect(result.history[0].policySatisfaction).toBe(8);
    expect(result.policy).toBe('steady');
    expect(state.policy).toBe('steady');
    expect(POLICIES.savings.coins).toBe(6);
  });
  it('retains moved spirit locations across local saves', () => {
    const state = moveOrSwap(starter(), 5, 3).state;
    const saved = { version: 1 as const, state, locale: 'en' as const,
      tutorialActive: false, tutorialStep: 2 };
    const restored = decodeSave(encodeSave(saved));
    expect(restored?.state.rooms[3]).toBe('seedling');
    expect(restored?.collection?.equipped[3]).toBe('seedling');
  });
  it('translates strategy notes to English', () => {
    const result = advanceDay(choosePolicy(starter(), 'festival').state).state;
    const entry = result.log.find(line => line.includes('房间偏好')) ?? '';
    expect(localizeGameText(entry, 'en')).toContain('Room affinity');
    expect(localizeGameText(entry, 'en')).toContain('Party');
  });
});
