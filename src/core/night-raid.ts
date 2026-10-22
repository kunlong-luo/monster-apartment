import { SPIRIT_BY_ID } from './spirit-collection';
import type { CollectionState, SpiritId } from './spirit-collection';

/** A short, deterministic, player-directed 3-lane defense encounter.
 * No real-money randomness. Combat ticks only advance while the encounter is open.
 */
export type Lane = 0 | 1 | 2;
export type Raider = {
  id: number; lane: Lane; distance: number; hp: number; maxHp: number;
  damage: number; kind: 'scout' | 'brute' | 'boss';
};
export type RaidState = {
  phase: 'preparing' | 'fighting' | 'won' | 'lost';
  tick: number; baseHp: number; energy: number;
  lineup: (SpiritId | null)[]; enemies: Raider[];
  kills: number; nextId: number; notice: string;
  /** Incremented only by manual casts; renderers use it for impact VFX. */
  lastSkill?: { lane: Lane; serial: number; role: string };
  /** A readable boss telegraph, not a surprise unavoidable hit. */
  bossWarning?: { lane: Lane; ticksLeft: number } | null;
  lastBreach?: { lane: Lane; serial: number };
  lastBossBlast?: { lane: Lane; serial: number };
};
const RAID_LAST_TICK = 42;
const schedule: readonly { tick: number; lane: Lane; kind: Raider['kind'] }[] = [
  {tick:1,lane:0,kind:'scout'}, {tick:4,lane:1,kind:'scout'},
  {tick:7,lane:2,kind:'scout'}, {tick:10,lane:0,kind:'brute'},
  {tick:13,lane:2,kind:'scout'}, {tick:16,lane:1,kind:'brute'},
  {tick:19,lane:0,kind:'scout'}, {tick:22,lane:2,kind:'brute'},
  {tick:25,lane:1,kind:'scout'}, {tick:28,lane:1,kind:'boss'},
  {tick:30,lane:0,kind:'scout'}, {tick:32,lane:2,kind:'scout'},
];
const power = (id: SpiritId, collection: CollectionState): number => {
  const quality = SPIRIT_BY_ID[id].quality;
  const progress = collection.owned[id];
  const bonus = {N:0,R:1,SR:2,SSR:3,UR:4}[quality];
  return 2 + bonus + Math.floor(((progress?.level ?? 1) - 1) / 6) +
    Math.floor((progress?.stars ?? 0) / 2) + (progress?.evolution ?? 0);
};
export function prepareRaid(collection: CollectionState): RaidState {
  const owned = Object.keys(collection.owned).filter((id): id is SpiritId =>
    id in SPIRIT_BY_ID);
  const deployed = collection.equipped.filter((id): id is SpiritId => !!id);
  const chosen = Array.from(new Set([...deployed, ...owned])).slice(0, 3);
  return {
    phase: 'preparing', tick: 0, baseHp: 8, energy: 5,
    lineup: [chosen[0] ?? null, chosen[1] ?? null, chosen[2] ?? null],
    enemies: [], kills: 0, nextId: 1,
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
  return {...raid, lineup, energy:raid.energy - 2, notice:'防守灵核已转移阵地。'};
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
  const kills = remaining.filter(e => e.hp <= 0).length;
  const sustain = role === 'guard' ? 2 : role === 'repair' ? 3 : 0;
  const refund = role === 'economy' ? 1 : 0;
  const labels: Record<string,string> = {
    guard:'守护屏障', repair:'修缮治疗', economy:'蓄能爆裂', explore:'穿透风暴',
    emergency:'防线炮击',
  };
  return {...raid, enemies:remaining.filter(e => e.hp > 0),
    baseHp: Math.min(14, raid.baseHp + sustain),
    energy:raid.energy - 3 + refund, kills:raid.kills + kills,
    lastSkill: { lane, serial:(raid.lastSkill?.serial ?? 0) + 1, role },
    notice:labels[role] + '！命中 ' + enemies.length + ' 个目标。'};
}
export function advanceRaid(raid: RaidState, collection: CollectionState): RaidState {
  if (raid.phase !== 'fighting') return raid;
  const tick = raid.tick + 1;
  let enemies = raid.enemies.map(e => ({...e}));
  let nextId = raid.nextId;
  for (const wave of schedule) {
    if (wave.tick !== tick) continue;
    const hp = wave.kind === 'boss' ? 27 : wave.kind === 'brute' ? 12 : 7;
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
  const kills = enemies.filter(e => e.hp <= 0).length;
  enemies = enemies.filter(e => e.hp > 0);
  const breached = enemies.filter(e => e.distance <= 1);
  const bossAlive = enemies.some(e => e.kind === 'boss');
  const bossWarning = bossAlive && tick >= 29 && tick <= 31
    ? { lane: 1 as Lane, ticksLeft: 32 - tick } : null;
  const bossBlast = tick === 32 && bossAlive;
  const middleGuard = raid.lineup[1] && SPIRIT_BY_ID[raid.lineup[1]].role === 'guard';
  const blastDamage = bossBlast ? middleGuard ? 1 : 13 : 0;
  const damage = breached.reduce((sum,e)=>sum + e.damage,0) + blastDamage;
  enemies = enemies.filter(e => e.distance > 1).map(e => ({...e,distance:e.distance - 1}));
  const hasRepair = raid.lineup.some(id => id && SPIRIT_BY_ID[id].role === 'repair');
  const recovery = hasRepair && tick % 9 === 0 ? 1 : 0;
  const baseHp = Math.min(14, raid.baseHp - damage + recovery);
  const hasEconomy = raid.lineup.some(id => id && SPIRIT_BY_ID[id].role === 'economy');
  const energy = Math.min(8, raid.energy + (hasEconomy && tick % 3 === 0 ? 2 : 1));
  const phase = baseHp <= 0 ? 'lost'
    : tick >= RAID_LAST_TICK && enemies.length === 0 ? 'won' : 'fighting';
  return { ...raid, tick, nextId, enemies, baseHp:Math.max(0,baseHp), energy,
    kills:raid.kills + kills, phase, bossWarning,
    lastBossBlast: bossBlast ? {lane:1,serial:tick} : raid.lastBossBlast,
    lastBreach: damage > 0 ? {lane:bossBlast ? 1 : breached[0]?.lane ?? 1,serial:tick} : raid.lastBreach,
    notice:
      phase === 'won' ? '防线坚守成功，获得探索奖励！' :
        phase === 'lost' ? '灵核防线失守，可以调整阵容再次挑战。' :
          bossBlast ? (middleGuard ? '守护灵核挡下了首领脉冲！' : '首领脉冲命中核心！') :
            bossWarning ? '中路危险：首领脉冲即将爆发，部署守护灵核！' :
              breached.length ? '有敌人突破了防线！' : raid.notice,
  };
}
export function raidReward(raid: RaidState): {tickets:number;essence:number} | null {
  return raid.phase === 'won' ? {tickets:3,essence:10} : null;
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
