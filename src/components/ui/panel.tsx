import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from './cn';

type PanelProps = {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'aside' | 'div';
} & Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'as'>;

export function Panel({ children, className, as: Component = 'section', ...rest }: PanelProps) {
  return (
    <Component
      className={cn(
        'rounded-panel bg-ink-800 border border-line shadow-[0_14px_42px_#0003]',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}