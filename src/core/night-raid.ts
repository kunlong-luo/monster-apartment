import { SPIRIT_BY_ID } from './spirit-collection';
import type { CollectionState, SpiritId } from './spirit-collection';

/** A short, deterministic, player-directed 3-lane defense encounter.
 * No real-money randomness. Combat ticks only advance while the encounter is open.
 */
export type Lane = 0 | 1 | 2;
export type RaidMissionId = 'standard' | 'intercept' | 'boss';
export type RaidCombatReport = {
  breaches: [number, number, number];
  damage: [number, number, number];
  bossDamage: number;
  skillsUsed: number;
  redeploys: number;
  bossDefeated: boolean;
};
const freshReport = (): RaidCombatReport => ({
  breaches: [0,0,0], damage: [0,0,0], bossDamage:0,
  skillsUsed:0, redeploys:0, bossDefeated:false,
});
export const RAID_MISSIONS = {
  standard: {
    zh:'星灯守卫', en:'Lantern Defense',
    detailZh:'42 刻守住核心，提前应对中路首领脉冲。',
    detailEn:'Hold the core through 42 ticks and counter the mid-lane boss pulse.',
    lastTick:42, bossTick:28, rewardTickets:3, rewardEssence:10,
  },
  intercept: {
    zh:'疾速拦截', en:'Rapid Intercept',
    detailZh:'30 刻密集进攻，突破数量不得超过 3。',
    detailEn:'Survive a 30-tick rush with no more than three enemy breaches.',
    lastTick:30, bossTick:18, rewardTickets:4, rewardEssence:12,
  },
  boss: {
    zh:'首领试炼', en:'Boss Trial',
    detailZh:'36 刻迎击强化首领，留意提前到来的中路脉冲。',
    detailEn:'Defeat an empowered boss in 36 ticks. The mid-lane pulse comes early.',
    lastTick:36, bossTick:14, rewardTickets:5, rewardEssence:15,
  },
} as const;
export type Raider = {
  id: number; lane: Lane; distance: number; hp: number; maxHp: number;
  damage: number; kind: 'scout' | 'brute' | 'boss';
};
export type RaidState = {
  phase: 'preparing' | 'fighting' | 'won' | 'lost';
  tick: number; baseHp: number; energy: number;
  lineup: (SpiritId | null)[]; enemies: Raider[];
  kills: number; nextId: number; notice: string;
  mission?: RaidMissionId;
  report?: RaidCombatReport;
  /** Incremented only by manual casts; renderers use it for impact VFX. */
  lastSkill?: { lane: Lane; serial: number; role: string };
  /** A readable boss telegraph, not a surprise unavoidable hit. */
  bossWarning?: { lane: Lane; ticksLeft: number } | null;
  lastBreach?: { lane: Lane; serial: number };
  lastBossBlast?: { lane: Lane; serial: number };
};
const schedule: readonly { tick: number; lane: Lane; kind: Raider['kind'] }[] = [
  {tick:1,lane:0,kind:'scout'}, {tick:4,lane:1,kind:'scout'},
  {tick:7,lane:2,kind:'scout'}, {tick:10,lane:0,kind:'brute'},
  {tick:13,lane:2,kind:'scout'}, {tick:16,lane:1,kind:'brute'},
  {tick:19,lane:0,kind:'scout'}, {tick:22,lane:2,kind:'brute'},
  {tick:25,lane:1,kind:'scout'}, {tick:28,lane:1,kind:'boss'},
  {tick:30,lane:0,kind:'scout'}, {tick:32,lane:2,kind:'scout'},
];
const interceptWaves: typeof schedule = [
  {tick:1,lane:0,kind:'scout'}, {tick:3,lane:1,kind:'scout'},
  {tick:5,lane:2,kind:'scout'}, {tick:7,lane:0,kind:'brute'},
  {tick:9,lane:2,kind:'scout'}, {tick:11,lane:1,kind:'brute'},
  {tick:13,lane:0,kind:'scout'}, {tick:15,lane:2,kind:'brute'},
  {tick:17,lane:1,kind:'scout'}, {tick:18,lane:1,kind:'boss'},
  {tick:20,lane:0,kind:'scout'}, {tick:23,lane:2,kind:'brute'},
  {tick:24,lane:0,kind:'scout'},
];
const bossWaves: typeof schedule = [
  {tick:1,lane:1,kind:'brute'}, {tick:4,lane:0,kind:'scout'},
  {tick:7,lane:2,kind:'scout'}, {tick:10,lane:1,kind:'brute'},
  {tick:14,lane:1,kind:'boss'}, {tick:16,lane:0,kind:'brute'},
  {tick:18,lane:2,kind:'brute'}, {tick:20,lane:1,kind:'scout'},
  {tick:24,lane:0,kind:'brute'}, {tick:26,lane:2,kind:'brute'},
  {tick:28,lane:1,kind:'scout'},
];
const missionWaves = (mission: RaidMissionId) =>
  mission === 'intercept' ? interceptWaves : mission === 'boss' ? bossWaves : schedule;
export type RaidWaveHint = { tick: number; lane: Lane; kind: Raider['kind'] };

/** Predictable intel lets players plan formation and save energy for incoming threats. */
export function upcomingRaidWaves(tick: number, limit = 3, mission: RaidMissionId = 'standard'): RaidWaveHint[] {
  return missionWaves(mission).filter(wave => wave.tick > tick).slice(0, Math.max(0, limit))
    .map(wave => ({ ...wave }));
}

const power = (id: SpiritId, collection: CollectionState): number => {
  const quality = SPIRIT_BY_ID[id].quality;
  const progress = collection.owned[id];
  const bonus = {N:0,R:1,SR:2,SSR:3,UR:4}[quality];
  return 2 + bonus + Math.floor(((progress?.level ?? 1) - 1) / 6) +
    Math.floor((progress?.stars ?? 0) / 2) + (progress?.evolution ?? 0);
};
export function prepareRaid(collection: CollectionState, mission: RaidMissionId = 'standard'): RaidState {
  const owned = Object.keys(collection.owned).filter((id): id is SpiritId =>
    id in SPIRIT_BY_ID);
  const deployed = collection.equipped.filter((id): id is SpiritId => !!id);
  const chosen = Array.from(new Set([...deployed, ...owned])).slice(0, 3);
  return {
    phase: 'preparing', tick: 0, baseHp: 8, energy: 5,
    lineup: [chosen[0] ?? null, chosen[1] ?? null, chosen[2] ?? null],
    enemies: [], kills: 0, nextId: 1, mission, report:freshReport(),
    notice: '配置三路防线后开始迎击。',
  };
}
export function deployToLane(raid: RaidState, lane: Lane, id: SpiritId | null,
  collection: CollectionState): RaidState {
  if (raid.phase !== 'preparing' || (id && !collection.owned[id])) return raid;
  const lineup = [...raid.lineup];
  const previous = id ? lineup.indexOf(id) : -1;
  if (previous !== -1) lineup[previous] = lineup[lane];
  lineup[lane] = id;
  return {...raid, lineup};
}
export function beginRaid(raid: RaidState, collection: CollectionState): RaidState {
  if (raid.phase !== 'preparing' || !raid.lineup.some(id => id && collection.owned[id])) return raid;
  const guardCount = raid.lineup.filter(id => id && SPIRIT_BY_ID[id].role === 'guard').length;
  return {...raid, phase:'fighting', baseHp: 8 + guardCount * 2, notice:'敌人正在接近！选择合适时机释放战技。'};
}
export function relocateRaid(raid: RaidState, from: Lane, to: Lane): RaidState {
  if (raid.phase !== 'fighting' || raid.energy < 2 || from === to || !raid.lineup[from]) return raid;
  const lineup = [...raid.lineup];
  [lineup[from], lineup[to]] = [lineup[to], lineup[from]];
  return {...raid, lineup, energy:raid.energy - 2,
    report: { ...(raid.report ?? freshReport()),
      redeploys:(raid.report?.redeploys ?? 0) + 1 },
    notice:'防守灵核已转移阵地。'};
}
export function castRaidSkill(raid: RaidState, lane: Lane, collection: CollectionState): RaidState {
  if (raid.phase !== 'fighting' || raid.energy < 3) return raid;
  const enemies = raid.enemies.filter(e => e.lane === lane);
  if (!enemies.length) return raid;
  const defender = raid.lineup[lane];
  const role = defender ? SPIRIT_BY_ID[defender].role : 'emergency';
  const damage = defender && collection.owned[defender] ? 5 + Math.floor(power(defender, collection) / 2) : 4;
  const splash = role === 'explore' ? damage + 4 : damage;
  const remaining = raid.enemies.map(e => e.lane === lane ? {...e, hp:e.hp - splash} : e);
  const slain = remaining.filter(e => e.hp <= 0);
  const kills = slain.length;
  const sustain = role === 'guard' ? 2 : role === 'repair' ? 3 : 0;
  const refund = role === 'economy' ? 1 : 0;
  const labels: Record<string,string> = {
    guard:'守护屏障', repair:'修缮治疗', economy:'蓄能爆裂', explore:'穿透风暴',
    emergency:'防线炮击',
  };
  return {...raid, enemies:remaining.filter(e => e.hp > 0),
    baseHp: Math.min(14, raid.baseHp + sustain),
    energy:raid.energy - 3 + refund, kills:raid.kills + kills,
    report: { ...(raid.report ?? freshReport()),
      skillsUsed:(raid.report?.skillsUsed ?? 0) + 1,
      bossDefeated:(raid.report?.bossDefeated ?? false) ||
        slain.some(e => e.kind === 'boss') },
    lastSkill: { lane, serial:(raid.lastSkill?.serial ?? 0) + 1, role },
    notice:labels[role] + '！命中 ' + enemies.length + ' 个目标。'};
}
export function advanceRaid(raid: RaidState, collection: CollectionState): RaidState {
  if (raid.phase !== 'fighting') return raid;
  const tick = raid.tick + 1;
  let enemies = raid.enemies.map(e => ({...e}));
  let nextId = raid.nextId;
  const mission = raid.mission ?? 'standard';
  for (const wave of missionWaves(mission)) {
    if (wave.tick !== tick) continue;
    const hp = wave.kind === 'boss'
      ? (mission === 'boss' ? 40 : 27) : wave.kind === 'brute' ? 12 : 7;
    enemies.push({id:nextId++, lane:wave.lane,
      kind:wave.kind, hp, maxHp:hp, damage:wave.kind === 'boss' ? 3 : 1,
      distance:wave.kind === 'boss' ? 12 : 9});
  }
  for (let lane = 0; lane < 3; lane++) {
    const id = raid.lineup[lane];
    if (!id || !collection.owned[id]) continue;
    const target = enemies.filter(e => e.lane === lane)
      .sort((a,b)=>a.distance - b.distance)[0];
    if (target) target.hp -= power(id, collection);
  }
  const slain = enemies.filter(e => e.hp <= 0);
  const kills = slain.length;
  enemies = enemies.filter(e => e.hp > 0);
  const breached = enemies.filter(e => e.distance <= 1);
  const bossAlive = enemies.some(e => e.kind === 'boss');
  const blastTick = RAID_MISSIONS[mission].bossTick + 4;
  const bossWarning = bossAlive && tick >= blastTick - 3 && tick < blastTick
    ? { lane: 1 as Lane, ticksLeft: blastTick - tick } : null;
  const bossBlast = tick === blastTick && bossAlive;
  const middleGuard = raid.lineup[1] && SPIRIT_BY_ID[raid.lineup[1]].role === 'guard';
  const blastDamage = bossBlast ? middleGuard ? 1 : 13 : 0;
  const damage = breached.reduce((sum,e)=>sum + e.damage,0) + blastDamage;
  enemies = enemies.filter(e => e.distance > 1).map(e => ({...e,distance:e.distance - 1}));
  const hasRepair = raid.lineup.some(id => id && SPIRIT_BY_ID[id].role === 'repair');
  const recovery = hasRepair && tick % 9 === 0 ? 1 : 0;
  const baseHp = Math.min(14, raid.baseHp - damage + recovery);
  const hasEconomy = raid.lineup.some(id => id && SPIRIT_BY_ID[id].role === 'economy');
  const energy = Math.min(8, raid.energy + (hasEconomy && tick % 3 === 0 ? 2 : 1));
  const previous = raid.report ?? freshReport();
  const breaches: RaidCombatReport['breaches'] = [...previous.breaches];
  const laneDamage: RaidCombatReport['damage'] = [...previous.damage];
  for (const enemy of breached) {
    breaches[enemy.lane] += 1;
    laneDamage[enemy.lane] += enemy.damage;
  }
  if (bossBlast) laneDamage[1] += blastDamage;
  const report: RaidCombatReport = {
    ...previous, breaches, damage:laneDamage,
    bossDamage:previous.bossDamage + blastDamage,
    bossDefeated:previous.bossDefeated || slain.some(e => e.kind === 'boss'),
  };
  const totalBreaches = breaches.reduce((sum, value) => sum + value, 0);
  const challengeLost = mission === 'intercept' && totalBreaches > 3;
  const phase = baseHp <= 0 || challengeLost ? 'lost'
    : tick >= RAID_MISSIONS[mission].lastTick && enemies.length === 0 ? 'won' : 'fighting';
  return { ...raid, tick, nextId, enemies, baseHp:Math.max(0,baseHp), energy,
    kills:raid.kills + kills, phase, bossWarning, report,
    lastBossBlast: bossBlast ? {lane:1,serial:tick} : raid.lastBossBlast,
    lastBreach: damage > 0 ? {lane:bossBlast ? 1 : breached[0]?.lane ?? 1,serial:tick} : raid.lastBreach,
    notice:
      phase === 'won' ? '防线坚守成功，获得探索奖励！' :
        phase === 'lost' ? (challengeLost ? '突破数量超过拦截任务上限！' :
          '灵核防线失守，可以调整阵容再次挑战。') :
          bossBlast ? (middleGuard ? '守护灵核挡下了首领脉冲！' : '首领脉冲命中核心！') :
            bossWarning ? '中路危险：首领脉冲即将爆发，部署守护灵核！' :
              breached.length ? '有敌人突破了防线！' : raid.notice,
  };
}
export function raidStars(raid: RaidState): 0 | 1 | 2 | 3 {
  if (raid.phase !== 'won') return 0;
  const mission = raid.mission ?? 'standard';
  const report = raid.report ?? freshReport();
  const breaches = report.breaches.reduce((a,b) => a + b, 0);
  if (mission === 'intercept') {
    if (breaches === 0 && raid.baseHp >= 9) return 3;
    return raid.baseHp >= 7 && breaches <= 1 ? 2 : 1;
  }
  if (mission === 'boss') {
    if (report.bossDamage === 0 && raid.baseHp >= 9) return 3;
    return report.bossDamage <= 1 && raid.baseHp >= 6 ? 2 : 1;
  }
  if (raid.baseHp >= 9 && breaches === 0) return 3;
  return raid.baseHp >= 5 && breaches <= 2 ? 2 : 1;
}
export function raidDebrief(raid: RaidState, locale: 'zh' | 'en') {
  const report = raid.report ?? freshReport();
  const lanes = locale === 'zh' ? ['上路','中路','下路'] : ['upper','middle','lower'];
  const worst = report.damage.indexOf(Math.max(...report.damage));
  const totalBreaches = report.breaches.reduce((a,b) => a + b, 0);
  const mission = raid.mission ?? 'standard';
  const summary = locale === 'zh'
    ? `失守 ${totalBreaches} 次 · 首领伤害 ${report.bossDamage} · 战技 ${report.skillsUsed} 次 · 调防 ${report.redeploys} 次`
    : `${totalBreaches} breaches · Boss damage ${report.bossDamage} · ${report.skillsUsed} skills · ${report.redeploys} shifts`;
  let advice: string;
  if (report.bossDamage >= 4) advice = locale === 'zh'
    ? '中路首领脉冲伤害过高：预警时将守护灵核调到中路，或优先用战技击破首领。'
    : 'Heavy boss pulse: move a guard to the middle lane during the warning or finish the boss with a skill.';
  else if (totalBreaches > 0) advice = locale === 'zh'
    ? `${lanes[worst]}损失最多：调整该路线的灵核，或将范围战技留给接近核心的敌人。`
    : `Most damage came from the ${lanes[worst]} lane: reposition a defender or save an area skill for close threats.`;
  else if (raid.phase === 'lost' && mission === 'intercept') advice = locale === 'zh'
    ? '拦截任务需要限制突破次数：优先保护空缺的路线。'
    : 'Intercept limits breaches: protect weak or vacant lanes first.';
  else if (report.skillsUsed === 0) advice = locale === 'zh'
    ? '本场未释放战技：试着在重装或首领出现时使用 1 / 2 / 3 键。'
    : 'No skills used: try casting with 1 / 2 / 3 when brutes or the boss approach.';
  else advice = locale === 'zh'
    ? '阵容运作稳定。想拿更高星级，可以减少核心受伤和敌军突破。'
    : 'Good formation. Prevent damage and breaches to earn more stars.';
  return {summary, advice, worstLane:worst as Lane, stars:raidStars(raid)};
}
export function raidReward(raid: RaidState): {tickets:number;essence:number} | null {
  if (raid.phase !== 'won') return null;
  const mission = RAID_MISSIONS[raid.mission ?? 'standard'];
  const perfect = raidStars(raid) === 3;
  return {tickets:mission.rewardTickets + (perfect ? 1 : 0),
    essence:mission.rewardEssence + (perfect ? 2 : 0)};
}

/** One successful defense payout per night, independent of React/store state. */
export function applyRaidReward(collection: CollectionState, raid: RaidState, night: number): CollectionState {
  const reward = raidReward(raid);
  if (!reward || !Number.isInteger(night) || night < 1 || night > 5 ||
    collection.claimedRaids?.includes(night)) return collection;
  return {
    ...collection,
    tickets: collection.tickets + reward.tickets,
    essence: collection.essence + reward.essence,
    claimedRaids: [...(collection.claimedRaids ?? []), night],
  };
}
