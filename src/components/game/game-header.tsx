import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

type GameHeaderProps = {
  helpOpen: boolean;
  locale: Locale;
  onSetLocale: (locale: Locale) => void;
  onToggleHelp: () => void;
  onReset: () => void;
  onReplayTutorial: () => void;
};

export function GameHeader({
  helpOpen, locale, onSetLocale, onToggleHelp, onReset, onReplayTutorial,
}: GameHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className={cn(
          'grid place-items-center rounded-xl',
          'w-11 h-11 bg-ink-700 text-mint-400 text-3xl',
        )} aria-hidden="true">✦</div>
        <div>
          <h1 className="text-xl font-bold tracking-wide m-0">{t(locale, 'title')}</h1>
          <small className="block mt-0.5 text-mist-500 text-[11px] tracking-widest uppercase">
            MONSTER APARTMENT / V0.2.2
          </small>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <label className="flex items-center gap-2 text-xs text-mist-400">
          <span>{t(locale, 'language')}</span>
          <select aria-label={t(locale, 'language')} value={locale}
            onChange={(event) => onSetLocale(event.target.value === 'en' ? 'en' : 'zh')}
            className="rounded-lg border border-line-strong bg-ink-700 px-2 py-2 text-mist-300">
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </label>
        <Button variant="quiet" onClick={onReplayTutorial}>{t(locale, 'guideReplay')}</Button>
        <Button variant="quiet" onClick={onToggleHelp} aria-pressed={helpOpen}>
          {t(locale, helpOpen ? 'hideHelp' : 'help')}
        </Button>
        <Button variant="secondary" onClick={onReset}>{t(locale, 'reset')}</Button>
      </div>
    </div>
  );
}
