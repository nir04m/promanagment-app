import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useCreateTask } from '@/hooks/useTasks';
import { Member } from '@/types';

const schema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(255),
  description: z.string().max(5000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: Member[];
  isPM: boolean;
  currentUserId: string;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  projectId,
  members,
  isPM,
  currentUserId,
}: CreateTaskModalProps) {
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

  // Non-PM members can only assign to themselves
  const assigneeOptions = isPM
    ? members.map((m) => ({ value: m.userId, label: `${m.user.name} (${m.projectRole})` }))
    : [{ value: currentUserId, label: 'Myself' }];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Title" placeholder="Task title" error={errors.title?.message} {...register('title')} />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-medium tracking-wide uppercase" style={{ color: 'var(--text-secondary)' }}>
            Description
          </label>
          <textarea
            placeholder="Task description (optional)"
            rows={3}
            className="w-full px-3 py-2 text-sm rounded border bg-transparent resize-none outline-none transition-colors"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Priority"
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'CRITICAL', label: 'Critical' },
            ]}
            {...register('priority')}
          />
          <Input label="Due Date" type="date" {...register('dueDate')} />
        </div>

        <Select
          label="Assignee"
          placeholder="Unassigned"
          options={assigneeOptions}
          {...register('assigneeId')}
        />

        {createTask.error && (
          <p className="text-xs font-mono text-red-400">Failed to create task</p>
        )}

        <div className="flex gap-2 justify-end mt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={createTask.isPending}>Create Task</Button>
        </div>
      </form>
    </Modal>
  );
}