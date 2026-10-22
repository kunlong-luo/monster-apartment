'use client';

import { useGameStore } from '@/store/game-store';
import { Panel } from '@/components/ui/panel';
import { SectionHeading } from '@/components/ui/section-heading';
import { StatTile } from '@/components/ui/stat-tile';
import { ProgressBar } from '@/components/ui/progress-bar';
import { LAST_DAY, TARGET_COINS, TARGET_SATISFACTION } from '@/core/engine';
import { t } from '@/lib/i18n';

export function EconomyPanel() {
  const { state, locale } = useGameStore();
  const occupied = state.rooms.filter(Boolean).length;

  return (
    <Panel>
      <SectionHeading title={t(locale, 'overview')} meta={`DAY ${state.day}/${LAST_DAY}`} />
      <div className="grid grid-cols-2 gap-2 mb-4">
        <StatTile label={t(locale, 'coins')} value={`◈ ${state.coins}`} tone="gold" />
        <StatTile label={t(locale, 'occupied')} value={`${occupied} / 6`} />
      </div>
      <ProgressBar value={state.coins} max={TARGET_COINS} label={t(locale, 'coinTarget')} />
      <ProgressBar value={state.satisfaction} max={TARGET_SATISFACTION} label={t(locale, 'satisfactionTarget')} />
      <p className="hint text-mist-500 text-xs mt-3 leading-relaxed">
        {t(locale, 'goalPrefix')} {TARGET_COINS} · {t(locale, 'satisfactionPrefix')} {TARGET_SATISFACTION} · {t(locale, 'totalDays')} {LAST_DAY} {locale === 'en' ? 'days' : '天'}
      </p>
    </Panel>
  );
}