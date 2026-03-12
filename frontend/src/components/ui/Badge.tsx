import { cn } from '@/utils/cn';
import { TaskStatus, TaskPriority, ProjectStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'status' | 'priority' | 'projectStatus' | 'role';
  value?: TaskStatus | TaskPriority | ProjectStatus | string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  BACKLOG: 'bg-[var(--bg-overlay)] text-[var(--text-muted)] border-[var(--border)]',
  TODO: 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] border-[var(--border)]',
  IN_PROGRESS: 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]',
  IN_REVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  DONE: 'bg-green-500/10 text-green-400 border-green-500/30',
};

const priorityStyles: Record<string, string> = {
  LOW: 'bg-green-500/10 text-green-400 border-green-500/30',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  HIGH: 'bg-red-500/10 text-red-400 border-red-500/30',
  CRITICAL: 'bg-red-600/20 text-red-300 border-red-500/50',
};

const projectStatusStyles: Record<string, string> = {
  PLANNING: 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] border-[var(--border)]',
  ACTIVE: 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]',
  ON_HOLD: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const roleStyles: Record<string, string> = {
  PM: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  DESIGNER: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  DEVELOPER: 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]',
  QA: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

export function Badge({ children, variant = 'default', value, className }: BadgeProps) {
  let variantStyle = 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] border-[var(--border)]';

  if (value) {
    if (variant === 'status') variantStyle = statusStyles[value] ?? variantStyle;
    if (variant === 'priority') variantStyle = priorityStyles[value] ?? variantStyle;
    if (variant === 'projectStatus') variantStyle = projectStatusStyles[value] ?? variantStyle;
    if (variant === 'role') variantStyle = roleStyles[value] ?? variantStyle;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium rounded border tracking-wide uppercase',
        variantStyle,
        className
      )}
    >
      {children}
    </span>
  );
}