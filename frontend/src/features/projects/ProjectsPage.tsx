import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FolderKanban } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useProjects, useCreateProject } from '@/hooks/useProjects';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/utils/formatters';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(1000).optional(),
  deadline: z.string().optional(),
});
type CreateForm = z.infer<typeof createSchema>;

const statusColor: Record<string, string> = {
  PLANNING: 'var(--text-muted)',
  ACTIVE: 'var(--accent)',
  ON_HOLD: 'var(--warning)',
  COMPLETED: 'var(--success)',
  CANCELLED: 'var(--danger)',
};

function CreateProjectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const createProject = useCreateProject();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  });

  const onSubmit = (data: CreateForm) => {
    createProject.mutate(
      { ...data, deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined },
      { onSuccess: () => { reset(); onClose(); } }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Project">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Project Name" placeholder="e.g. Website Redesign" error={errors.name?.message} {...register('name')} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{
            fontFamily: 'DM Mono, monospace', fontSize: '11px', fontWeight: 500,
            textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-secondary)',
          }}>
            Description
          </label>
          <textarea
            placeholder="What is this project about?"
            rows={3}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: '6px',
              border: '1px solid var(--border)', background: 'var(--bg-elevated)',
              color: 'var(--text-primary)', fontFamily: 'DM Mono, monospace', fontSize: '13px',
              outline: 'none', resize: 'none' as const,
            }}
            {...register('description')}
          />
        </div>
        <Input label="Deadline" type="date" {...register('deadline')} />
        {createProject.error && (
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#f87171' }}>
            Failed to create project
          </p>
        )}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={createProject.isPending}>Create Project</Button>
        </div>
      </form>
    </Modal>
  );
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useProjects({ search: search || undefined });
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Header title="Projects" subtitle="All projects you are a member of" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ position: 'relative' as const, flex: 1, maxWidth: '320px' }}>
            <Search size={13} style={{
              position: 'absolute' as const, left: '12px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' as const,
            }} />
            <input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px',
                borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)',
                color: 'var(--text-primary)', fontFamily: 'DM Mono, monospace', fontSize: '13px', outline: 'none',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>
          {isAdmin && (
            <Button onClick={() => setShowCreate(true)} size="sm">
              <Plus size={13} /> New Project
            </Button>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <Spinner size="lg" />
          </div>
        ) : (data?.data?.length ?? 0) === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '64px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)',
          }}>
            <FolderKanban size={28} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-muted)' }}>
              {search ? 'No projects match your search' : 'No projects yet'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {data?.data?.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                style={{
                  padding: '20px', borderRadius: '8px', border: '1px solid var(--border)',
                  background: 'var(--bg-surface)', cursor: 'pointer', transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                  <p style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '14px', fontWeight: 500,
                    color: 'var(--text-primary)', lineHeight: 1.4,
                  }}>
                    {project.name}
                  </p>
                  <span style={{
                    padding: '3px 8px', borderRadius: '4px', flexShrink: 0,
                    border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                    fontFamily: 'DM Mono, monospace', fontSize: '10px',
                    color: statusColor[project.status] ?? 'var(--text-muted)',
                    textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                  }}>
                    {project.status}
                  </span>
                </div>
                {project.description && (
                  <p style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-muted)',
                    lineHeight: 1.6, marginBottom: '14px',
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {project.description}
                  </p>
                )}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingTop: '12px', borderTop: '1px solid var(--border-subtle)',
                }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {project.memberCount} members · {project.taskCount} tasks
                  </span>
                  {project.deadline && (
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                      Due {formatDate(project.deadline)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}