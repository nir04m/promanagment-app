import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateTask } from '@/hooks/useTasks';
import { Member } from '@/types';

const schema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().max(5000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const labelStyle: React.CSSProperties = {
  fontFamily: 'DM Mono, monospace', fontSize: '11px', fontWeight: 500,
  textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)',
};

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: '6px',
  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
  color: 'var(--text-primary)', fontFamily: 'DM Mono, monospace', fontSize: '13px',
  outline: 'none', cursor: 'pointer',
};

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: Member[];
  isPM: boolean;
  currentUserId: string;
}

export function CreateTaskModal({ isOpen, onClose, projectId, members, isPM, currentUserId }: CreateTaskModalProps) {
  const createTask = useCreateTask(projectId);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIUM' },
  });

  const onSubmit = (data: FormData) => {
    createTask.mutate(
      {
        ...data,
        assigneeId: data.assigneeId || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      },
      { onSuccess: () => { reset(); onClose(); } }
    );
  };

  const assigneeOptions = isPM
    ? members.map((m) => ({ value: m.userId, label: `${m.user.name} — ${m.projectRole}` }))
    : [{ value: currentUserId, label: 'Myself' }];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Title" placeholder="Task title" error={errors.title?.message} {...register('title')} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Description</label>
          <textarea
            placeholder="Task description (optional)"
            rows={3}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: '6px',
              border: '1px solid var(--border)', background: 'var(--bg-elevated)',
              color: 'var(--text-primary)', fontFamily: 'DM Mono, monospace',
              fontSize: '13px', outline: 'none', resize: 'none' as const,
            }}
            {...register('description')}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>Priority</label>
            <select style={selectStyle} {...register('priority')}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <Input label="Due Date" type="date" {...register('dueDate')} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={labelStyle}>Assignee</label>
          <select style={selectStyle} {...register('assigneeId')}>
            <option value="">Unassigned</option>
            {assigneeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {createTask.error && (
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#f87171' }}>
            Failed to create task
          </p>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={createTask.isPending}>Create Task</Button>
        </div>
      </form>
    </Modal>
  );
}