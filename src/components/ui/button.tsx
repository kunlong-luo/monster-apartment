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
    'bg-gradient-to-r from-mint-400 to-mint-500 text-mint-900 font-semibold shadow-[0_4px_14px_#66dbbc40] hover:from-mint-300 hover:to-mint-400 active:from-mint-500 active:to-mint-500 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:from-mint-400 disabled:hover:to-mint-500',
  secondary:
    'bg-ink-700 text-mist-300 border border-line-strong hover:bg-ink-600 active:bg-ink-800 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-ink-700',
  ghost:
    'bg-transparent text-mist-300 hover:bg-ink-700 active:bg-ink-800 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-transparent',
  quiet:
    'bg-ink-700 text-mist-300 border border-line-strong hover:bg-ink-600 active:bg-ink-800 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-ink-700',
  danger:
    'bg-ink-700 text-danger-300 border border-line-strong hover:bg-ink-600 active:bg-ink-800 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-ink-700',
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
          'inline-flex items-center justify-center font-sans font-medium rounded-xl transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950',
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