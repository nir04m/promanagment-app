import { useState } from 'react';
import { Trash2, User, Send } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { useUpdateTask, useDeleteTask, useSelfAssignTask } from '@/hooks/useTasks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/api/comments';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { formatDate, timeAgo, getStatusLabel, getPriorityLabel } from '@/utils/formatters';

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

  const handleStatusChange = (status: string) => {
    updateTask.mutate({ taskId: task.id, data: { status: status as TaskStatus } });
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id, { onSuccess: onClose });
  };

  const isOwn = task.assignee?.id === currentUserId || task.creator.id === currentUserId;

  return (
    <Modal isOpen onClose={onClose} title={task.title} size="lg">
      <div className="flex flex-col gap-5">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="status" value={task.status as TaskStatus}>
            {getStatusLabel(task.status as TaskStatus)}
          </Badge>
          <Badge variant="priority" value={task.priority as TaskPriority}>
            {getPriorityLabel(task.priority as TaskPriority)}
          </Badge>
          {task.dueDate && (
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              Due {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
            {task.description}
          </p>
        )}

        {/* Assignee & creator */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              Assignee
            </p>
            {task.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar name={task.assignee.name} avatarUrl={task.assignee.avatarUrl} size="sm" />
                <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
                  {task.assignee.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full border flex items-center justify-center"
                  style={{ borderColor: 'var(--border)', borderStyle: 'dashed' }}
                >
                  <User size={12} style={{ color: 'var(--text-muted)' }} />
                </div>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                {!canManage && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => selfAssign.mutate(task.id)}
                    loading={selfAssign.isPending}
                  >
                    Assign me
                  </Button>
                )}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-mono uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              Created by
            </p>
            <div className="flex items-center gap-2">
              <Avatar name={task.creator.name} size="sm" />
              <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
                {task.creator.name}
              </span>
            </div>
          </div>
        </div>

        {/* Status update */}
        {(canManage || isOwn) && (
          <div>
            <p className="text-xs font-mono uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              Update Status
            </p>
            <div className="flex flex-wrap gap-2">
              {(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as TaskStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className="px-2 py-1 text-xs font-mono rounded border transition-colors"
                  style={{
                    borderColor: task.status === s ? 'var(--accent)' : 'var(--border)',
                    background: task.status === s ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                    color: task.status === s ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  {getStatusLabel(s)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div>
          <p className="text-xs font-mono uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
            Comments
          </p>

          {commentsLoading ? (
            <div className="flex justify-center py-4"><Spinner /></div>
          ) : (
            <div className="flex flex-col gap-3 mb-3 max-h-48 overflow-y-auto">
              {comments?.length === 0 ? (
                <p className="text-xs font-mono text-center py-3" style={{ color: 'var(--text-muted)' }}>
                  No comments yet
                </p>
              ) : (
                comments?.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <Avatar name={c.author.name} avatarUrl={c.author.avatarUrl} size="xs" />
                    <div
                      className="flex-1 p-2.5 rounded border"
                      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                          {c.author.name}
                        </span>
                        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                          {timeAgo(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Comment input */}
          <div className="flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 text-xs rounded border bg-transparent outline-none transition-colors focus:border-(--accent) font-mono"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && comment.trim()) {
                  addComment.mutate(comment.trim());
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => comment.trim() && addComment.mutate(comment.trim())}
              loading={addComment.isPending}
              disabled={!comment.trim()}
            >
              <Send size={12} />
            </Button>
          </div>
        </div>

        {/* Delete */}
        {canManage && (
          <div className="pt-2 border-t flex justify-end" style={{ borderColor: 'var(--border)' }}>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={deleteTask.isPending}
            >
              <Trash2 size={12} /> Delete Task
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}