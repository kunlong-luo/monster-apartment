import { POLICY_IDS } from '@/core/engine';
import type { GameState, DayResult, RoomSlot } from '@/core/engine';
import type { Locale } from './i18n';

export const SAVE_KEY = 'monster-apartment:save:v1';
export type SaveData = {
  version: 1;
  state: GameState;
  locale: Locale;
  tutorialActive: boolean;
  tutorialStep: number;
};

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function integer(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

function amount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 10000000;
}

function smallText(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 2000;
}

function validDayResult(value: unknown): value is DayResult {
  if (!record(value)) return false;
  return integer(value.day, 1, 5) &&
    amount(value.rent) && amount(value.upkeep) && amount(value.synergy) &&
    amount(value.event) && amount(value.net) &&
    smallText(value.eventTitle) && smallText(value.eventDetail) &&
    (value.preference === undefined || amount(value.preference)) &&
    (value.preferenceSatisfaction === undefined || amount(value.preferenceSatisfaction)) &&
    (value.policy === undefined || POLICY_IDS.includes(value.policy as typeof POLICY_IDS[number])) &&
    (value.policyCoins === undefined || amount(value.policyCoins)) &&
    (value.policySatisfaction === undefined || amount(value.policySatisfaction));
}

export function validGameState(value: unknown): value is GameState {
  if (!record(value)) return false;
  const rooms = value.rooms;
  const history = value.history;
  const logs = value.log;
  const allowed: Array<RoomSlot> = [null, 'slime', 'ember', 'ghost', 'golem'];
  if (!Array.isArray(rooms) || rooms.length !== 6 || !rooms.every((room) => allowed.includes(room))) return false;
  if (!Array.isArray(history) || history.length > 5 || !history.every(validDayResult)) return false;
  if (!Array.isArray(logs) || logs.length > 120 || !logs.every(smallText)) return false;
  if (!integer(value.day, 1, 5) || !amount(value.coins) || !integer(value.satisfaction, 0, 100)) return false;
  if (value.policy !== undefined && !POLICY_IDS.includes(value.policy as typeof POLICY_IDS[number])) return false;
  if (typeof value.over !== 'boolean') return false;
  if (value.outcome !== null && value.outcome !== 'win' && value.outcome !== 'lose') return false;
  if (!smallText(value.notice)) return false;
  if (value.over && (value.day !== 5 || value.outcome === null)) return false;
  if (!value.over && value.outcome !== null) return false;
  if (value.day !== Math.min(5, history.length + 1)) return false;
  return true;
}

export function decodeSave(value: string | null): SaveData | null {
  if (!value || value.length > 150000) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!record(parsed)) return null;
    if (parsed.version !== 1 || !validGameState(parsed.state)) return null;
    if (parsed.locale !== 'zh' && parsed.locale !== 'en') return null;
    if (typeof parsed.tutorialActive !== 'boolean' || !integer(parsed.tutorialStep, 0, 3)) return null;
    // Older v1 saves had no policy. Restore them without dropping progress.
    const state = { ...parsed.state, policy: parsed.state.policy ?? 'steady' };
    return { version: 1, state, locale: parsed.locale, tutorialActive: parsed.tutorialActive, tutorialStep: parsed.tutorialStep };
  } catch {
    return null;
  }
}

export function encodeSave(data: SaveData): string {
  return JSON.stringify(data);
}
