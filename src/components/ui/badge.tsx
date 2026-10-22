import type { ReactNode } from 'react';
import { cn } from './cn';

type BadgeProps = {
  children: ReactNode;
  tone?: 'mint' | 'gold' | 'neutral' | 'danger';
};

const toneStyles = {
  mint: 'bg-[#244d48] text-[#aaf3d2] border-[#8ee6c567]',
  gold: 'bg-[#674b48] text-[#ffe3a7] border-[#e9bb7c66]',
  neutral: 'bg-[#42354b] text-[#e1cfdf] border-[#7d677b]',
  danger: 'bg-[#593947] text-[#ffc6bd] border-[#f8a59b50]',
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