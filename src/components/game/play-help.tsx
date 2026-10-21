import { Panel } from '@/components/ui/panel';
import { SectionHeading } from '@/components/ui/section-heading';
import { Badge } from '@/components/ui/badge';
import { TENANTS, TENANT_IDS } from '@/core/engine';
import { useGameStore } from '@/store/game-store';
import { t, tenantNames } from '@/lib/i18n';

const intro = ['gameplayIntro1', 'gameplayIntro2', 'gameplayIntro3', 'gameplayIntro4'] as const;
const events = ['event1', 'event2', 'event3', 'event4', 'event5'] as const;

export function PlayHelp() {
  const locale = useGameStore((store) => store.locale);
  return (
    <Panel className="overflow-hidden">
      <SectionHeading title={t(locale, 'howToPlay')} />
      <div className="space-y-4 text-sm text-mist-400 leading-relaxed">
        <div>
          <p className="font-medium text-mist-300 mb-2">{t(locale, 'gameLoop')}</p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            {intro.map((key) => <li key={key}>{t(locale, key)}</li>)}
          </ol>
        </div>
        <div>
          <p className="font-medium text-mist-300 mb-2">{t(locale, 'tenants')}</p>
          <div className="grid grid-cols-2 gap-2">
            {TENANT_IDS.map((id) => {
              const tenant = TENANTS[id];
              return (
                <div key={id} className="flex items-center gap-2 p-2 bg-ink-700 rounded-xl">
                  <span className="text-xl" style={{ color: '#' + tenant.color.toString(16).padStart(6, '0') }}
                    aria-hidden="true">{tenant.icon}</span>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{tenantNames[locale][id]}</p>
                    <p className="text-xs text-mist-500">-{tenant.price} {t(locale, 'coins')} · {t(locale, 'rent')} +{tenant.rent}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <p className="font-medium text-mist-300 mb-2">{t(locale, 'synergies')}</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone="mint">{t(locale, 'synergySteam')}</Badge>
            <Badge tone="mint">{t(locale, 'synergyGuard')}</Badge>
            <Badge tone="mint">{t(locale, 'synergyClean')}</Badge>
            <Badge tone="danger">{t(locale, 'synergyConflict')}</Badge>
          </div>
        </div>
        <div>
          <p className="font-medium text-mist-300 mb-2">{t(locale, 'events')}</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
            {events.map((key) => <li key={key}>{t(locale, key)}</li>)}
          </ul>
        </div>
        <div>
          <p className="font-medium text-mist-300 mb-2">{t(locale, 'moving')}</p>
          <p className="text-xs">{t(locale, 'moveHelp')}</p>
        </div>
      </div>
    </Panel>
  );
}
