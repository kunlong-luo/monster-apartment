'use client';

import { useGameStore } from '@/store/game-store';
import { Panel } from '@/components/ui/panel';
import { SectionHeading } from '@/components/ui/section-heading';
import { MeterRow } from '@/components/ui/meter-row';
import { Badge } from '@/components/ui/badge';
import { synergyDetails, preferenceDetails, dailyEstimate, managementForecast } from '@/core/engine';
import { t, localizeGameText } from '@/lib/i18n';

export function ManagementPanel() {
  const { state, locale } = useGameStore();
  const occupied = state.rooms.filter(Boolean).length;
  const synergy = synergyDetails(state.rooms);
  const preference = preferenceDetails(state.rooms);
  const estimate = dailyEstimate(state);
  const forecast = managementForecast(state);

  return (
    <Panel>
      <SectionHeading title={t(locale, 'dailyManagement')} />
      <div className="space-y-2 mb-4">
        <MeterRow
          label={t(locale, 'baseRent')}
          value={estimate.rent}
          tone="positive"
        />
        <MeterRow label={t(locale, 'upkeep')} value={-occupied * 3} tone="negative" />
        <MeterRow
          label={t(locale, 'synergy')}
          value={synergy.coins >= 0 ? `+${synergy.coins}` : synergy.coins}
          tone={synergy.coins >= 0 ? 'positive' : 'negative'}
        />
        <MeterRow
          label={locale === 'zh' ? '房间偏好' : 'Room affinity'}
          value={preference.coins >= 0 ? '+' + preference.coins : preference.coins}
          tone={preference.coins >= 0 ? 'positive' : 'negative'}
        />
        <MeterRow
          label={locale === 'zh' ? '经营策略' : 'Night policy'}
          value={estimate.policy >= 0 ? '+' + estimate.policy : estimate.policy}
          tone={estimate.policy >= 0 ? 'positive' : 'negative'}
        />
        <MeterRow
          label={locale === 'zh' ? '夜间抉择' : 'Night decision'}
          value={estimate.decision >= 0 ? '+' + estimate.decision : estimate.decision}
          tone={estimate.decision >= 0 ? 'positive' : 'negative'}
        />
        <MeterRow label={t(locale, 'estimated')} value={estimate.net} tone="default" />
        <div className="game-balance-forecast" data-testid="balance-forecast">
          <strong>{locale === 'zh' ? '今晚满意度预测' : 'Tonight mood preview'}</strong>
          <span>{state.satisfaction} → {forecast.satisfactionTonight}</span>
          <strong>{locale === 'zh' ? '五夜趋势（不含未知事件）' : 'Five-night trend (no surprise events)'}</strong>
          <span>{locale === 'zh' ? '金币' : 'Coins'} {forecast.coinsAtEnd} / 135 · {locale === 'zh' ? '满意度' : 'Mood'} {forecast.satisfactionAtEnd} / 55</span>
          <small>{locale === 'zh' ? '仅供参考：后续按现有住户和稳健策略计算，未包含未来招募、事件及额外选择。'
            : 'Illustrative only: same tenants and steady policy afterward; excludes recruitment and surprise events.'}</small>
        </div>
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