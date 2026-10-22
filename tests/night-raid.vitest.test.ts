import { describe, expect, it } from 'vitest';
import { SPIRITS, newCollection } from '../src/core/spirit-collection';
import type { CollectionState, SpiritId } from '../src/core/spirit-collection';
import {
  advanceRaid, beginRaid, castRaidSkill, deployToLane, prepareRaid,
  raidReward, relocateRaid,
} from '../src/core/night-raid';

const withSpirits = (...ids: SpiritId[]): CollectionState => {
  const collection = newCollection();
  const owned = { ...collection.owned };
  for (const id of ids) owned[id] = { level:1, xp:0, shards:0, evolution:0 };
  return { ...collection, owned, equipped:[null,null,null,null,null,null] };
};

describe('Real-time tactical defense', () => {
  it('provides a real three-lane strategy with only owned units', () => {
    const collection = withSpirits('aurora-whale', 'day-smith');
    let raid = prepareRaid(collection);
    expect(raid.phase).toBe('preparing');
    expect(raid.lineup).toHaveLength(3);
    expect(deployToLane(raid, 0, 'eclipse-moth', collection)).toBe(raid);
    raid = deployToLane(raid, 0, 'aurora-whale', collection);
    raid = deployToLane(raid, 1, 'day-smith', collection);
    expect(raid.lineup[0]).toBe('aurora-whale');
    expect(raid.lineup[1]).toBe('day-smith');
    expect(new Set(raid.lineup.filter(Boolean)).size).toBe(2);
    expect(beginRaid(raid, collection).phase).toBe('fighting');
  });

  it('enemies move independently of clicks, letting wrong formations lose', () => {
    const collection = newCollection();
    let raid = beginRaid(prepareRaid(collection), collection);
    for (let n=0; n<42 && raid.phase==='fighting'; n++) raid = advanceRaid(raid, collection);
    expect(raid.phase).toBe('lost');
    expect(raid.baseHp).toBe(0);
    expect(raidReward(raid)).toBeNull();
  });

  it('a well-balanced trained lineup can win without mandatory manual clicks', () => {
    const collection = withSpirits('aurora-whale', 'cinder-stag', 'dusk-bell');
    for (const id of ['aurora-whale', 'cinder-stag', 'dusk-bell'] as SpiritId[]) {
      collection.owned[id] = {level:20, xp:0, shards:0, evolution:1};
    }
    let raid = prepareRaid(collection);
    raid = deployToLane(raid, 0, 'aurora-whale', collection);
    raid = deployToLane(raid, 1, 'cinder-stag', collection);
    raid = deployToLane(raid, 2, 'dusk-bell', collection);
    raid = beginRaid(raid, collection);
    while (raid.phase === 'fighting' && raid.tick < 50) raid = advanceRaid(raid, collection);
    expect(raid.phase).toBe('won');
    expect(raidReward(raid)).toEqual({tickets:3,essence:10});
  });

  it('timed skills stop attackers but require energy and valid threats', () => {
    const collection = newCollection();
    let raid = beginRaid(prepareRaid(collection), collection);
    expect(castRaidSkill(raid, 0, collection)).toBe(raid);
    raid = advanceRaid(raid, collection);
    expect(raid.enemies).toHaveLength(1);
    const energy = raid.energy;
    raid = castRaidSkill(raid, 0, collection);
    expect(raid.enemies).toHaveLength(0);
    expect(raid.kills).toBe(1);
    expect(raid.energy).toBe(energy - 3);
    const same = castRaidSkill(raid, 0, collection);
    expect(same).toBe(raid);
  });

  it('shifting defenders mid-battle costs energy and changes threats answered', () => {
    const collection = withSpirits('dewdrop', 'day-smith');
    let raid = prepareRaid(collection);
    raid = deployToLane(raid, 0, 'day-smith', collection);
    raid = deployToLane(raid, 1, 'dewdrop', collection);
    raid = deployToLane(raid, 2, null, collection);
    raid = beginRaid(raid, collection);
    const old = raid.energy;
    const switched = relocateRaid(raid, 0, 2);
    expect(switched.energy).toBe(old - 2);
    expect(switched.lineup[2]).toBe('day-smith');
    expect(switched.lineup[0]).toBeNull();
    expect(raid.lineup[0]).toBe('day-smith');
    expect(relocateRaid(switched, 0, 1)).toBe(switched);
  });

  it('every spirit has valid stats for the action prototype', () => {
    const collection = withSpirits(...SPIRITS.map(s => s.id));
    const raid = prepareRaid(collection);
    expect(raid.lineup.filter(Boolean)).toHaveLength(3);
    for (let i=0; i<5; i++) {
      expect(advanceRaid(raid, collection)).toBe(raid);
    }
  });
});
