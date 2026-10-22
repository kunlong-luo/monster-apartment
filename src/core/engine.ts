/** Pure, framework-free rules for Spirit Core Residence. */
import { companionEffects, isSpiritId, SPIRIT_BY_ID } from './spirit-collection.ts';
import type { CollectionState, Element, SpiritId, SpiritRole } from './spirit-collection.ts';

export type RoomSlot = SpiritId | null;
export type RoomTraitId = 'tide' | 'sun' | 'night' | 'stone' | 'breeze' | 'starlight';
export type PolicyId = 'steady' | 'festival' | 'savings';
export type NightDecisionId = 'none' | 'care' | 'profit';
export const NIGHT_DECISION_IDS: readonly NightDecisionId[] = ['none', 'care', 'profit'];
export const POLICY_IDS: readonly PolicyId[] = ['steady', 'festival', 'savings'];

export const NIGHT_DILEMMAS: readonly {
  helper: SpiritRole; care: { coins: number; satisfaction: number; helperBonus: number };
  profit: { coins: number; satisfaction: number };
}[] = [
  { helper: 'guard', care: { coins: -3, satisfaction: 5, helperBonus: 3 }, profit: { coins: 5, satisfaction: -4 } },
  { helper: 'repair', care: { coins: -5, satisfaction: 7, helperBonus: 5 }, profit: { coins: 6, satisfaction: -6 } },
  { helper: 'explore', care: { coins: -4, satisfaction: 6, helperBonus: 4 }, profit: { coins: 7, satisfaction: -6 } },
  { helper: 'economy', care: { coins: -5, satisfaction: 8, helperBonus: 4 }, profit: { coins: 6, satisfaction: -5 } },
  { helper: 'guard', care: { coins: -8, satisfaction: 10, helperBonus: 4 }, profit: { coins: 9, satisfaction: -8 } },
];

export const ROOM_TRAITS: readonly { id: RoomTraitId; icon: string; preferred: Element }[] = [
  { id: 'tide', icon: '≈', preferred: 'water' },
  { id: 'sun', icon: '☀', preferred: 'fire' },
  { id: 'night', icon: '☾', preferred: 'shadow' },
  { id: 'stone', icon: '◆', preferred: 'stone' },
  { id: 'breeze', icon: '❧', preferred: 'wind' },
  { id: 'starlight', icon: '✦', preferred: 'light' },
];
export const POLICIES = {
  steady: { coins: 0, satisfaction: 0 },
  festival: { coins: -5, satisfaction: 8 },
  savings: { coins: 6, satisfaction: -6 },
} as const satisfies Record<PolicyId, { coins: number; satisfaction: number }>;

export type PreferenceReport = { coins: number; satisfaction: number; matches: number; mismatches: number };
export type SynergyReport = { coins: number; satisfaction: number; messages: string[] };
export type NightlyEvent = { title: string; detail: string; coins: number; satisfaction: number };
export type DayResult = {
  day: number; rent: number; upkeep: number; synergy: number;
  event: number; eventTitle: string; eventDetail: string; net: number;
  preference?: number; preferenceSatisfaction?: number;
  policy?: PolicyId; policyCoins?: number; policySatisfaction?: number;
  nightDecision?: NightDecisionId; decisionCoins?: number; decisionSatisfaction?: number;
  spiritCoins?: number; spiritSatisfaction?: number;
};
export type Outcome = 'win' | 'lose';
export type GameState = {
  day: number; coins: number; satisfaction: number;
  rooms: RoomSlot[]; policy: PolicyId; nightDecision?: NightDecisionId;
  history: DayResult[]; over: boolean; outcome: Outcome | null;
  notice: string; log: string[];
};
export type GameOutcome = { state: GameState; error: string | null };

export const ROOM_COUNT = 6;
export const LAST_DAY = 5;
export const TARGET_COINS = 135;
export const TARGET_SATISFACTION = 55;
export const UPKEEP_PER_ROOM = 3;
const clampMood = (value: number) => Math.max(0, Math.min(100, value));
const sign = (value: number) => value >= 0 ? '+' + value : String(value);

export function newGame(): GameState {
  return {
    day: 1, coins: 35, satisfaction: 70,
    rooms: [null, null, null, null, null, null],
    policy: 'steady', nightDecision: 'none', history: [],
    over: false, outcome: null,
    notice: '欢迎来到灵核公寓！召唤原创灵核，再将它安排进房间。',
    log: ['第 1 天：灵核公寓开张，初始资金 35 金币。'],
  };
}

export function adjacency(rooms: readonly RoomSlot[]): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < ROOM_COUNT; i++) {
    if (i % 2 === 0 && i + 1 < rooms.length) pairs.push([i, i + 1]);
    if (i < 4) pairs.push([i, i + 2]);
  }
  return pairs;
}

export function preferenceDetails(rooms: readonly RoomSlot[]): PreferenceReport {
  return rooms.reduce<PreferenceReport>((total, id, index) => {
    if (!id) return total;
    const match = ROOM_TRAITS[index].preferred === SPIRIT_BY_ID[id].element;
    return {
      coins: total.coins + (match ? 3 : -1),
      satisfaction: total.satisfaction + (match ? 2 : -1),
      matches: total.matches + (match ? 1 : 0),
      mismatches: total.mismatches + (match ? 0 : 1),
    };
  }, { coins: 0, satisfaction: 0, matches: 0, mismatches: 0 });
}

export function synergyDetails(rooms: readonly RoomSlot[]): SynergyReport {
  let coins = 0;
  let satisfaction = 0;
  const messages: string[] = [];
  for (const [a, b] of adjacency(rooms)) {
    const first = rooms[a] ? SPIRIT_BY_ID[rooms[a]!] : null;
    const second = rooms[b] ? SPIRIT_BY_ID[rooms[b]!] : null;
    if (!first || !second) continue;
    const label = '房间 ' + (a + 1) + '-' + (b + 1) + '：';
    if (first.faction === second.faction) {
      coins += 4;
      satisfaction += 1;
      messages.push(label + '阵营共鸣 +4 金币、+1 满意度');
    } else if ([first.element, second.element].sort().join('+') === 'fire+water') {
      coins -= 2;
      satisfaction -= 2;
      messages.push(label + '属性干扰 -2 金币、-2 满意度');
    } else if ([first.element, second.element].sort().join('+') === 'stone+water') {
      coins += 2;
      messages.push(label + '生态协作 +2 金币');
    }
  }
  return { coins, satisfaction, messages };
}

/** Place only owned spirits. The store checks ownership and syncs the collection's formation. */
export function placeSpirit(state: GameState, index: number, id: SpiritId): GameOutcome {
  if (state.over) return { state, error: '本局已经结束。' };
  if (!Number.isInteger(index) || index < 0 || index >= ROOM_COUNT) return { state, error: '无效房间。' };
  if (!isSpiritId(id)) return { state, error: '灵核不存在。' };
  if (state.rooms.some((current, i) => current === id && i !== index)) {
    return { state, error: '同一种灵核已经在其他房间。' };
  }
  const rooms = [...state.rooms];
  rooms[index] = id;
  return {
    state: { ...state, rooms, notice: SPIRIT_BY_ID[id].zh + ' 入住 ' + (index + 1) + ' 号房。',
      log: [...state.log, '第 ' + state.day + ' 天：' + SPIRIT_BY_ID[id].zh + ' 入住 ' + (index + 1) + ' 号房。'] },
    error: null,
  };
}

export function removeSpirit(state: GameState, index: number): GameOutcome {
  if (state.over) return { state, error: '本局已经结束。' };
  if (!Number.isInteger(index) || index < 0 || index >= ROOM_COUNT) return { state, error: '无效房间。' };
  const rooms = [...state.rooms];
  rooms[index] = null;
  return { state: { ...state, rooms, notice: (index + 1) + ' 号房已空出。' }, error: null };
}

export function moveOrSwap(state: GameState, a: number, b: number): GameOutcome {
  if (state.over) return { state, error: '本局已经结束。' };
  if (![a, b].every(i => Number.isInteger(i) && i >= 0 && i < ROOM_COUNT))
    return { state, error: '无效房间。' };
  if (a === b) return { state, error: '请选择另一间房。' };
  if (!state.rooms[a]) return { state, error: '来源房间没有灵核。' };
  const rooms = [...state.rooms];
  [rooms[a], rooms[b]] = [rooms[b], rooms[a]];
  return { state: { ...state, rooms, notice: '已调整 ' + (a + 1) + ' / ' + (b + 1) + ' 号房。',
    log: [...state.log, '第 ' + state.day + ' 天：调整 ' + (a + 1) + ' / ' + (b + 1) + ' 号房。'] }, error: null };
}

export function nightDecisionImpact(state: Pick<GameState, 'day' | 'rooms' | 'nightDecision'>) {
  const dilemma = NIGHT_DILEMMAS[state.day - 1];
  if (!dilemma || !state.nightDecision || state.nightDecision === 'none')
    return { coins: 0, satisfaction: 0, helperBonus: 0 };
  if (state.nightDecision === 'profit') return { ...dilemma.profit, helperBonus: 0 };
  const helperBonus = state.rooms.some(id => id && SPIRIT_BY_ID[id].role === dilemma.helper)
    ? dilemma.care.helperBonus : 0;
  return { coins: dilemma.care.coins + helperBonus, satisfaction: dilemma.care.satisfaction, helperBonus };
}

export function nightlyEvent(rooms: readonly RoomSlot[], day: number, satisfaction: number, history: readonly DayResult[] = []): NightlyEvent {
  const hasElement = (element: Element) => rooms.some(id => id && SPIRIT_BY_ID[id].element === element);
  const hasRole = (role: SpiritRole) => rooms.some(id => id && SPIRIT_BY_ID[id].role === role);
  const care = history.filter(entry => entry.nightDecision === 'care').length;
  const profit = history.filter(entry => entry.nightDecision === 'profit').length;
  switch (day) {
    case 1: return hasRole('guard')
      ? { title: '星灯巡夜', detail: '守护型灵核安抚了夜间访客，获得 6 金币。', coins: 6, satisfaction: 0 }
      : { title: '星灯巡夜', detail: '第一夜平静度过。', coins: 0, satisfaction: 0 };
    case 2: return hasElement('water') || hasRole('repair')
      ? { title: '潮汐泄漏', detail: '潮属性或修缮灵核修复了能量管路，获得 4 金币。', coins: 4, satisfaction: 0 }
      : { title: '潮汐泄漏', detail: '能量管路受损，损失 8 金币与 8 满意度。', coins: -8, satisfaction: -8 };
    case 3: if (care >= 2) return { title: '灵核互助', detail: '此前的关怀带来协作，满意度 +5。', coins: 0, satisfaction: 5 };
      return hasRole('explore')
        ? { title: '星轨访客', detail: '探索型灵核引导旅人，获得 12 金币。', coins: 12, satisfaction: 0 }
        : { title: '星轨访客', detail: '迷路的访客引发混乱，满意度 -7。', coins: 0, satisfaction: -7 };
    case 4: if (profit >= 2) return { title: '经营稽查', detail: '前几夜的逐利引发稽查，损失 8 金币与 5 满意度。', coins: -8, satisfaction: -5 };
      return hasElement('fire') || hasRole('economy')
        ? { title: '恒炉停摆', detail: '焰属性或经营型灵核恢复能源，获得 7 金币。', coins: 7, satisfaction: 0 }
        : { title: '恒炉停摆', detail: '设备维修耗费 8 金币。', coins: -8, satisfaction: 0 };
    default: return satisfaction >= 65
      ? { title: '星域评选', detail: '公寓凭借良好口碑获得 20 金币。', coins: 20, satisfaction: 0 }
      : { title: '星域评选', detail: '口碑欠佳，缴纳 10 金币整改费。', coins: -10, satisfaction: 0 };
  }
}

export function choosePolicy(state: GameState, policy: PolicyId): GameOutcome {
  if (state.over) return { state, error: '本局已经结束。' };
  if (!POLICY_IDS.includes(policy)) return { state, error: '无效经营策略。' };
  return { state: { ...state, policy }, error: null };
}
export function chooseNightDecision(state: GameState, decision: NightDecisionId): GameOutcome {
  if (state.over) return { state, error: '本局已经结束。' };
  if (!NIGHT_DECISION_IDS.includes(decision)) return { state, error: '无效夜间选择。' };
  return { state: { ...state, nightDecision: decision }, error: null };
}

export function dailyEstimate(state: GameState, collection?: CollectionState) {
  const rent = state.rooms.reduce((sum, id) => {
    if (!id) return sum;
    const grade = SPIRIT_BY_ID[id].quality;
    return sum + ({ N: 8, R: 10, SR: 12, SSR: 14, UR: 16 } as const)[grade];
  }, 0);
  const upkeep = state.rooms.filter(Boolean).length * UPKEEP_PER_ROOM;
  const synergy = synergyDetails(state.rooms).coins;
  const preference = preferenceDetails(state.rooms).coins;
  const policy = POLICIES[state.policy ?? 'steady'].coins;
  const decision = nightDecisionImpact(state).coins;
  const spirit = companionEffects(state.rooms, collection).coins;
  return { rent, upkeep, synergy, preference, policy, decision, spirit,
    net: rent - upkeep + synergy + preference + policy + decision + spirit };
}

export function managementForecast(state: GameState, collection?: CollectionState) {
  const synergy = synergyDetails(state.rooms);
  const preference = preferenceDetails(state.rooms);
  const policy = POLICIES[state.policy ?? 'steady'];
  const decision = nightDecisionImpact(state);
  const companion = companionEffects(state.rooms, collection);
  const mood = synergy.satisfaction + preference.satisfaction +
    policy.satisfaction + decision.satisfaction + companion.satisfaction;
  const passiveNet = dailyEstimate({ ...state, policy: 'steady', nightDecision: 'none' }, collection).net;
  const passiveMood = synergy.satisfaction + preference.satisfaction + companion.satisfaction;
  const remainingNights = Math.max(0, LAST_DAY - state.history.length);
  return {
    coinsTonight: state.coins + dailyEstimate(state, collection).net,
    satisfactionTonight: clampMood(state.satisfaction + mood),
    coinsAtEnd: state.coins + dailyEstimate(state, collection).net +
      Math.max(0, remainingNights - 1) * passiveNet,
    satisfactionAtEnd: clampMood(state.satisfaction + mood +
      Math.max(0, remainingNights - 1) * passiveMood),
    remainingNights,
  };
}

export function advanceDay(state: GameState, collection?: CollectionState): GameOutcome {
  if (state.over) return { state, error: '本局已经结束。' };
  if (!state.rooms.some(Boolean)) return { state, error: '请至少安排一只灵核入住，再开始结算。' };
  const estimate = dailyEstimate(state, collection);
  const synergy = synergyDetails(state.rooms);
  const preference = preferenceDetails(state.rooms);
  const policyId = state.policy ?? 'steady';
  const policy = POLICIES[policyId];
  const choice = nightDecisionImpact(state);
  const companions = companionEffects(state.rooms, collection);
  const moodBeforeEvent = clampMood(state.satisfaction + synergy.satisfaction +
    preference.satisfaction + policy.satisfaction + choice.satisfaction + companions.satisfaction);
  const event = nightlyEvent(state.rooms, state.day, moodBeforeEvent, state.history);
  const net = estimate.net + event.coins;
  const coins = state.coins + net;
  const satisfaction = clampMood(moodBeforeEvent + event.satisfaction);
  const result: DayResult = {
    day: state.day, rent: estimate.rent, upkeep: estimate.upkeep,
    synergy: synergy.coins, event: event.coins, eventTitle: event.title,
    eventDetail: event.detail, net, preference: preference.coins,
    preferenceSatisfaction: preference.satisfaction, policy: policyId,
    policyCoins: policy.coins, policySatisfaction: policy.satisfaction,
    nightDecision: state.nightDecision ?? 'none', decisionCoins: choice.coins,
    decisionSatisfaction: choice.satisfaction,
    spiritCoins: companions.coins, spiritSatisfaction: companions.satisfaction,
  };
  const over = state.day >= LAST_DAY;
  const outcome: Outcome | null = over
    ? (coins >= TARGET_COINS && satisfaction >= TARGET_SATISFACTION ? 'win' : 'lose') : null;
  const notice = over
    ? outcome === 'win' ? '经营成功！灵核公寓已成为星域热门住所。' : '五夜结束，尚未达成经营目标。'
    : '第 ' + state.day + ' 天结算：' + event.title + '，净收入 ' + sign(net) + ' 金币。';
  const ledger = '第 ' + state.day + ' 天：收益 ' + estimate.rent + '，维护 -' +
    estimate.upkeep + '，组合 ' + sign(synergy.coins) + '，事件 ' +
    sign(event.coins) + '，结余 ' + sign(net) + '。' + event.detail;
  const detail = '第 ' + state.day + ' 天：房间偏好 ' + sign(preference.coins) +
    ' 金币，满意度 ' + sign(preference.satisfaction) + '；经营策略 ' + policyId +
    '，金币 ' + sign(policy.coins) + '，满意度 ' + sign(policy.satisfaction) + '。';
  const decisions = state.nightDecision && state.nightDecision !== 'none'
    ? ['第 ' + state.day + ' 天：夜间抉择 ' + state.nightDecision +
      '，金币 ' + sign(choice.coins) + '，满意度 ' + sign(choice.satisfaction) + '。'] : [];
  return {
    state: { ...state, day: over ? LAST_DAY : state.day + 1, coins, satisfaction,
      policy: 'steady', nightDecision: 'none', over, outcome,
      history: [...state.history, result],
      notice, log: [...state.log, detail, ...decisions, ledger] }, error: null,
  };
}
