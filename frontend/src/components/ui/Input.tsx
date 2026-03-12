import { InputHTMLAttributes, forwardRef, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, style, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              color: 'var(--text-secondary)',
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            border: `1px solid ${error ? '#f87171' : focused ? 'var(--accent)' : 'var(--border)'}`,
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            fontFamily: 'DM Mono, monospace',
            fontSize: '13px',
            outline: 'none',
            transition: 'border-color 0.15s',
            boxSizing: 'border-box' as const,
            ...style,
          }}
          {...props}
        />
        {error && (
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#f87171' }}>
            {error}
          </p>
        )}
        {hint && !error && (
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';