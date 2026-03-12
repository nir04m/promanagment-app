import { Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Task, TaskPriority, TaskStatus } from '@/types';
import { formatDate } from '@/utils/formatters';
import { cn } from '@/utils/cn';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div
      className={cn(
        'p-3 rounded border cursor-pointer transition-all hover:border-(--text-muted) group'
      )}
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
      onClick={onClick}
    >
      {/* Priority indicator */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p
          className="text-xs font-mono font-medium leading-relaxed group-hover:text-(--accent) transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          {task.title}
        </p>
        <Badge variant="priority" value={task.priority as TaskPriority} className="shrink-0">
          {task.priority}
        </Badge>
      </div>

      {task.description && (
        <p
          className="text-xs font-mono line-clamp-2 mb-2"
          style={{ color: 'var(--text-muted)' }}
        >
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-2">
        {task.dueDate ? (
          <div
            className="flex items-center gap-1 text-xs font-mono"
            style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-muted)' }}
          >
            <Calendar size={10} />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        ) : (
          <div />
        )}

        {task.assignee ? (
          <Avatar name={task.assignee.name} avatarUrl={task.assignee.avatarUrl} size="xs" />
        ) : (
          <div
            className="w-6 h-6 rounded-full border flex items-center justify-center"
            style={{ borderColor: 'var(--border)', borderStyle: 'dashed' }}
          >
            <User size={10} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
      </div>
    </div>
  );
}