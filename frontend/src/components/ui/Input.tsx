import { cn } from '@/utils/cn';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-mono font-medium tracking-wide uppercase"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 text-sm rounded border bg-transparent transition-colors duration-150 outline-none',
            'placeholder:text-(--text-muted)',
            'focus:border-(--accent) focus:ring-1 focus:ring-(--accent)/30',
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
              : 'border-(--border) hover:border-(--text-muted)',
            className
          )}
          style={{ color: 'var(--text-primary)', background: 'var(--bg-elevated)' }}
          {...props}
        />
        {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
        {hint && !error && <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';