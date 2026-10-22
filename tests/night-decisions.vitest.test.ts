import { describe, expect, it } from 'vitest';
import { advanceDay, chooseNightDecision, dailyEstimate, NIGHT_DILEMMAS,
  NIGHT_DECISION_IDS, nightDecisionImpact, newGame, placeSpirit } from '../src/core/engine';
import { decodeSave, encodeSave } from '../src/lib/save-game';
import { localizeGameText } from '../src/lib/i18n';
const starter = () => placeSpirit(newGame(), 5, 'seedling').state;
describe('Five-night spirit dilemmas', () => {
  it('rewards guard and repair roles without needing old monsters', () => {
    expect(NIGHT_DILEMMAS).toHaveLength(5);
    expect(NIGHT_DECISION_IDS).toEqual(['none','care','profit']);
    const normal = advanceDay(starter()).state;
    const choice = chooseNightDecision(starter(), 'care').state;
    expect(nightDecisionImpact(choice)).toEqual({ coins: 0, satisfaction: 5, helperBonus: 3 });
    const care = advanceDay(choice).state;
    expect(care.coins).toBe(normal.coins);
    expect(care.satisfaction).toBe(normal.satisfaction + 5);
    expect(care.nightDecision).toBe('none');
  });
  it('repeated profit choices lead to delayed inspection', () => {
    let s = starter();
    for (let i = 0; i < 4; i++) {
      s = advanceDay(chooseNightDecision(s, i < 2 ? 'profit' : 'none').state).state;
    }
    expect(s.history[3].eventTitle).toBe('经营稽查');
    expect(s.history[3].event).toBe(-8);
  });
  it('night decision resets and affected forecast is explainable', () => {
    const s = starter();
    const profit = chooseNightDecision(s, 'profit').state;
    expect(dailyEstimate(profit).net).toBe(dailyEstimate(s).net + 5);
    expect(advanceDay(profit).state.nightDecision).toBe('none');
    const invalid = chooseNightDecision(s, 'cheat' as never);
    expect(invalid.state).toBe(s);
  });
  it('decision logs and old-version saves survive', () => {
    const state = chooseNightDecision(starter(), 'profit').state;
    const data = { version: 1 as const, state, locale: 'en' as const,
      tutorialActive: false, tutorialStep: 0 };
    expect(decodeSave(encodeSave(data))?.state.nightDecision).toBe('profit');
    const legacy = JSON.parse(encodeSave(data));
    delete legacy.state.nightDecision;
    expect(decodeSave(JSON.stringify(legacy))?.state.nightDecision).toBe('none');
    const note = advanceDay(state).state.log.find(x => x.includes('夜间抉择'));
    expect(localizeGameText(note ?? '', 'en')).toContain('Night decision Profit');
  });
});
