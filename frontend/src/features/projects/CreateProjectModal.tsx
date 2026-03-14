import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateProject } from '@/hooks/useProjects';

const schema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(150),
  description: z.string().max(1000).optional(),
  deadline: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const createProject = useCreateProject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleClose = () => {
    reset();
    createProject.reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    createProject.mutate(
      {
        name: data.name,
        description: data.description || undefined,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Project" size="md">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

        <Input
          label="Project Name"
          placeholder="e.g. Website Redesign"
          error={errors.name?.message}
          autoFocus
          {...register('name')}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            color: 'var(--text-secondary)',
          }}>
            Description
          </label>
          <textarea
            placeholder="What is this project about? (optional)"
            rows={3}
            {...register('description')}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '13px',
              fontFamily: 'DM Mono, monospace',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              resize: 'vertical' as const,
              outline: 'none',
              lineHeight: 1.5,
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
        </div>

        <Input
          label="Deadline"
          type="date"
          error={errors.deadline?.message}
          hint="Optional — set a target completion date"
          {...register('deadline')}
        />

        {createProject.error && (
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '12px',
            color: 'var(--danger)',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(239,68,68,0.2)',
            background: 'rgba(239,68,68,0.05)',
          }}>
            {(createProject.error as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? 'Failed to create project'}
          </p>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px' }}>
          <Button type="button" variant="secondary" size="md" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" loading={createProject.isPending}>
            Create Project
          </Button>
        </div>

      </form>
    </Modal>
  );
}