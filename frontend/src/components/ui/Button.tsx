import { ButtonHTMLAttributes, forwardRef, useState } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const baseStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  fontFamily: 'DM Mono, monospace',
  fontWeight: 500,
  letterSpacing: '0.02em',
  cursor: 'pointer',
  transition: 'all 0.15s',
  border: '1px solid',
  outline: 'none',
  flexShrink: 0,
  whiteSpace: 'nowrap' as const,
};

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: 'var(--accent)',
    color: '#ffffff',
    borderColor: 'var(--accent)',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--text-primary)',
    borderColor: 'var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    borderColor: 'transparent',
  },
  danger: {
    background: 'transparent',
    color: '#f87171',
    borderColor: 'rgba(239,68,68,0.3)',
  },
};

const hoverStyles: Record<string, React.CSSProperties> = {
  primary: { background: 'var(--accent-hover)', borderColor: 'var(--accent-hover)' },
  secondary: { borderColor: 'var(--text-muted)', background: 'var(--bg-elevated)' },
  ghost: { color: 'var(--text-primary)', background: 'var(--bg-elevated)' },
  danger: { background: 'rgba(239,68,68,0.1)' },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '5px 10px', fontSize: '11px', borderRadius: '5px' },
  md: { padding: '8px 14px', fontSize: '12px', borderRadius: '6px' },
  lg: { padding: '10px 20px', fontSize: '13px', borderRadius: '6px' },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, style, disabled, ...props }, ref) => {
    const [hovered, setHovered] = useState(false);

    const computedStyle: React.CSSProperties = {
      ...baseStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...(hovered && !disabled && !loading ? hoverStyles[variant] : {}),
      ...(disabled || loading ? { opacity: 0.45, cursor: 'not-allowed' } : {}),
      ...style,
    };

    return (
      <button
        ref={ref}
        style={computedStyle}
        disabled={disabled || loading}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';