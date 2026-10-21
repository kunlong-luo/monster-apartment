'use client';

import { useGameStore } from '@/store/game-store';
import { Panel } from '@/components/ui/panel';
import { SectionHeading } from '@/components/ui/section-heading';
import { MeterRow } from '@/components/ui/meter-row';
import { Badge } from '@/components/ui/badge';
import { synergyDetails } from '@/core/engine';
import { TENANTS } from '@/core/engine';
import { t, localizeGameText } from '@/lib/i18n';

export function ManagementPanel() {
  const { state, locale } = useGameStore();
  const occupied = state.rooms.filter(Boolean).length;
  const synergy = synergyDetails(state.rooms);

  return (
    <Panel>
      <SectionHeading title={t(locale, 'dailyManagement')} />
      <div className="space-y-2 mb-4">
        <MeterRow
          label={t(locale, 'baseRent')}
          value={state.rooms.reduce((sum, id) => sum + (id ? TENANTS[id].rent : 0), 0)}
          tone="positive"
        />
        <MeterRow label={t(locale, 'upkeep')} value={-occupied * 3} tone="negative" />
        <MeterRow
          label={t(locale, 'synergy')}
          value={synergy.coins >= 0 ? `+${synergy.coins}` : synergy.coins}
          tone={synergy.coins >= 0 ? 'positive' : 'negative'}
        />
        <MeterRow
          label={t(locale, 'estimated')}
          value={state.rooms.reduce((sum, id) => sum + (id ? TENANTS[id].rent : 0), 0) - occupied * 3 + synergy.coins}
          tone="default"
        />
      </div>
      {synergy.messages.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-mist-500 text-xs font-medium">{t(locale, 'activeSynergy')}</p>
          <div className="flex flex-wrap gap-1.5">
            {synergy.messages.map((msg, i) => (
              <Badge key={i} tone={msg.includes('-') ? 'danger' : 'mint'}>
                {localizeGameText(msg, locale)}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {synergy.messages.length === 0 && occupied > 0 && (
        <p className="text-mist-500 text-xs">{t(locale, 'noSynergy')}</p>
      )}
      {occupied === 0 && (
        <p className="text-mist-500 text-xs">{t(locale, 'recruitFirst')}</p>
      )}
    </Panel>
  );
}