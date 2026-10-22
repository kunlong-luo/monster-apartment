import { describe, expect, it } from 'vitest';
import { newCollection } from '../src/core/spirit-collection';
import {
  RAID_MISSIONS, advanceRaid, applyRaidReward, beginRaid, prepareRaid,
  raidDebrief, raidReward, raidStars, upcomingRaidWaves,
} from '../src/core/night-raid';
import type { RaidState, RaidCombatReport } from '../src/core/night-raid';

const report = (overrides: Partial<RaidCombatReport> = {}): RaidCombatReport => ({
  breaches:[0,0,0], damage:[0,0,0],
  bossDamage:0, skillsUsed:0, redeploys:0, bossDefeated:true, ...overrides,
});

describe('Three genuinely different tactical missions', () => {
  it('offers distinct duration, wave composition and free-game rewards', () => {
    expect(Object.keys(RAID_MISSIONS)).toEqual(['standard','intercept','boss']);
    expect(RAID_MISSIONS.standard.lastTick).toBe(42);
    expect(RAID_MISSIONS.intercept.lastTick).toBe(30);
    expect(RAID_MISSIONS.boss.lastTick).toBe(36);
    expect(upcomingRaidWaves(0,3,'intercept')).toEqual([
      {tick:1,lane:0,kind:'scout'},
      {tick:3,lane:1,kind:'scout'},
      {tick:5,lane:2,kind:'scout'},
    ]);
    expect(upcomingRaidWaves(13,3,'boss')).toContainEqual({tick:14,lane:1,kind:'boss'});
    const choice = prepareRaid(newCollection(),'boss');
    expect(choice.mission).toBe('boss');
    expect(choice.report?.damage).toEqual([0,0,0]);
  });

  it('keeps legacy standard rewards while granting a higher risk/reward choice', () => {
    const collection = newCollection();
    const standard = {...prepareRaid(collection), phase:'won' as const, baseHp:8};
    expect(raidStars(standard)).toBe(2);
    expect(raidReward(standard)).toEqual({tickets:3,essence:10});
    const rush = {...prepareRaid(collection,'intercept'), phase:'won' as const, baseHp:9};
    expect(raidStars(rush)).toBe(3);
    expect(raidReward(rush)).toEqual({tickets:5,essence:14});
    const boss = {...prepareRaid(collection,'boss'), phase:'won' as const, baseHp:6,
      report:report({bossDamage:1})};
    expect(raidStars(boss)).toBe(2);
    expect(raidReward(boss)).toEqual({tickets:5,essence:15});
    const awarded = applyRaidReward(collection,rush,1);
    expect(awarded.tickets).toBe(15);
    expect(applyRaidReward(awarded,boss,1)).toBe(awarded);
  });

  it('loses the intercept objective after a fourth breach even if core still survives', () => {
    const collection = newCollection();
    const initial = beginRaid(prepareRaid(collection,'intercept'),collection);
    const threatened: RaidState = {...initial, tick:5, baseHp:12,
      lineup:[null,null,null], report:report({breaches:[3,0,0]}),
      enemies:[{id:100,lane:0,distance:1,hp:15,maxHp:15,damage:1,kind:'brute'}],
      nextId:101};
    const next = advanceRaid(threatened,collection);
    expect(next.phase).toBe('lost');
    expect(next.baseHp).toBeGreaterThan(0);
    expect(next.report?.breaches).toEqual([4,0,0]);
    expect(next.report?.damage).toEqual([1,0,0]);
    expect(raidStars(next)).toBe(0);
    expect(raidReward(next)).toBeNull();
  });

  it('records a boss pulse and reports a concrete mitigation recommendation', () => {
    const collection = newCollection();
    const starting = beginRaid(prepareRaid(collection,'boss'),collection);
    let combat: RaidState = {...starting, tick:14, baseHp:14, nextId:100,
      lineup:[null,null,null],
      enemies:[{id:99,lane:1,distance:12,hp:200,maxHp:200,damage:3,kind:'boss'}]};
    for(let n=0;n<4;n++) combat = advanceRaid(combat,collection);
    expect(combat.lastBossBlast?.serial).toBe(18);
    expect(combat.report?.bossDamage).toBe(13);
    expect(combat.report?.damage[1]).toBe(13);
    const recap=raidDebrief(combat,'zh');
    expect(recap.worstLane).toBe(1);
    expect(recap.summary).toContain('首领伤害 13');
    expect(recap.advice).toContain('中路');
    expect(raidDebrief(combat,'en').advice).toContain('middle lane');
  });

  it('correctly summarizes broken upper-lane defense and counts active decisions', () => {
    const raid: RaidState = {...prepareRaid(newCollection(),'standard'),
      phase:'lost', tick:13, baseHp:0,
      report:report({breaches:[2,0,1],damage:[4,0,1],skillsUsed:1,redeploys:2})};
    const recap = raidDebrief(raid,'zh');
    expect(recap.summary).toContain('失守 3 次');
    expect(recap.summary).toContain('战技 1 次');
    expect(recap.advice).toContain('上路');
  });
});
