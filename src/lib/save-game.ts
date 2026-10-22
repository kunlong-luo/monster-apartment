import { POLICY_IDS, NIGHT_DECISION_IDS } from '../core/engine';
import type { GameState, DayResult } from '@/core/engine';
import { SPIRITS, isSpiritId, newCollection, validCollection } from '../core/spirit-collection';
import type { SpiritId, CollectionState } from '../core/spirit-collection';
import type { Locale } from './i18n';

export const SAVE_KEY = 'monster-apartment:save:v1';
export type SaveData = {
  version: 1;
  state: GameState;
  locale: Locale;
  tutorialActive: boolean;
  tutorialStep: number;
  collection?: CollectionState;
};
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const integer = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
const amount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 10000000;
const smallText = (value: unknown): value is string => typeof value === 'string' && value.length <= 2000;

function validDayResult(value: unknown): value is DayResult {
  if (!record(value)) return false;
  return integer(value.day, 1, 5) && amount(value.rent) && amount(value.upkeep) &&
    amount(value.synergy) && amount(value.event) && amount(value.net) &&
    smallText(value.eventTitle) && smallText(value.eventDetail) &&
    (value.preference === undefined || amount(value.preference)) &&
    (value.preferenceSatisfaction === undefined || amount(value.preferenceSatisfaction)) &&
    (value.policy === undefined || POLICY_IDS.includes(value.policy as typeof POLICY_IDS[number])) &&
    (value.policyCoins === undefined || amount(value.policyCoins)) &&
    (value.policySatisfaction === undefined || amount(value.policySatisfaction)) &&
    (value.nightDecision === undefined || NIGHT_DECISION_IDS.includes(value.nightDecision as typeof NIGHT_DECISION_IDS[number])) &&
    (value.decisionCoins === undefined || amount(value.decisionCoins)) &&
    (value.decisionSatisfaction === undefined || amount(value.decisionSatisfaction)) &&
    (value.spiritCoins === undefined || amount(value.spiritCoins)) &&
    (value.spiritSatisfaction === undefined || amount(value.spiritSatisfaction));
}

export function validGameState(value: unknown): value is GameState {
  if (!record(value)) return false;
  const { rooms, history, log } = value;
  if (!Array.isArray(rooms) || rooms.length !== 6 ||
    !rooms.every(id => id === null || isSpiritId(id))) return false;
  if (new Set(rooms.filter(Boolean)).size !== rooms.filter(Boolean).length) return false;
  if (!Array.isArray(history) || history.length > 5 || !history.every(validDayResult)) return false;
  if (!Array.isArray(log) || log.length > 120 || !log.every(smallText)) return false;
  if (!integer(value.day, 1, 5) || !amount(value.coins) || !integer(value.satisfaction, 0, 100)) return false;
  if (value.policy !== undefined && !POLICY_IDS.includes(value.policy as typeof POLICY_IDS[number])) return false;
  if (value.nightDecision !== undefined && !NIGHT_DECISION_IDS.includes(value.nightDecision as typeof NIGHT_DECISION_IDS[number])) return false;
  if (typeof value.over !== 'boolean') return false;
  if (value.outcome !== null && value.outcome !== 'win' && value.outcome !== 'lose') return false;
  if (!smallText(value.notice)) return false;
  if (value.over && (value.day !== 5 || value.outcome === null)) return false;
  if (!value.over && value.outcome !== null) return false;
  return value.day === Math.min(5, history.length + 1);
}

const previousSpecies = {
  slime: ['pebble-crab', 'dewdrop', 'mirror-koi'],
  ember: ['lantern-beetle', 'day-smith', 'cinder-stag'],
  ghost: ['moon-scout', 'dusk-bell', 'eclipse-moth'],
  golem: ['root-crown', 'prism-mole', 'moss-keeper'],
} as const;
function migrateRoom(value: unknown, used: Set<SpiritId>): SpiritId | null | undefined {
  if (value === null) return null;
  const options: readonly string[] | undefined =
    typeof value === 'string' && Object.hasOwn(previousSpecies, value)
      ? previousSpecies[value as keyof typeof previousSpecies] : undefined;
  if (!options && !isSpiritId(value)) return undefined;
  const candidates = options ?? [value as SpiritId];
  const chosen = candidates.find((id) => isSpiritId(id) && !used.has(id));
  if (!chosen && !options) return undefined;
  const id = (chosen ?? SPIRITS.find((item) => !used.has(item.id))?.id) as SpiritId | undefined;
  if (!id) return undefined;
  used.add(id);
  return id;
}
function rewriteLegacyText(value: string): string {
  return value
    .replaceAll('史莱姆', '卵石蟹').replaceAll('火精灵', '灯甲虫')
    .replaceAll('幽灵', '月影雀').replaceAll('石像鬼', '根冠兽')
    .replaceAll('怪物公寓', '灵核公寓');
}
function migrateState(value: unknown, collection: CollectionState): GameState | null {
  if (!record(value) || !Array.isArray(value.rooms) || value.rooms.length !== 6) return null;
  const used = new Set<SpiritId>();
  const rooms = value.rooms.map((slot, index) => {
    const equipped = collection.equipped[index];
    const candidate = equipped && collection.owned[equipped] && slot !== null ? equipped : slot;
    return migrateRoom(candidate, used);
  });
  if (rooms.some(id => id === undefined)) return null;
  const state = {
    ...value, rooms, policy: value.policy ?? 'steady', nightDecision: value.nightDecision ?? 'none',
    notice: typeof value.notice === 'string' ? rewriteLegacyText(value.notice) : value.notice,
    log: Array.isArray(value.log) ? value.log.map(v => typeof v === 'string' ? rewriteLegacyText(v) : v) : value.log,
    history: Array.isArray(value.history) ? value.history.map(v => record(v) ? {
      ...v,
      eventTitle: typeof v.eventTitle === 'string' ? rewriteLegacyText(v.eventTitle) : v.eventTitle,
      eventDetail: typeof v.eventDetail === 'string' ? rewriteLegacyText(v.eventDetail) : v.eventDetail,
    } : v) : value.history,
  };
  return validGameState(state) ? state : null;
}

export function decodeSave(value: string | null): SaveData | null {
  if (!value || value.length > 150000) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!record(parsed) || parsed.version !== 1) return null;
    if (parsed.locale !== 'zh' && parsed.locale !== 'en') return null;
    if (typeof parsed.tutorialActive !== 'boolean' || !integer(parsed.tutorialStep, 0, 3)) return null;
    if (parsed.collection !== undefined && !validCollection(parsed.collection)) return null;
    const initial = parsed.collection ?? newCollection();
    const collection: CollectionState = {
      ...initial,
      owned: { ...initial.owned },
      equipped: [...initial.equipped],
    };
    const state = migrateState(parsed.state, collection);
    if (!state) return null;
    for (const id of state.rooms) {
      if (id && !collection.owned[id]) collection.owned[id] =
        { level: 1, xp: 0, shards: 0, evolution: 0 };
    }
    collection.equipped = [...state.rooms];
    if (!validCollection(collection)) return null;
    return { version: 1, state, collection,
      locale: parsed.locale, tutorialActive: parsed.tutorialActive,
      tutorialStep: parsed.tutorialStep };
  } catch {
    return null;
  }
}
export function encodeSave(data: SaveData): string { return JSON.stringify(data); }
