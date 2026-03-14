import { useState } from 'react';
import { Trash2, Send } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useUpdateTask, useDeleteTask, useSelfAssignTask } from '@/hooks/useTasks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/api/comments';
import { Task, TaskStatus } from '@/types';
import { formatDate, timeAgo } from '@/utils/formatters';

const priorityColor: Record<string, string> = {
  LOW: 'var(--success)', MEDIUM: 'var(--warning)', HIGH: 'var(--danger)', CRITICAL: '#dc2626',
};

const statusList: { value: TaskStatus; label: string }[] = [
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
];

interface TaskDetailModalProps {
  task: Task;
  projectId: string;
  onClose: () => void;
  canManage: boolean;
  currentUserId: string;
}

export function TaskDetailModal({ task, projectId, onClose, canManage, currentUserId }: TaskDetailModalProps) {
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);
  const selfAssign = useSelfAssignTask(projectId);

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', task.id],
    queryFn: () => commentsApi.list(task.id),
    select: (res) => res.data.data,
  });

  const addComment = useMutation({
    mutationFn: (content: string) => commentsApi.create(task.id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', task.id] });
      setComment('');
    },
  });

  const isOwn = task.assignee?.id === currentUserId || task.creator.id === currentUserId;

  const sectionLabel: React.CSSProperties = {
    fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--text-muted)', marginBottom: '10px',
  };

  return (
    <Modal isOpen onClose={onClose} title={task.title} size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Meta */}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
          <span style={{
            padding: '4px 10px', borderRadius: '4px',
            border: '1px solid var(--border)', background: 'var(--bg-elevated)',
            fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-secondary)',
          }}>
            {task.status.replace('_', ' ')}
          </span>
          <span style={{
            padding: '4px 10px', borderRadius: '4px',
            border: `1px solid ${priorityColor[task.priority]}30`,
            background: `${priorityColor[task.priority]}10`,
            fontFamily: 'DM Mono, monospace', fontSize: '11px',
            color: priorityColor[task.priority],
          }}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span style={{
              padding: '4px 10px', borderRadius: '4px',
              border: '1px solid var(--border)', background: 'var(--bg-elevated)',
              fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)',
            }}>
              Due {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {task.description}
          </p>
        )}

        {/* Assignee + Creator */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <p style={sectionLabel}>Assignee</p>
            {task.assignee ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  background: 'var(--accent-subtle)', border: '1px solid rgba(59,110,246,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'DM Mono, monospace', fontSize: '11px', fontWeight: 600, color: 'var(--accent)',
                }}>
                  {task.assignee.name[0].toUpperCase()}
                </div>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-primary)' }}>
                  {task.assignee.name}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  border: '1px dashed var(--border)', background: 'transparent',
                }} />
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Unassigned
                </span>
                {!canManage && (
                  <Button size="sm" variant="secondary" onClick={() => selfAssign.mutate(task.id)} loading={selfAssign.isPending}>
                    Assign me
                  </Button>
                )}
              </div>
            )}
          </div>
          <div>
            <p style={sectionLabel}>Created by</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'DM Mono, monospace', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)',
              }}>
                {task.creator.name[0].toUpperCase()}
              </div>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-primary)' }}>
                {task.creator.name}
              </span>
            </div>
          </div>
        </div>

        {/* Status update */}
        {(canManage || isOwn) && (
          <div>
            <p style={sectionLabel}>Update Status</p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
              {statusList.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateTask.mutate({ taskId: task.id, data: { status: value } })}
                  style={{
                    padding: '5px 12px', borderRadius: '4px', cursor: 'pointer',
                    border: `1px solid ${task.status === value ? 'var(--accent)' : 'var(--border)'}`,
                    background: task.status === value ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                    color: task.status === value ? 'var(--accent)' : 'var(--text-muted)',
                    fontFamily: 'DM Mono, monospace', fontSize: '11px',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div>
          <p style={sectionLabel}>Comments</p>
          {commentsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}><Spinner /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
              {(comments?.length ?? 0) === 0 ? (
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' as const, padding: '16px 0' }}>
                  No comments yet
                </p>
              ) : (
                comments?.map((c) => (
                  <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                      background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)',
                    }}>
                      {c.author.name[0].toUpperCase()}
                    </div>
                    <div style={{
                      flex: 1, padding: '10px 12px', borderRadius: '6px',
                      border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {c.author.name}
                        </span>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-muted)' }}>
                          {timeAgo(c.createdAt)}
                        </span>
                      </div>
                      <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '6px',
                border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                color: 'var(--text-primary)', fontFamily: 'DM Mono, monospace', fontSize: '12px', outline: 'none',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && comment.trim()) {
                  addComment.mutate(comment.trim());
                }
              }}
            />
            <Button size="sm" onClick={() => comment.trim() && addComment.mutate(comment.trim())}
              loading={addComment.isPending} disabled={!comment.trim()}>
              <Send size={12} />
            </Button>
          </div>
        </div>

        {/* Delete */}
        {canManage && (
          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="danger" size="sm" onClick={() => deleteTask.mutate(task.id, { onSuccess: onClose })} loading={deleteTask.isPending}>
              <Trash2 size={12} /> Delete Task
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}