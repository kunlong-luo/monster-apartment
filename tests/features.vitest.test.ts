import { describe, expect, it } from 'vitest';
import { advanceDay, hire, newGame } from '../src/core/engine';
import { SAVE_KEY, decodeSave, encodeSave } from '../src/lib/save-game';
import { localizeGameText, t } from '../src/lib/i18n';

describe('V0.2.2 browser-save contract', () => {
  it('stores a recruited apartment and restores it unchanged', () => {
    const state = advanceDay(hire(newGame(), 0, 'slime').state).state;
    const serialized = encodeSave({
      version: 1, state, locale: 'en', tutorialActive: false, tutorialStep: 2,
    });
    const restored = decodeSave(serialized);
    expect(restored?.state).toEqual(state);
    expect(restored?.locale).toBe('en');
    expect(SAVE_KEY).toMatch(/monster-apartment/);
  });

  it('rejects missing, corrupt, incompatible or malformed saves', () => {
    expect(decodeSave(null)).toBeNull();
    expect(decodeSave('{ invalid json')).toBeNull();
    expect(decodeSave('{"version":2}')).toBeNull();
    expect(decodeSave(encodeSave({
      version: 1, state: newGame(), locale: 'zh', tutorialActive: true, tutorialStep: 0,
    }))).not.toBeNull();
    const bad = JSON.stringify({
      version: 1, state: { ...newGame(), rooms: ['hacker', null, null, null, null, null] },
      locale: 'zh', tutorialActive: true, tutorialStep: 0,
    });
    expect(decodeSave(bad)).toBeNull();
    expect(decodeSave(JSON.stringify({
      version: 1, state: newGame(), locale: 'unknown', tutorialActive: true, tutorialStep: 0,
    }))).toBeNull();
  });
});

describe('English text', () => {
  it('has accessible labels and translates nighttime event summaries', () => {
    expect(t('en', 'nextDay')).toBe('End day');
    expect(t('zh', 'nextDay')).toBe('结束今天');
    const state = advanceDay(hire(newGame(), 0, 'slime').state).state;
    expect(localizeGameText(state.notice, 'en')).toMatch(/^Day 1:/);
    expect(localizeGameText(state.log.at(-1) ?? '', 'en')).toMatch(/^Day 1: Rent/);
  });
});
