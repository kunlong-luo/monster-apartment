import type { Locale } from './i18n';
import type { PolicyId, RoomTraitId, RoomSlot } from '@/core/engine';
import { ROOM_TRAITS, POLICIES } from '@/core/engine';
import { SPIRIT_BY_ID } from '@/core/spirit-collection';

const traits: Record<Locale, Record<RoomTraitId, string>> = {
  zh: { tide: '潮息房', sun: '焰光房', night: '夜幕房', stone: '晶岩房',
    breeze: '流风房', starlight: '星辉房' },
  en: { tide: 'Tide', sun: 'Flame', night: 'Shadow', stone: 'Stone',
    breeze: 'Wind', starlight: 'Starlight' },
};
const policies: Record<Locale, Record<PolicyId, { name: string; detail: string }>> = {
  zh: {
    steady: { name: '稳健', detail: '金币 0 · 满意度 0' },
    festival: { name: '办派对', detail: '金币 -5 · 满意度 +8' },
    savings: { name: '省开支', detail: '金币 +6 · 满意度 -6' },
  },
  en: {
    steady: { name: 'Steady', detail: '0 coins · 0 mood' },
    festival: { name: 'Party', detail: '-5 coins · +8 mood' },
    savings: { name: 'Save', detail: '+6 coins · -6 mood' },
  },
};
export function traitLabel(locale: Locale, index: number): string {
  return traits[locale][ROOM_TRAITS[index].id];
}
export function tenantPreference(locale: Locale, spirit: RoomSlot, index: number): string {
  if (!spirit) return locale === 'zh' ? '空房：安排灵核入住' : 'Vacant: place a spirit';
  const matched = ROOM_TRAITS[index].preferred === SPIRIT_BY_ID[spirit].element;
  return matched
    ? (locale === 'zh' ? '契合 +3 金币 · +2 满意度/夜' : 'Matched +3 coins · +2 mood/night')
    : (locale === 'zh' ? '不适 -1 金币 · -1 满意度/夜' : 'Mismatched -1 coin · -1 mood/night');
}
export function policyLabel(locale: Locale, id: PolicyId) { return policies[locale][id]; }
export function policySummary(locale: Locale, id: PolicyId): string {
  const { coins, satisfaction } = POLICIES[id];
  const signed = (v: number) => v > 0 ? '+' + v : String(v);
  const name = policies[locale][id].name;
  return locale === 'zh'
    ? name + '：金币 ' + signed(coins) + '，满意度 ' + signed(satisfaction)
    : name + ': ' + signed(coins) + ' coins, ' + signed(satisfaction) + ' mood';
}
