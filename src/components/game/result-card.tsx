import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { cn } from '@/components/ui/cn';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import { TARGET_COINS, TARGET_SATISFACTION } from '@/core/engine';

type ResultCardProps = {
  outcome: 'win' | 'lose';
  locale: Locale;
  notice: string;
  coins: number;
  satisfaction: number;
  onReset: () => void;
};

export function ResultCard({ outcome, locale, notice, coins, satisfaction, onReset }: ResultCardProps) {
  const score = Math.round(50 * Math.min(1.5, Math.max(0, coins) / TARGET_COINS) +
    50 * Math.min(1.5, Math.max(0, satisfaction) / TARGET_SATISFACTION));
  const grade = outcome === 'win' ? (score >= 125 ? 'S' : score >= 108 ? 'A' : 'B') : (score >= 80 ? 'C' : 'D');
  const gradeLabel = locale === 'zh' ? '经营评级' : 'Management grade';
  const isWin = outcome === 'win';

  return (
    <Panel
      className={cn(
        'text-center',
        isWin && 'border-gold-300/50 bg-gold-200/5',
        !isWin && 'border-danger-300/50 bg-danger-300/5',
      )}
    >
      <div className="text-2xl font-bold mb-2" style={{ color: isWin ? '#f0c98f' : '#ffa8a8' }}>
        {t(locale, isWin ? 'win' : 'lose')}
      </div>
      <div data-testid="final-grade" className="flex items-center justify-center gap-3 mb-2">
        <span className="text-mist-400 text-xs">{gradeLabel}</span>
        <strong className="text-gold-200 text-2xl">{grade}</strong>
        <span className="text-mist-400 text-xs">{score} {locale === 'zh' ? '分' : 'pts'}</span>
      </div>
      <details className="text-left text-xs mb-3">
        <summary className="text-mist-300 cursor-pointer">{locale === 'zh' ? '查看最终目标' : 'Review final goals'}</summary>
        <p className="text-mist-400 mt-2">{locale === 'zh' ? '金币' : 'Coins'} {coins} / {TARGET_COINS} · {locale === 'zh' ? '满意度' : 'Mood'} {satisfaction} / {TARGET_SATISFACTION}</p>
      </details>
      <p className="text-mist-400 text-sm mb-3">{notice}</p>
      <Button variant="primary" size="lg" onClick={onReset}>
        {t(locale, 'playAgain')}
      </Button>
    </Panel>
  );
}