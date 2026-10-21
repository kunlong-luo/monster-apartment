import type { ReactNode } from 'react';
import { cn } from './cn';

type BadgeProps = {
  children: ReactNode;
  tone?: 'mint' | 'gold' | 'neutral' | 'danger';
};

const toneStyles = {
  mint: 'bg-mint-900/50 text-mint-300 border-mint-500/30',
  gold: 'bg-gold-200/10 text-gold-200 border-gold-300/30',
  neutral: 'bg-ink-700 text-mist-400 border-line-strong',
  danger: 'bg-ink-700 text-danger-300 border-danger-300/30',
};

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        toneStyles[tone],
      )}
    >
      {children}
    </span>
  );
}