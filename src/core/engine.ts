/**
 * Monster Apartment V0.2 - pure deterministic simulation.
 * Shared by the Next.js UI and the dependency-free rule tests.
 * No UI/DOM/Phaser/React imports are allowed in this file.
 */

export type TenantId = 'slime' | 'ember' | 'ghost' | 'golem';

export type Tenant = {
  readonly id: TenantId;
  readonly name: string;
  readonly icon: string;
  readonly color: number;
  readonly price: number;
  readonly rent: number;
  readonly description: string;
};

export type RoomSlot = TenantId | null;

export type RoomTraitId = 'damp' | 'sunny' | 'quiet' | 'stone';
export type PolicyId = 'steady' | 'festival' | 'savings';
export const POLICY_IDS: readonly PolicyId[] = ['steady', 'festival', 'savings'];
/** Fixed architectural qualities: room choice and swaps change daily profitability. */
export const ROOM_TRAITS: readonly { id: RoomTraitId; icon: string; preferred: TenantId }[] = [
  { id: 'damp', icon: '💧', preferred: 'slime' },
  { id: 'sunny', icon: '☀', preferred: 'ember' },
  { id: 'quiet', icon: '☾', preferred: 'ghost' },
  { id: 'stone', icon: '◆', preferred: 'golem' },
  { id: 'damp', icon: '💧', preferred: 'slime' },
  { id: 'quiet', icon: '☾', preferred: 'ghost' },
] as const;

export const POLICIES = {
  steady: { coins: 0, satisfaction: 0 },
  festival: { coins: -5, satisfaction: 8 },
  savings: { coins: 6, satisfaction: -6 },
} as const satisfies Record<PolicyId, { coins: number; satisfaction: number }>;

export type PreferenceReport = { coins: number; satisfaction: number; matches: number; mismatches: number };

export function preferenceDetails(rooms: RoomSlot[]): PreferenceReport {
  return rooms.reduce<PreferenceReport>((result, tenant, index) => {
    if (!tenant) return result;
    if (ROOM_TRAITS[index]?.preferred === tenant) {
      return { coins: result.coins + 3, satisfaction: result.satisfaction + 2,
        matches: result.matches + 1, mismatches: result.mismatches };
    }
    return { coins: result.coins - 1, satisfaction: result.satisfaction - 1,
      matches: result.matches, mismatches: result.mismatches + 1 };
  }, { coins: 0, satisfaction: 0, matches: 0, mismatches: 0 });
}


export type DayResult = {
  day: number;
  rent: number;
  upkeep: number;
  synergy: number;
  event: number;
  eventTitle: string;
  eventDetail: string;
  net: number;
  /** Optional to preserve existing v1 browser save history entries. */
  preference?: number;
  preferenceSatisfaction?: number;
  policy?: PolicyId;
  policyCoins?: number;
  policySatisfaction?: number;
};

export type Outcome = 'win' | 'lose';

export type GameState = {
  day: number;
  coins: number;
  satisfaction: number;
  rooms: RoomSlot[];
  policy: PolicyId;
  history: DayResult[];
  over: boolean;
  outcome: Outcome | null;
  notice: string;
  log: string[];
};

export type GameOutcome = { state: GameState; error: string | null };

export type SynergyReport = { coins: number; satisfaction: number; messages: string[] };

export type NightlyEvent = { title: string; detail: string; coins: number; satisfaction: number };

export const TENANTS = {
  slime: { id: 'slime', name: '史莱姆', icon: '●', color: 0x65dfbf, price: 6, rent: 8, description: '清洁房间；能应对水管事故' },
  ember: { id: 'ember', name: '火精灵', icon: '✦', color: 0xffb76d, price: 8, rent: 11, description: '能提供供暖；与幽灵相邻容易争执' },
  ghost: { id: 'ghost', name: '幽灵', icon: '☾', color: 0xb6a8ff, price: 7, rent: 9, description: '能吸引夜间访客；与石像鬼合作守夜' },
  golem: { id: 'golem', name: '石像鬼', icon: '◆', color: 0xa3c4dd, price: 9, rent: 10, description: '能安保；与幽灵相邻有守护加成' }
} as const satisfies Record<TenantId, Tenant>;

export const TENANT_IDS: readonly TenantId[] = Object.keys(TENANTS) as TenantId[];
export const ROOM_COUNT = 6;
export const LAST_DAY = 5;
export const TARGET_COINS = 135;
export const TARGET_SATISFACTION = 55;
export const UPKEEP_PER_ROOM = 3;

export function newGame(): GameState {
  return {
    day: 1,
    coins: 35,
    satisfaction: 70,
    rooms: [null, null, null, null, null, null],
    policy: 'steady',
    history: [],
    over: false,
    outcome: null,
    notice: '欢迎入住！选择一间房，为公寓安排第一位租客。',
    log: ['第 1 天：公寓开张，初始资金 35 金币。']
  };
}

/** Every physically adjacent room pair on the 2x3 floor plan. */
export function adjacency(rooms: RoomSlot[]): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < ROOM_COUNT; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    if (col === 0 && i + 1 < rooms.length) pairs.push([i, i + 1]);
    if (row < 2) pairs.push([i, i + 2]);
  }
  return pairs;
}

export function synergyDetails(rooms: RoomSlot[]): SynergyReport {
  let coins = 0;
  let satisfaction = 0;
  const messages: string[] = [];
  for (const [a, b] of adjacency(rooms)) {
    const one = rooms[a];
    const two = rooms[b];
    if (!one || !two) continue;
    const key = [one, two].sort().join('+');
    if (key === 'ember+slime') { coins += 3; messages.push(`房间 ${a + 1}-${b + 1}：蒸汽供能 +3 租金`); }
    if (key === 'ghost+golem') { coins += 4; messages.push(`房间 ${a + 1}-${b + 1}：夜间守护 +4 租金`); }
    if (key === 'golem+slime') { coins += 2; messages.push(`房间 ${a + 1}-${b + 1}：整洁石像 +2 租金`); }
    if (key === 'ember+ghost') { coins -= 3; satisfaction -= 4; messages.push(`房间 ${a + 1}-${b + 1}：冷热争执 -3 租金，-4 满意度`); }
  }
  return { coins, satisfaction, messages };
}

export function hire(state: GameState, index: number, tenantId: TenantId): GameOutcome {
  if (state.over) return { state, error: '本局已经结束，请开始新游戏。' };
  const tenant = TENANTS[tenantId];
  if (!tenant) return { state, error: '不存在的租客。' };
  if (index < 0 || index >= ROOM_COUNT || !Number.isInteger(index)) return { state, error: '无效房间。' };
  if (state.rooms[index]) return { state, error: '房间已有人。可先搬家或换房。' };
  if (state.coins < tenant.price) return { state, error: '金币不足，无法招募。' };
  const rooms = [...state.rooms];
  rooms[index] = tenantId;
  return {
    state: {
      ...state,
      rooms,
      coins: state.coins - tenant.price,
      notice: `成功入住：${tenant.name}（-${tenant.price} 金币）`,
      log: [...state.log, `第 ${state.day} 天：${tenant.name} 入住 ${index + 1} 号房。`]
    },
    error: null
  };
}

export function moveOrSwap(state: GameState, a: number, b: number): GameOutcome {
  if (state.over) return { state, error: '本局已经结束。' };
  if (![a, b].every((i) => Number.isInteger(i) && i >= 0 && i < ROOM_COUNT)) return { state, error: '无效房间。' };
  if (a === b) return { state, error: '请选择另一间房。' };
  if (!state.rooms[a]) return { state, error: '来源房间没有租客。' };
  const rooms = [...state.rooms];
  [rooms[a], rooms[b]] = [rooms[b], rooms[a]];
  return {
    state: {
      ...state,
      rooms,
      notice: `${a + 1} 号房与 ${b + 1} 号房的租客已调整。`,
      log: [...state.log, `第 ${state.day} 天：调整 ${a + 1} / ${b + 1} 号房。`]
    },
    error: null
  };
}

export function nightlyEvent(rooms: RoomSlot[], day: number, satisfaction: number): NightlyEvent {
  const has = (id: TenantId) => rooms.includes(id);
  const goodPair = adjacency(rooms).some(([a, b]) => [rooms[a], rooms[b]].sort().join('+') === 'ghost+golem');
  switch (day) {
    case 1: return has('golem') ? { title: '夜间巡逻', detail: '石像鬼守夜尽责，收到 6 金币打赏。', coins: 6, satisfaction: 0 } : { title: '夜间巡逻', detail: '夜晚平静，没有额外收入。', coins: 0, satisfaction: 0 };
    case 2: return has('slime') ? { title: '水管爆裂', detail: '史莱姆抢修了管道，获得 4 金币感谢费。', coins: 4, satisfaction: 0 } : { title: '水管爆裂', detail: '管道损坏，支付 8 金币并损失 8 满意度。', coins: -8, satisfaction: -8 };
    case 3: return goodPair ? { title: '古怪访客', detail: '幽灵与石像鬼合作处理访客，收到 12 金币。', coins: 12, satisfaction: 0 } : { title: '古怪访客', detail: '深夜骚动，住户满意度下降 7。', coins: 0, satisfaction: -7 };
    case 4: return has('ember') ? { title: '供暖故障', detail: '火精灵及时修好供暖，获得 7 金币。', coins: 7, satisfaction: 0 } : { title: '供暖故障', detail: '供暖维修消耗 8 金币。', coins: -8, satisfaction: 0 };
    default: return satisfaction >= 65 ? { title: '公寓年度评选', detail: '住户对公寓评价不错！奖励 20 金币。', coins: 20, satisfaction: 0 } : { title: '公寓年度评选', detail: '口碑一般，缴纳 10 金币整改费。', coins: -10, satisfaction: 0 };
  }
}

export function choosePolicy(state: GameState, policy: PolicyId): GameOutcome {
  if (state.over) return { state, error: '本局已经结束。' };
  if (!POLICY_IDS.includes(policy)) return { state, error: '无效经营策略。' };
  return { state: { ...state, policy }, error: null };
}

/** Preview excludes the day-specific surprise event, which is intentionally hidden. */
export function dailyEstimate(state: GameState): {
  rent: number; upkeep: number; synergy: number; preference: number; policy: number; net: number;
} {
  const rent = state.rooms.reduce((sum, id) => sum + (id ? TENANTS[id].rent : 0), 0);
  const upkeep = state.rooms.filter(Boolean).length * UPKEEP_PER_ROOM;
  const synergy = synergyDetails(state.rooms).coins;
  const preference = preferenceDetails(state.rooms).coins;
  const policy = POLICIES[state.policy ?? 'steady'].coins;
  return { rent, upkeep, synergy, preference, policy,
    net: rent - upkeep + synergy + preference + policy };
}

export function advanceDay(state: GameState): GameOutcome {
  if (state.over) return { state, error: '本局已经结束。' };
  if (!state.rooms.some(Boolean)) return { state, error: '请至少招募一位租客，再开始结算。' };
  const estimate = dailyEstimate(state);
  const { rent, upkeep } = estimate;
  const synergy = synergyDetails(state.rooms);
  const preference = preferenceDetails(state.rooms);
  const policyId = state.policy ?? 'steady';
  const policy = POLICIES[policyId];
  const satisfactionBeforeEvent = Math.max(0, Math.min(100,
    state.satisfaction + synergy.satisfaction + preference.satisfaction + policy.satisfaction));
  const event = nightlyEvent(state.rooms, state.day, satisfactionBeforeEvent);
  const net = estimate.net + event.coins;
  const coins = state.coins + net;
  const satisfaction = Math.max(0, Math.min(100, satisfactionBeforeEvent + event.satisfaction));
  const result: DayResult = { day: state.day, rent, upkeep,
    synergy: synergy.coins, preference: preference.coins,
    preferenceSatisfaction: preference.satisfaction,
    policy: policyId, policyCoins: policy.coins, policySatisfaction: policy.satisfaction,
    event: event.coins, eventTitle: event.title, eventDetail: event.detail, net };
  const over = state.day >= LAST_DAY;
  const outcome: Outcome | null = over ? (coins >= TARGET_COINS && satisfaction >= TARGET_SATISFACTION ? 'win' : 'lose') : null;
  const notice = over ? (outcome === 'win' ? '恭喜！你经营出了受欢迎的怪物公寓。' : '五天结束，经营目标未完成。再试一次不同的布局！') : `第 ${state.day} 天结算：${event.title}，净收入 ${net >= 0 ? '+' : ''}${net} 金币。`;
  const eventLog = `第 ${state.day} 天：租金 ${rent}，维护 -${upkeep}，组合 ${synergy.coins >= 0 ? '+' : ''}${synergy.coins}，事件 ${event.coins >= 0 ? '+' : ''}${event.coins}，结余 ${net >= 0 ? '+' : ''}${net}。${event.detail}`;
  const detailLog = `第 ${state.day} 天：房间偏好 ${preference.coins >= 0 ? '+' : ''}${preference.coins} 金币，满意度 ${preference.satisfaction >= 0 ? '+' : ''}${preference.satisfaction}；经营策略 ${policyId}，金币 ${policy.coins >= 0 ? '+' : ''}${policy.coins}，满意度 ${policy.satisfaction >= 0 ? '+' : ''}${policy.satisfaction}。`;
  return {
    state: { ...state, day: over ? LAST_DAY : state.day + 1, coins, satisfaction,
      policy: 'steady', over, outcome, history: [...state.history, result],
      notice, log: [...state.log, detailLog, eventLog] },
    error: null
  };
}
