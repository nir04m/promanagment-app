import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import { Spinner } from '@/components/ui/Spinner';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskStatus, Member } from '@/types';
import { getStatusLabel } from '@/utils/formatters';

const COLUMNS: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

const columnAccent: Record<TaskStatus, string> = {
  BACKLOG: 'var(--text-muted)',
  TODO: 'var(--text-secondary)',
  IN_PROGRESS: 'var(--accent)',
  IN_REVIEW: 'var(--warning)',
  DONE: 'var(--success)',
};

interface TaskBoardProps {
  projectId: string;
  currentMember?: Member;
  isAdmin?: boolean;
}

export function TaskBoard({ projectId, currentMember, isAdmin }: TaskBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { data: tasks, isLoading } = useTasks(projectId);

  const isPM = currentMember?.projectRole === 'PM';
  const canManage = isPM || isAdmin;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  const getColumnTasks = (status: TaskStatus) =>
    (tasks ?? []).filter((t) => t.status === status).sort((a, b) => a.position - b.position);

  return (
    <>
      <div className="flex gap-3 p-4 h-full overflow-x-auto">
        {COLUMNS.map((status) => {
          const columnTasks = getColumnTasks(status);

          return (
            <div
              key={status}
              className="flex flex-col shrink-0 rounded-lg border"
              style={{
                width: '260px',
                background: 'var(--bg-surface)',
                borderColor: 'var(--border)',
              }}
            >
              {/* Column header */}
              <div
                className="flex items-center justify-between px-3 py-2.5 border-b shrink-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: columnAccent[status] }}
                  />
                  <span
                    className="text-xs font-mono font-medium uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {getStatusLabel(status)}
                  </span>
                </div>
                <span
                  className="text-xs font-mono px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}
                >
                  {columnTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                {columnTasks.length === 0 ? (
                  <div className="flex items-center justify-center py-6">
                    <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      No tasks
                    </p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => setSelectedTask(task)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={projectId}
          onClose={() => setSelectedTask(null)}
          canManage={canManage ?? false}
          currentUserId={currentMember?.userId ?? ''}
        />
      )}
    </>
  );
}