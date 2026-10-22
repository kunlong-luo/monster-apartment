import { describe, expect, it } from 'vitest';
import { newGame, placeSpirit, advanceDay } from '../src/core/engine';
import { SAVE_KEY, decodeSave, encodeSave } from '../src/lib/save-game';
import { newCollection } from '../src/core/spirit-collection';
import { localizeGameText, t } from '../src/lib/i18n';
const snapshot = (state = newGame()) => ({
  version: 1 as const, state, collection: newCollection(), locale: 'en' as const,
  tutorialActive: false, tutorialStep: 2,
});
describe('V0.5 browser-save contract', () => {
  it('restores deployed spirits and five-night progress', () => {
    const state = advanceDay(placeSpirit(newGame(), 0, 'seedling').state).state;
    const decoded = decodeSave(encodeSave(snapshot(state)));
    expect(decoded?.state).toEqual(state);
    expect(decoded?.collection?.equipped[0]).toBe('seedling');
    expect(decoded?.locale).toBe('en');
    expect(SAVE_KEY).toMatch(/monster-apartment/);
  });
  it('safely migrates rooms from the previous four-creature save format', () => {
    const old = { ...newGame(), rooms: ['slime','slime','ember','ghost','golem',null] };
    const restored = decodeSave(encodeSave(snapshot(old as never)));
    expect(restored?.state.rooms.filter(Boolean)).toHaveLength(5);
    expect(new Set(restored?.state.rooms.filter(Boolean)).size).toBe(5);
    expect(restored?.state.rooms.every(id => id === null || restored.collection?.owned[id])).toBe(true);
  });
  it('rejects invalid saves', () => {
    expect(decodeSave(null)).toBeNull();
    expect(decodeSave('{ broken')).toBeNull();
    expect(decodeSave(JSON.stringify({ ...snapshot(), version: 2 }))).toBeNull();
    const bad = snapshot({ ...newGame(), rooms: ['hacker',null,null,null,null,null] } as never);
    expect(decodeSave(encodeSave(bad))).toBeNull();
  });
  it('localizes new spirit game events', () => {
    expect(t('en', 'nextDay')).toBe('End day');
    expect(t('zh', 'nextDay')).toBe('结束今天');
    const result = advanceDay(placeSpirit(newGame(), 0, 'seedling').state).state;
    expect(localizeGameText(result.notice, 'en')).toMatch(/^Day 1:/);
    expect(localizeGameText(result.log.at(-1) ?? '', 'en')).toMatch(/^Day 1: Revenue/);
  });
});
