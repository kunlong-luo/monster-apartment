import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'quiet' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-[#ffe2a5] to-[#e2a867] text-[#38263c] font-extrabold shadow-[inset_0_2px_0_#fff7db66,0_4px_0_#87596d] hover:from-[#fff1c6] hover:to-[#f0be83] active:brightness-90 disabled:opacity-45 disabled:shadow-none',
  secondary:
    'bg-[#41354e] text-[#fff0e1] border border-[#aa857da0] hover:bg-[#56415d] active:bg-[#302942] disabled:opacity-45',
  ghost:
    'bg-transparent text-[#efdad6] hover:bg-[#543e57] active:bg-[#302942] disabled:opacity-45',
  quiet:
    'bg-[#332b46] text-[#cfc0d2] border border-[#8a70837a] hover:bg-[#453651] active:bg-[#282439] disabled:opacity-45',
  danger:
    'bg-[#453044] text-[#ffc3bb] border border-[#ae6c73ad] hover:bg-[#62404f] active:bg-[#352a3b] disabled:opacity-45',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-base gap-2',
  lg: 'px-6 py-3 text-lg gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      fullWidth = false,
      className,
      children,
      disabled,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-sans font-bold rounded-xl transition-[transform,background-color,box-shadow] duration-150 active:translate-y-px',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950',
          'disabled:opacity-45 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };