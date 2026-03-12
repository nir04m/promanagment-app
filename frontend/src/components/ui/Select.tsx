import { cn } from '@/utils/cn';
import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-mono font-medium tracking-wide uppercase"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-3 py-2 text-sm rounded border bg-transparent transition-colors duration-150 outline-none cursor-pointer',
            'focus:border-(--accent) focus:ring-1 focus:ring-(--accent)/30',
            error
              ? 'border-red-500/50'
              : 'border-(--border) hover:border-(--text-muted)',
            className
          )}
          style={{ color: 'var(--text-primary)', background: 'var(--bg-elevated)' }}
          {...props}
        >
          {placeholder && (
            <option value="" style={{ background: 'var(--bg-elevated)' }}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-elevated)' }}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';