import { describe, expect, it } from 'vitest';
import {
  awakenSpirit, companionEffects, evolveSpirit, newCollection, validCollection,
} from '../src/core/spirit-collection';
import type { SpiritId, CollectionState, SpiritProgress } from '../src/core/spirit-collection';
import { decodeSave } from '../src/lib/save-game';
import { newGame } from '../src/core/engine';

const entry = (overrides: Partial<SpiritProgress> = {}): SpiritProgress =>
  ({ level: 1, xp: 0, shards: 0, evolution: 0, ...overrides });

const formation = (...ids: SpiritId[]): CollectionState => {
  const owned = Object.fromEntries(ids.map(id => [id, entry()])) as CollectionState['owned'];
  return { ...newCollection(), owned, equipped: [...ids, ...Array(6 - ids.length).fill(null)] };
};

describe('Five-star awakening from duplicate fragments', () => {
  it('spends progressively more shards and affects actual nightly mood', () => {
    const base = newCollection();
    const source = { ...base, owned: { ...base.owned, seedling: entry({ shards: 100 }) },
      equipped: ['seedling', null, null, null, null, null] as CollectionState['equipped'] };
    expect(companionEffects(source.equipped, source).satisfaction).toBe(1);
    const first = awakenSpirit(source, 'seedling');
    expect(first.error).toBeNull();
    expect(first.collection.owned.seedling).toMatchObject({ stars: 1, shards: 80 });
    expect(companionEffects(source.equipped, first.collection).satisfaction).toBe(2);
    const second = awakenSpirit(first.collection, 'seedling');
    expect(second.collection.owned.seedling).toMatchObject({ stars: 2, shards: 40 });
    expect(first.collection.owned.seedling?.stars).toBe(1);
    const third = awakenSpirit(second.collection, 'seedling');
    expect(third.error).not.toBeNull();
    expect(third.collection).toBe(second.collection);
  });
  it('improves coins for economy spirits and caps at five stars', () => {
    const base = formation('day-smith');
    base.owned['day-smith'] = entry({ stars: 5, shards: 1000 });
    expect(companionEffects(base.equipped, base).coins).toBe(15);
    const result = awakenSpirit(base, 'day-smith');
    expect(result.error).toMatch(/五星/);
    expect(result.collection).toBe(base);
  });
  it('rejects unowned characters and invalid progression payloads', () => {
    expect(awakenSpirit(newCollection(), 'aurora-whale').error).not.toBeNull();
    const invalid = { ...newCollection(), owned: { seedling: entry({ stars: 6 }) } };
    expect(validCollection(invalid)).toBe(false);
  });
});

describe('Branch evolution for mythic spirits', () => {
  const mythic = () => {
    const base = formation('aurora-whale');
    base.owned['aurora-whale'] = entry({ level: 20, evolution: 1 });
    return { ...base, essence: 100 };
  };
  it('requires an explicit choice, without charging essence on an invalid request', () => {
    const base = mythic();
    const result = evolveSpirit(base, 'aurora-whale');
    expect(result.error).toMatch(/选择/);
    expect(result.collection).toBe(base);
  });
  it('offers two mechanically distinct terminal branches', () => {
    const base = mythic();
    const prosperity = evolveSpirit(base, 'aurora-whale', 'prosperity').collection;
    const harmony = evolveSpirit(base, 'aurora-whale', 'harmony').collection;
    expect(prosperity.owned['aurora-whale']).toMatchObject({ evolution: 2, path: 'prosperity' });
    expect(harmony.owned['aurora-whale']).toMatchObject({ evolution: 2, path: 'harmony' });
    expect(prosperity.essence).toBe(60);
    expect(harmony.essence).toBe(60);
    expect(companionEffects(base.equipped, prosperity).coins -
      companionEffects(base.equipped, harmony).coins).toBe(6);
    expect(companionEffects(base.equipped, harmony).satisfaction -
      companionEffects(base.equipped, prosperity).satisfaction).toBe(5);
    expect(validCollection(prosperity)).toBe(true);
    expect(validCollection(harmony)).toBe(true);
  });
  it('keeps the legacy single-path evolution for legendary heroes', () => {
    const base = formation('wave-healer');
    base.owned['wave-healer'] = entry({ level: 20, evolution: 1 });
    const ready = { ...base, essence: 100 };
    const result = evolveSpirit(ready, 'wave-healer');
    expect(result.error).toBeNull();
    expect(result.collection.owned['wave-healer']?.evolution).toBe(2);
    expect(result.collection.owned['wave-healer']?.path).toBeUndefined();
  });
});

describe('Four legends have meaningful distinct niches', () => {
  it('the wave healer thrives alongside other water spirits', () => {
    const team = formation('wave-healer', 'dewdrop', 'mirror-koi');
    expect(companionEffects(team.equipped, team).satisfaction).toBe(12);
  });
  it('daysmith scales with fellow starforge allies', () => {
    const team = formation('day-smith', 'cinder-stag', 'prism-mole');
    expect(companionEffects(team.equipped, team).coins).toBe(22);
  });
  it('duskbell trades resident mood for coins only with veil partners', () => {
    const solo = formation('dusk-bell');
    const duo = formation('dusk-bell', 'eclipse-moth');
    expect(companionEffects(duo.equipped, duo).coins).toBe(18);
    expect(companionEffects(duo.equipped, duo).satisfaction).toBe(-5);
    expect(companionEffects(solo.equipped, solo).coins).toBe(5);
  });
  it('mosskeeper rewards mixed-faction formations', () => {
    const team = formation('moss-keeper', 'wave-healer', 'day-smith');
    expect(companionEffects(team.equipped, team).satisfaction).toBe(8);
  });
});

describe('Existing saves still decode', () => {
  it('accepts old progress without optional stars or branch', () => {
    const collection = newCollection();
    const raw = JSON.stringify({
      version: 1, state: newGame(), locale: 'zh',
      tutorialActive: false, tutorialStep: 0, collection,
    });
    const saved = decodeSave(raw);
    expect(saved?.collection?.owned.seedling?.stars).toBeUndefined();
    expect(validCollection(saved?.collection)).toBe(true);
  });
  it('roundtrips awakened and branched spirits', () => {
    const collection = mythicCollection();
    const raw = JSON.stringify({
      version: 1, state: newGame(), locale: 'zh',
      tutorialActive: false, tutorialStep: 0, collection,
    });
    const saved = decodeSave(raw);
    expect(saved?.collection?.owned['aurora-whale']).toMatchObject({
      stars: 2, path: 'harmony', evolution: 2,
    });
  });
});

function mythicCollection(): CollectionState {
  const original = newCollection();
  return { ...original, owned: {
    ...original.owned,
    'aurora-whale': entry({ level: 20, evolution: 2, stars: 2, path: 'harmony' }),
  } };
}
