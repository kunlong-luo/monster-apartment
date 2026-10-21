import type { ReactNode } from 'react';
import { cn } from './cn';

type MeterRowProps = {
  label: string;
  value: ReactNode;
  tone?: 'default' | 'positive' | 'negative';
};

const toneStyles = {
  default: 'text-mist-300',
  positive: 'text-mint-300',
  negative: 'text-danger-300',
};

export function MeterRow({ label, value, tone = 'default' }: MeterRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-sm">
      <span className="text-mist-500 truncate">{label}</span>
      <span className={cn('font-mono font-medium whitespace-nowrap', toneStyles[tone])}>{value}</span>
    </div>
  );
}