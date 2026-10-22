import { describe, expect, it } from 'vitest';
import {
  NIGHT_DILEMMAS, NIGHT_DECISION_IDS, advanceDay, chooseNightDecision, dailyEstimate,
  hire, newGame, nightDecisionImpact,
} from '../src/core/engine';
import { decodeSave, encodeSave } from '../src/lib/save-game';
import { localizeGameText } from '../src/lib/i18n';

describe('Optional five-night dilemmas', () => {
  it('offers different tradeoffs each night and preserves the old result by default', () => {
    expect(NIGHT_DILEMMAS).toHaveLength(5);
    expect(NIGHT_DECISION_IDS).toEqual(['none', 'care', 'profit']);
    let game = hire(newGame(), 3, 'golem').state;
    const normal = advanceDay(game).state;
    expect(dailyEstimate(game).decision).toBe(0);
    expect(normal.history[0].decisionCoins).toBe(0);
    expect(normal.history[0].nightDecision).toBe('none');

    game = chooseNightDecision(game, 'care').state;
    expect(nightDecisionImpact(game)).toEqual({
      coins: 0, satisfaction: 5, helperBonus: 3,
    });
    const care = advanceDay(game).state;
    expect(care.coins).toBe(normal.coins);
    expect(care.satisfaction).toBe(normal.satisfaction + 5);
    expect(care.policy).toBe('steady');
    expect(care.nightDecision).toBe('none');
    expect(care.log.at(-1)).toBe(normal.log.at(-1));

    const profit = advanceDay(chooseNightDecision(hire(newGame(), 3, 'golem').state, 'profit').state).state;
    expect(profit.coins).toBe(normal.coins + 5);
    expect(profit.satisfaction).toBe(normal.satisfaction - 4);
    expect(profit.log.some((message) => message.includes('夜间抉择 profit'))).toBe(true);
  });

  it('care provides a roster-dependent helper reward rather than automatic extra cash', () => {
    const absent = hire(newGame(), 0, 'slime').state;
    expect(nightDecisionImpact(chooseNightDecision(absent, 'care').state).coins).toBe(-3);
    const withGolem = hire(absent, 3, 'golem').state;
    expect(nightDecisionImpact(chooseNightDecision(withGolem, 'care').state).coins).toBe(0);
    expect(chooseNightDecision(absent, 'cheat' as never).error).toBeTruthy();
    const finished = { ...absent, day: 5, over: true, outcome: 'lose' as const };
    expect(chooseNightDecision(finished, 'profit').error).toBeTruthy();
  });

  it('changes the next-day preview and resets decisions after each settlement', () => {
    const first = hire(newGame(), 0, 'slime').state;
    const defaultNet = dailyEstimate(first).net;
    const high = chooseNightDecision(first, 'profit').state;
    expect(dailyEstimate(high).net).toBe(defaultNet + 5);
    const second = advanceDay(high).state;
    expect(second.day).toBe(2);
    expect(second.nightDecision).toBe('none');
    expect(dailyEstimate(second).decision).toBe(0);
    const protect = chooseNightDecision(second, 'care').state;
    expect(nightDecisionImpact(protect).coins).toBe(0); // -5 plus 5 from slime
    expect(nightDecisionImpact(protect).satisfaction).toBe(7);
  });

  it('round-trips choices and restores older version-one saves safely', () => {
    const state = chooseNightDecision(hire(newGame(), 0, 'slime').state, 'profit').state;
    const save = { version: 1 as const, locale: 'en' as const,
      tutorialActive: false, tutorialStep: 0, state };
    expect(decodeSave(encodeSave(save))?.state.nightDecision).toBe('profit');
    const legacy = JSON.parse(encodeSave(save));
    delete legacy.state.nightDecision;
    expect(decodeSave(JSON.stringify(legacy))?.state.nightDecision).toBe('none');
    const tampered = JSON.parse(encodeSave(save));
    tampered.state.nightDecision = 'unavailable';
    expect(decodeSave(JSON.stringify(tampered))).toBeNull();
    const result = advanceDay(state).state;
    const completedSave = { ...save, state: result };
    expect(decodeSave(encodeSave(completedSave))?.state.history[0].decisionCoins).toBe(5);
  });

  it('translates decision log messages on English mode', () => {
    const chosen = chooseNightDecision(hire(newGame(), 0, 'slime').state, 'profit').state;
    const settled = advanceDay(chosen).state;
    const note = settled.log.find((entry) => entry.includes('夜间抉择'));
    expect(localizeGameText(note ?? '', 'en')).toContain('Night decision Profit');
  });
});
