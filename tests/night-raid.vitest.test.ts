import { describe, expect, it } from 'vitest';
import { SPIRITS, newCollection } from '../src/core/spirit-collection';
import type { CollectionState, SpiritId } from '../src/core/spirit-collection';
import {
  advanceRaid, applyRaidReward, beginRaid, castRaidSkill, deployToLane, prepareRaid,
  raidReward, relocateRaid, upcomingRaidWaves,
} from '../src/core/night-raid';

const withSpirits = (...ids: SpiritId[]): CollectionState => {
  const collection = newCollection();
  const owned = { ...collection.owned };
  for (const id of ids) owned[id] = { level:1, xp:0, shards:0, evolution:0 };
  return { ...collection, owned, equipped:[null,null,null,null,null,null] };
};

describe('Real-time tactical defense', () => {
  it('forecasts exact upcoming lanes and warns about the boss before arrival', () => {
    expect(upcomingRaidWaves(0)).toEqual([
      {tick:1,lane:0,kind:'scout'},
      {tick:4,lane:1,kind:'scout'},
      {tick:7,lane:2,kind:'scout'},
    ]);
    expect(upcomingRaidWaves(27,2)).toEqual([
      {tick:28,lane:1,kind:'boss'},
      {tick:30,lane:0,kind:'scout'},
    ]);
    expect(upcomingRaidWaves(42)).toEqual([]);
    expect(upcomingRaidWaves(1,0)).toEqual([]);
  });
  it('supplies a playable first battle with three distinct starting roles', () => {
    const collection = newCollection();
    const raid = prepareRaid(collection);
    expect(raid.lineup).toEqual(['seedling', 'dewdrop', 'lantern-beetle']);
    expect(beginRaid(raid, collection).phase).toBe('fighting');
  });

  it('provides a real three-lane strategy with only owned units', () => {
    const collection = withSpirits('aurora-whale', 'day-smith');
    let raid = prepareRaid(collection);
    expect(raid.phase).toBe('preparing');
    expect(raid.lineup).toHaveLength(3);
    expect(deployToLane(raid, 0, 'eclipse-moth', collection)).toBe(raid);
    raid = deployToLane(raid, 0, 'aurora-whale', collection);
    raid = deployToLane(raid, 1, 'day-smith', collection);
    raid = deployToLane(raid, 2, null, collection);
    expect(raid.lineup[0]).toBe('aurora-whale');
    expect(raid.lineup[1]).toBe('day-smith');
    expect(new Set(raid.lineup.filter(Boolean)).size).toBe(2);
    expect(beginRaid(raid, collection).phase).toBe('fighting');
  });

  it('enemies move independently of clicks, letting wrong formations lose', () => {
    const collection = newCollection();
    let raid = prepareRaid(collection);
    raid = deployToLane(raid, 1, null, collection);
    raid = deployToLane(raid, 2, null, collection);
    raid = beginRaid(raid, collection);
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

  it('awards an encounter only once each night and preserves older inventories', () => {
    const collection = newCollection();
    const victory = { ...prepareRaid(collection), phase:'won' as const };
    const paid = applyRaidReward(collection, victory, 1);
    expect(paid.tickets).toBe(13);
    expect(paid.essence).toBe(10);
    expect(paid.claimedRaids).toEqual([1]);
    expect(applyRaidReward(paid, victory, 1)).toBe(paid);
    const secondNight = applyRaidReward(paid, victory, 2);
    expect(secondNight.tickets).toBe(16);
    expect(applyRaidReward(secondNight, victory, 6)).toBe(secondNight);
    expect(applyRaidReward(collection, { ...victory, phase:'lost' }, 1)).toBe(collection);
    expect(collection.tickets).toBe(10);
  });

  it('telegraphs a boss pulse for three ticks and guards meaningfully reduce the hit', () => {
    const collection = withSpirits('aurora-whale');
    const enemy = { id: 99, lane: 1 as const, kind: 'boss' as const,
      hp: 200, maxHp: 200, distance: 12, damage: 3 };
    const empty = { ...beginRaid(prepareRaid(collection), collection),
      lineup: ['seedling', null, null] as (SpiritId | null)[],
      tick: 28, baseHp: 12, nextId: 100, enemies: [enemy] };
    const alert = advanceRaid(empty, collection);
    expect(alert.bossWarning).toEqual({ lane:1, ticksLeft:3 });
    const two = advanceRaid(alert, collection);
    expect(two.bossWarning?.ticksLeft).toBe(2);
    const one = advanceRaid(two, collection);
    expect(one.bossWarning?.ticksLeft).toBe(1);
    const blast = advanceRaid(one, collection);
    expect(blast.bossWarning).toBeNull();
    expect(blast.lastBossBlast).toEqual({lane:1, serial:32});
    expect(blast.baseHp).toBe(0);

    const guarded = { ...empty,
      lineup:[null, 'aurora-whale', null] as (SpiritId | null)[] };
    let defense: ReturnType<typeof beginRaid> = guarded;
    for (let step=0; step<4; step++) defense = advanceRaid(defense, collection);
    expect(defense.baseHp).toBe(11);
    expect(defense.notice).toContain('守护灵核挡下');
  });

  it('makes timing matter: starter trio fails unattended but can interrupt the boss', () => {
    const collection = newCollection();
    let idle = beginRaid(prepareRaid(collection), collection);
    let proactive = idle;
    while (idle.phase === 'fighting' && idle.tick < 50) idle = advanceRaid(idle, collection);
    while (proactive.phase === 'fighting' && proactive.tick < 50) {
      proactive = advanceRaid(proactive, collection);
      if (proactive.tick === 29 && proactive.phase === 'fighting')
        proactive = castRaidSkill(proactive, 1, collection);
    }
    expect(idle.phase).toBe('lost');
    expect(proactive.phase).toBe('won');
    expect(proactive.lastSkill?.role).toBe('repair');
  });

  it('uses different tactical skills for each profession, not generic damage', () => {
    const collection = withSpirits('aurora-whale', 'mirror-koi', 'cinder-stag', 'eclipse-moth');
    const scout = { id:23, lane:0 as const, kind:'brute' as const,
      hp:45, maxHp:45, damage:1, distance:5 };
    const castBy = (id: SpiritId) => {
      const base = beginRaid(prepareRaid(collection), collection);
      return castRaidSkill({ ...base, energy:5, baseHp:3,
        lineup:[id,null,null], enemies:[scout] }, 0, collection);
    };
    const guard = castBy('aurora-whale');
    const repair = castBy('mirror-koi');
    const economy = castBy('cinder-stag');
    const explorer = castBy('eclipse-moth');
    expect(guard.baseHp).toBe(5);
    expect(repair.baseHp).toBe(6);
    expect(explorer.enemies[0].hp).toBeLessThan(guard.enemies[0].hp);
    expect(economy.energy).toBe(3);
    expect(guard.energy).toBe(2);
    expect(guard.lastSkill?.role).toBe('guard');
    expect(repair.lastSkill?.role).toBe('repair');
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
