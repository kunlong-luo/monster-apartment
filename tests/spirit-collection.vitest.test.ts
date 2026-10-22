import { describe, expect, it } from 'vitest';
import { advanceDay, hire, newGame, dailyEstimate } from '../src/core/engine';
import { decodeSave, encodeSave } from '../src/lib/save-game';
import {
  SPIRITS, QUALITY_RATES, newCollection, summon, equipSpirit, companionEffects,
  nightCollectionReward, levelSpirit, evolveSpirit, validCollection,
} from '../src/core/spirit-collection';

describe('Original collectible spirits', () => {
  it('has 18 distinct species, most of them mythic, and five odds totaling 100%', () => {
    expect(SPIRITS.length).toBe(18);
    expect(new Set(SPIRITS.map((spirit) => spirit.id)).size).toBe(18);
    expect(SPIRITS.filter((spirit) => spirit.quality === 'UR')).toHaveLength(8);
    expect(SPIRITS.filter((spirit) => spirit.quality === 'SSR')).toHaveLength(4);
    expect(Object.values(QUALITY_RATES).reduce((sum, rate) => sum + rate, 0)).toBe(100);
    expect(new Set(SPIRITS.map((spirit) => spirit.faction)).size).toBe(4);
  });

  it('summons 10 spirits atomically and gives shards for duplicates', () => {
    const initial = newCollection();
    const result = summon(initial, 10, () => 0);
    expect(result.error).toBeNull();
    expect(result.collection.tickets).toBe(0);
    expect(result.collection.recent).toHaveLength(10);
    expect(result.collection.pity.sr).toBe(0);
    expect(result.collection.owned.seedling?.shards).toBe(180);
    expect(initial.tickets).toBe(10);
    const invalid = summon(result.collection, 1, () => 0);
    expect(invalid.error).not.toBeNull();
    expect(invalid.collection).toBe(result.collection);
  });

  it('guarantees SR at ten, SSR at fifty and UR at one hundred missed draws', () => {
    const withTickets = { ...newCollection(), tickets: 200 };
    let current = withTickets;
    for (let i = 0; i < 9; i++) current = summon(current, 1, () => 0).collection;
    expect(current.pity.sr).toBe(9);
    const ten = summon(current, 1, () => 0);
    expect(SPIRITS.find((s) => s.id === ten.collection.recent[0])?.quality).toBe('SR');
    const fifty = summon({ ...withTickets, pity: { sr: 9, ssr: 49, ur: 10 } }, 1, () => 0);
    expect(SPIRITS.find((s) => s.id === fifty.collection.recent[0])?.quality).toBe('SSR');
    const hundred = summon({ ...withTickets, pity: { sr: 9, ssr: 49, ur: 99 } }, 1, () => 0);
    expect(SPIRITS.find((s) => s.id === hundred.collection.recent[0])?.quality).toBe('UR');
  });

  it('equipping a spirit changes real forecasts and night settlement', () => {
    const state = hire(newGame(), 0, 'slime').state;
    const collection = newCollection();
    const result = equipSpirit(collection, 0, 'seedling', state.rooms);
    expect(result.error).toBeNull();
    const equipped = result.collection;
    expect(companionEffects(state.rooms, equipped).satisfaction).toBe(1);
    expect(dailyEstimate(state, equipped).net).toBe(dailyEstimate(state).net);
    const settled = advanceDay(state, equipped).state;
    expect(settled.history[0].spiritSatisfaction).toBe(1);
    expect(settled.satisfaction).toBe(advanceDay(state).state.satisfaction + 1);
    expect(nightCollectionReward(equipped).tickets).toBe(equipped.tickets + 2);
    expect(nightCollectionReward(equipped).owned.seedling?.xp).toBe(6);
  });

  it('prevents assigning unavailable spirits and duplicate placements', () => {
    const state = hire(hire(newGame(), 0, 'slime').state, 1, 'ember').state;
    const collection = newCollection();
    expect(equipSpirit(collection, 0, 'aurora-whale', state.rooms).error).not.toBeNull();
    const first = equipSpirit(collection, 0, 'seedling', state.rooms).collection;
    expect(equipSpirit(first, 1, 'seedling', state.rooms).error).not.toBeNull();
    expect(equipSpirit(first, 2, 'seedling', state.rooms).error).not.toBeNull();
  });

  it('supports leveling and evolution without random or external currency', () => {
    const initial = newCollection();
    expect(levelSpirit(initial, 'seedling').error).not.toBeNull();
    const prepared = { ...initial, essence: 100, owned: {
      ...initial.owned, seedling: { level: 10, xp: 6, shards: 0, evolution: 0 },
    } };
    expect(evolveSpirit(prepared, 'seedling').collection.owned.seedling?.evolution).toBe(1);
    expect(levelSpirit(prepared, 'seedling').collection.owned.seedling?.level).toBe(11);
  });

  it('migrates an old v1 save without losing the five-night state', () => {
    const game = hire(newGame(), 0, 'slime').state;
    const legacy = { version: 1 as const, state: game, locale: 'zh' as const,
      tutorialActive: false, tutorialStep: 0 };
    const decoded = decodeSave(encodeSave(legacy));
    expect(decoded?.state).toEqual(game);
    expect(decoded?.collection?.owned.seedling?.level).toBe(1);
    const equipped = equipSpirit(decoded!.collection!, 0, 'seedling', game.rooms).collection;
    const persisted = decodeSave(encodeSave({ ...legacy, collection: equipped }));
    expect(persisted?.collection?.equipped[0]).toBe('seedling');
    expect(validCollection(equipped)).toBe(true);
  });

  it('rejects forged collection payloads', () => {
    const legacy = { version: 1, state: newGame(), locale: 'en',
      tutorialActive: false, tutorialStep: 0 };
    const malicious = { ...legacy, collection: { ...newCollection(), tickets: -999 } };
    expect(decodeSave(JSON.stringify(malicious))).toBeNull();
    const unknown = { ...legacy, collection: { ...newCollection(), equipped: ['unknown', null, null, null, null, null] } };
    expect(decodeSave(JSON.stringify(unknown))).toBeNull();
  });
});
