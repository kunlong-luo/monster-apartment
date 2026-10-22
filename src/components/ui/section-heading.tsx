import type { ReactNode } from 'react';
import { cn } from './cn';

type SectionHeadingProps = {
  title: string;
  meta?: ReactNode;
};

export function SectionHeading({ title, meta }: SectionHeadingProps) {
  return (
    <header className={cn('flex items-center justify-between gap-2 mb-4', meta ? 'mb-3' : undefined)}>
      <p className="game-panel-heading m-0">{title}</p>
      {meta && <span className="text-gold-200 text-xs font-bold whitespace-nowrap">{meta}</span>}
    </header>
  );
}