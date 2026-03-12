import { getInitials } from '@/utils/formatters';
import { cn } from '@/utils/cn';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export function Avatar({ name, avatarUrl, size = 'md', className }: AvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={cn('rounded-full object-cover border border-(--border)', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-mono font-medium border border-(--border) shrink-0',
        sizes[size],
        className
      )}
      style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)' }}
    >
      {getInitials(name)}
    </div>
  );
}