import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-mono font-medium tracking-wide transition-all duration-150 border focus:outline-none focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-[var(--accent)] text-white border-[var(--accent)] hover:bg-[var(--accent-hover)]',
      secondary: 'bg-transparent text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-elevated)]',
      ghost: 'bg-transparent text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
      danger: 'bg-transparent text-red-400 border-red-500/30 hover:bg-red-500/10',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded',
      md: 'px-4 py-2 text-sm rounded',
      lg: 'px-6 py-2.5 text-sm rounded',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';