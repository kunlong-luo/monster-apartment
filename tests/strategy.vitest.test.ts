import { describe, expect, it } from 'vitest';
import { advanceDay, choosePolicy, dailyEstimate, hire, moveOrSwap,
  newGame, preferenceDetails, ROOM_TRAITS, POLICIES } from '../src/core/engine';
import { decodeSave, encodeSave } from '../src/lib/save-game';
import { localizeGameText } from '../src/lib/i18n';

describe('V0.4.0 strategic depth', () => {
  it('assigns six permanent traits and rewards appropriate tenants', () => {
    expect(ROOM_TRAITS).toHaveLength(6);
    const rooms: Array<'slime' | 'ember' | 'ghost' | 'golem' | null> =
      ['slime', 'ember', 'ghost', 'golem', null, null];
    expect(preferenceDetails(rooms)).toEqual({
      coins: 12, satisfaction: 8, matches: 4, mismatches: 0,
    });
    const swapped = [...rooms];
    [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
    expect(preferenceDetails(swapped)).toEqual({
      coins: 4, satisfaction: 2, matches: 2, mismatches: 2,
    });
  });

  it('uses visible room preferences in estimated settlement and persists new policy only for one night', () => {
    let game = hire(newGame(), 0, 'slime').state;
    const oldGame = JSON.stringify(game);
    expect(dailyEstimate(game).preference).toBe(3);
    expect(dailyEstimate(game).policy).toBe(0);
    const selected = choosePolicy(game, 'festival');
    expect(selected.error).toBeNull();
    game = selected.state;
    expect(game.policy).toBe('festival');
    expect(POLICIES.festival).toEqual({ coins: -5, satisfaction: 8 });
    expect(dailyEstimate(game).net).toBe(3);
    const settled = advanceDay(game).state;
    expect(settled.history[0].preference).toBe(3);
    expect(settled.history[0].policyCoins).toBe(-5);
    expect(settled.history[0].policySatisfaction).toBe(8);
    expect(settled.satisfaction).toBe(80);
    expect(settled.policy).toBe('steady');
    expect(JSON.stringify(hire(newGame(), 0, 'slime').state)).toBe(oldGame);
  });

  it('adds savings income but reduces satisfaction and blocks decisions after the end', () => {
    let state = hire(newGame(), 1, 'slime').state;
    expect(preferenceDetails(state.rooms).coins).toBe(-1);
    state = choosePolicy(state, 'savings').state;
    expect(dailyEstimate(state).policy).toBe(6);
    const completed = advanceDay(state).state;
    expect(completed.satisfaction).toBe(63);
    const ended = { ...completed, over: true, day: 5, outcome: 'lose' as const };
    expect(choosePolicy(ended, 'festival').error).toBeTruthy();
    expect(choosePolicy(completed, 'not-real' as never).error).toBeTruthy();
  });

  it('keeps legacy v1 saves and restores new policy states without resetting the run', () => {
    let state = hire(newGame(), 0, 'slime').state;
    state = moveOrSwap(state, 0, 2).state;
    const saved = { version: 1 as const, state, locale: 'en' as const,
      tutorialActive: false, tutorialStep: 3 };
    const current = decodeSave(encodeSave({ ...saved, state: choosePolicy(state, 'savings').state }));
    expect(current?.state.policy).toBe('savings');

    const legacy = JSON.parse(encodeSave(saved));
    delete legacy.state.policy;
    const restored = decodeSave(JSON.stringify(legacy));
    expect(restored?.state.rooms).toEqual(state.rooms);
    expect(restored?.state.policy).toBe('steady');
    expect(restored?.state.day).toBe(state.day);
    const invalid = JSON.parse(encodeSave(saved));
    invalid.state.policy = 'cheat';
    expect(decodeSave(JSON.stringify(invalid))).toBeNull();
  });

  it('translates strategic settlement notes', () => {
    const game = choosePolicy(hire(newGame(), 0, 'slime').state, 'festival').state;
    const settled = advanceDay(game).state;
    expect(localizeGameText(settled.log.find(line => line.includes('房间偏好')) ?? '', 'en')).toContain('Room affinity');
    expect(localizeGameText(settled.log.find(line => line.includes('房间偏好')) ?? '', 'en')).toContain('Party');
  });
});
