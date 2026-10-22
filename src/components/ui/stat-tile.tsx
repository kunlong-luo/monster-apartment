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
        'game-stats-tile',
        tone === 'gold' && 'border-gold-300/60',
      )}
    >
      <small className="block text-mist-400 text-xs">{label}</small>
      <strong className={cn('block mt-1 text-2xl font-extrabold tracking-tight tabular-nums', tone === 'gold' && 'text-gold-200')}>
        {value}
      </strong>
    </div>
  );
}