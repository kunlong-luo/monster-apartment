import type { Locale } from './i18n';
import type { PolicyId, RoomTraitId, TenantId } from '@/core/engine';
import { ROOM_TRAITS, POLICIES } from '@/core/engine';

const traits: Record<Locale, Record<RoomTraitId, string>> = {
  zh: { damp: '潮湿房', sunny: '向阳房', quiet: '安静房', stone: '石墙房' },
  en: { damp: 'Damp', sunny: 'Sunny', quiet: 'Quiet', stone: 'Stonewall' },
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
export function tenantPreference(locale: Locale, tenant: TenantId | null, index: number): string {
  if (!tenant) return locale === 'zh' ? '空房：选择合适的住户' : 'Vacant: match a tenant';
  return ROOM_TRAITS[index].preferred === tenant
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
