import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import { Spinner } from '@/components/ui/Spinner';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskStatus, Member } from '@/types';

const COLUMNS: { status: TaskStatus; label: string; accent: string }[] = [
  { status: 'BACKLOG', label: 'Backlog', accent: 'var(--text-muted)' },
  { status: 'TODO', label: 'To Do', accent: 'var(--text-secondary)' },
  { status: 'IN_PROGRESS', label: 'In Progress', accent: 'var(--accent)' },
  { status: 'IN_REVIEW', label: 'In Review', accent: 'var(--warning)' },
  { status: 'DONE', label: 'Done', accent: 'var(--success)' },
];

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div style={{
        display: 'flex', gap: '12px', padding: '16px',
        height: '100%', overflowX: 'auto', alignItems: 'flex-start',
      }}>
        {COLUMNS.map(({ status, label, accent }) => {
          const columnTasks = (tasks ?? [])
            .filter((t) => t.status === status)
            .sort((a, b) => a.position - b.position);

          return (
            <div
              key={status}
              style={{
                width: '272px', minWidth: '272px', display: 'flex', flexDirection: 'column',
                borderRadius: '8px', border: '1px solid var(--border)',
                background: 'var(--bg-surface)', maxHeight: '100%',
              }}
            >
              {/* Column header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: accent }} />
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '11px', fontWeight: 500,
                    textTransform: 'uppercase' as const, letterSpacing: '0.07em',
                    color: 'var(--text-secondary)',
                  }}>
                    {label}
                  </span>
                </div>
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '11px',
                  padding: '1px 7px', borderRadius: '4px',
                  background: 'var(--bg-overlay)', color: 'var(--text-muted)',
                }}>
                  {columnTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '10px',
                display: 'flex', flexDirection: 'column', gap: '8px',
              }}>
                {columnTasks.length === 0 ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '24px 0',
                  }}>
                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                      No tasks
                    </p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
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