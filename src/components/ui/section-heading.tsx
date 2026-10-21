import type { ReactNode } from 'react';
import { cn } from './cn';

type SectionHeadingProps = {
  title: string;
  meta?: ReactNode;
};

export function SectionHeading({ title, meta }: SectionHeadingProps) {
  return (
    <header className={cn('flex items-center justify-between gap-2 mb-4', meta ? 'mb-0' : undefined)}>
      <p className="eyebrow text-mist-400 text-xs font-bold tracking-widest uppercase m-0">{title}</p>
      {meta && <span className="text-mist-500 text-xs whitespace-nowrap">{meta}</span>}
    </header>
  );
}