import type { ReactNode } from 'react';
import { cn } from './cn';

type StatTileProps = {
  label: string;
  value: ReactNode;
  tone?: 'default' | 'gold';
};

export function StatTile({ label, value, tone = 'default' }: StatTileProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        'bg-ink-700 border-line-strong',
        tone === 'gold' && 'border-gold-300/30',
      )}
    >
      <small className="block text-mist-400 text-xs">{label}</small>
      <strong className={cn('block mt-1.5 text-2xl font-bold', tone === 'gold' && 'text-gold-200')}>
        {value}
      </strong>
    </div>
  );
}