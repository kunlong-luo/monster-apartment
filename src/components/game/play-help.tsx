import { Panel } from '@/components/ui/panel';
import { SectionHeading } from '@/components/ui/section-heading';
import { Badge } from '@/components/ui/badge';
import { SPIRITS, FACTION_LABELS } from '@/core/spirit-collection';
import { useGameStore } from '@/store/game-store';
import { t } from '@/lib/i18n';

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
            {SPIRITS.filter((s) => s.quality === 'SSR').map((spirit) => (
              <div key={spirit.id} className="flex items-center gap-2 p-2 bg-ink-700 rounded-xl">
                <span className="text-xl text-gold-200" aria-hidden="true">{spirit.icon}</span>
                <div className="min-w-0">
                  <p className="font-medium truncate">{spirit[locale]}</p>
                  <p className="text-xs text-mist-500">{spirit.quality} · {FACTION_LABELS[spirit.faction][locale]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="font-medium text-mist-300 mb-2">{t(locale, 'synergies')}</p>
          <Badge tone="mint">{locale === 'zh' ? '同阵营相邻 +4 金币、+1 满意度' : 'Adjacent allies: +4 coins, +1 mood'}</Badge>
          <Badge tone="mint">{locale === 'zh' ? '相同阵营达到 2/4/6 可触发共鸣' : 'Faction 2/4/6 formation bonuses'}</Badge>
        </div>
        <div>
          <p className="font-medium text-mist-300 mb-2">{t(locale, 'events')}</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
            {events.map((key) => <li key={key}>{t(locale, key)}</li>)}
          </ul>
        </div>
        <div><p className="font-medium text-mist-300 mb-2">{t(locale, 'moving')}</p>
          <p className="text-xs">{t(locale, 'moveHelp')}</p></div>
      </div>
    </Panel>
  );
}
