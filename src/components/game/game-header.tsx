import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

type GameHeaderProps = {
  helpOpen: boolean;
  locale: Locale;
  day: number;
  coins: number;
  onSetLocale: (locale: Locale) => void;
  onToggleHelp: () => void;
  onReset: () => void;
  onReplayTutorial: () => void;
  onOpenPortal: () => void;
};

export function GameHeader({
  helpOpen, locale, day, coins, onSetLocale, onToggleHelp, onReset, onReplayTutorial, onOpenPortal,
}: GameHeaderProps) {
  return (
    <div className="game-header-content flex items-center justify-between gap-3 flex-wrap">
      <div className="game-brand flex items-center gap-3 min-w-0">
        <div className="game-logo" aria-hidden="true">☾</div>
        <div>
          <p className="game-brand-kicker">✦ WELCOME TO THE NIGHT SHIFT</p>
          <h1 className="game-brand-title">{t(locale, 'title')}</h1>
          <small className="block mt-1 text-mist-500 text-[10px] tracking-[.16em] uppercase">
            MONSTER APARTMENT / V0.4.0
          </small>
        </div>
      </div>
      <div className="game-header-tools flex items-center gap-2 flex-wrap justify-end">
        <div className="game-day-chip" aria-label={locale === 'zh' ? '第 ' + day + ' 天' : 'Day ' + day}>
          ☾ {locale === 'zh' ? '第 ' + day + ' 天' : 'DAY ' + day}
        </div>
        <div className="game-day-chip" aria-label={t(locale, 'coins') + ' ' + coins}>
          <span aria-hidden="true">◈</span><span>{coins}</span>
        </div>
        <label className="flex items-center gap-2 text-xs text-mist-400">
          <span>{t(locale, 'language')}</span>
          <select aria-label={t(locale, 'language')} value={locale}
            onChange={(event) => onSetLocale(event.target.value === 'en' ? 'en' : 'zh')}
            className="rounded-xl border border-line-strong bg-ink-700 px-3 py-2 text-mist-300
              focus-visible:outline-2 focus-visible:outline-gold-300">
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </label>
        <div className="game-desktop-actions flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={onOpenPortal} data-testid="open-spirit-portal">✦ {locale === 'zh' ? '召唤 · 图鉴' : 'Summon · Codex'}</Button>
          <Button variant="quiet" size="sm" onClick={onReplayTutorial}>{t(locale, 'guideReplay')}</Button>
          <Button variant="quiet" size="sm" onClick={onToggleHelp} aria-pressed={helpOpen}>
            {t(locale, helpOpen ? 'hideHelp' : 'help')}
          </Button>
          <Button variant="secondary" size="sm" onClick={onReset}>{t(locale, 'reset')}</Button>
        </div>
        <details className="game-mobile-menu">
          <summary aria-label={locale === 'zh' ? '更多设置' : 'More options'}>
            <span aria-hidden="true">⋯</span>
            <span>{locale === 'zh' ? '更多' : 'More'}</span>
          </summary>
          <div className="game-mobile-menu-popover">
            <Button variant="primary" size="sm" onClick={onOpenPortal}>✦ {locale === 'zh' ? '召唤 · 图鉴' : 'Summon · Codex'}</Button>
            <Button variant="quiet" size="sm" onClick={onReplayTutorial}>{t(locale, 'guideReplay')}</Button>
            <Button variant="quiet" size="sm" onClick={onToggleHelp} aria-pressed={helpOpen}>
              {t(locale, helpOpen ? 'hideHelp' : 'help')}
            </Button>
            <Button variant="secondary" size="sm" onClick={onReset}>{t(locale, 'reset')}</Button>
          </div>
        </details>
      </div>
    </div>
  );
}
