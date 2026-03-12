import { Calendar } from 'lucide-react';
import { Task, TaskPriority } from '@/types';
import { formatDate } from '@/utils/formatters';

const priorityColor: Record<TaskPriority, string> = {
  LOW: 'var(--success)',
  MEDIUM: 'var(--warning)',
  HIGH: 'var(--danger)',
  CRITICAL: '#dc2626',
};

const priorityBg: Record<TaskPriority, string> = {
  LOW: 'rgba(34,197,94,0.08)',
  MEDIUM: 'rgba(245,158,11,0.08)',
  HIGH: 'rgba(239,68,68,0.08)',
  CRITICAL: 'rgba(220,38,38,0.08)',
};

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const priority = task.priority as TaskPriority;

  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px', borderRadius: '6px',
        border: '1px solid var(--border)', background: 'var(--bg-elevated)',
        cursor: 'pointer', transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {/* Priority + title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
        <p style={{
          fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 500,
          color: 'var(--text-primary)', lineHeight: 1.5, flex: 1,
        }}>
          {task.title}
        </p>
        <span style={{
          padding: '2px 6px', borderRadius: '4px', flexShrink: 0,
          background: priorityBg[priority],
          fontFamily: 'DM Mono, monospace', fontSize: '9px', fontWeight: 600,
          color: priorityColor[priority],
          textTransform: 'uppercase' as const, letterSpacing: '0.05em',
          border: `1px solid ${priorityColor[priority]}30`,
        }}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p style={{
          fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)',
          lineHeight: 1.5, marginBottom: '10px',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
        }}>
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
        {task.dueDate ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={10} style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-muted)' }} />
            <span style={{
              fontFamily: 'DM Mono, monospace', fontSize: '10px',
              color: isOverdue ? 'var(--danger)' : 'var(--text-muted)',
            }}>
              {formatDate(task.dueDate)}
            </span>
          </div>
        ) : <div />}

        {task.assignee ? (
          <div style={{
            width: '22px', height: '22px', borderRadius: '50%',
            background: 'var(--accent-subtle)', border: '1px solid rgba(59,110,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'DM Mono, monospace', fontSize: '9px', fontWeight: 600,
            color: 'var(--accent)', flexShrink: 0,
          }}>
            {task.assignee.name[0].toUpperCase()}
          </div>
        ) : (
          <div style={{
            width: '22px', height: '22px', borderRadius: '50%',
            border: '1px dashed var(--border)', background: 'transparent',
          }} />
        )}
      </div>
    </div>
  );
}