import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FolderKanban } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { useProjects, useCreateProject } from '@/hooks/useProjects';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/utils/formatters';
import { ProjectStatus } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150),
  description: z.string().max(1000).optional(),
  deadline: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;

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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Project Name" placeholder="e.g. Website Redesign" error={errors.name?.message} {...register('name')} />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-medium tracking-wide uppercase" style={{ color: 'var(--text-secondary)' }}>
            Description
          </label>
          <textarea
            placeholder="What is this project about?"
            rows={3}
            className="w-full px-3 py-2 text-sm rounded border bg-transparent resize-none outline-none transition-colors"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            {...register('description')}
          />
        </div>
        <Input label="Deadline" type="date" error={errors.deadline?.message} {...register('deadline')} />

        {createProject.error && (
          <p className="text-xs font-mono text-red-400">Failed to create project</p>
        )}

        <div className="flex gap-2 justify-end mt-2">
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
    <div className="flex flex-col h-full">
      <Header title="Projects" subtitle="All projects you are a member of" />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded border bg-transparent outline-none transition-colors focus:border-(--accent)"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
          {isAdmin && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={14} /> New Project
            </Button>
          )}
        </div>

        {/* Projects grid */}
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : data?.data?.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-lg border"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
          >
            <FolderKanban size={32} style={{ color: 'var(--text-muted)' }} className="mb-3" />
            <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
              {search ? 'No projects match your search' : 'No projects yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {data?.data?.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-lg border cursor-pointer transition-all hover:border-(--text-muted) group"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-mono font-medium group-hover:text-(--accent) transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {project.name}
                  </h3>
                  <Badge variant="projectStatus" value={project.status as ProjectStatus}>
                    {project.status}
                  </Badge>
                </div>

                {project.description && (
                  <p className="text-xs font-mono mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                    {project.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  <span>{project.memberCount} members · {project.taskCount} tasks</span>
                  {project.deadline && (
                    <span>Due {formatDate(project.deadline)}</span>
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