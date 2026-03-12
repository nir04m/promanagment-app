import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, BarChart3, Settings, ArrowLeft, Plus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { TaskBoard } from '@/features/tasks/TaskBoard';
import { CreateTaskModal } from '@/features/tasks/CreateTaskModal';
import { useProject } from '@/hooks/useProjects';
import { useMembers } from '@/hooks/useMembers';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/utils/formatters';
import { ProjectStatus } from '@/types';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showCreateTask, setShowCreateTask] = useState(false);

  const { data: project, isLoading } = useProject(projectId!);
  const { data: members } = useMembers(projectId!);

  const currentMember = members?.find((m) => m.userId === user?.id);
  const isPM = currentMember?.projectRole === 'PM';
  const isAdmin = user?.role === 'ADMIN';
  const canCreateTask = !!currentMember;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>Project not found</p>
        <Button variant="ghost" onClick={() => navigate('/projects')}>
          <ArrowLeft size={14} /> Back to projects
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title={project.name}
        subtitle={project.description ?? undefined}
      />

      {/* Project toolbar */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b gap-4"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft size={14} /> Projects
          </Button>
          <div className="w-px h-4" style={{ background: 'var(--border)' }} />
          <Badge variant="projectStatus" value={project.status as ProjectStatus}>
            {project.status}
          </Badge>
          {project.deadline && (
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              Due {formatDate(project.deadline)}
            </span>
          )}
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {members?.length ?? 0} members
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canCreateTask && (
            <Button size="sm" onClick={() => setShowCreateTask(true)}>
              <Plus size={14} /> Add Task
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/projects/${projectId}/members`)}
          >
            <Users size={14} /> Members
          </Button>
          {(isPM || isAdmin) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/projects/${projectId}/report`)}
            >
              <BarChart3 size={14} /> Report
            </Button>
          )}
        </div>
      </div>

      {/* Task board */}
      <div className="flex-1 overflow-hidden">
        <TaskBoard
          projectId={projectId!}
          currentMember={currentMember}
          isAdmin={isAdmin}
        />
      </div>

      {canCreateTask && (
        <CreateTaskModal
          isOpen={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          projectId={projectId!}
          members={members ?? []}
          isPM={isPM || isAdmin}
          currentUserId={user?.id ?? ''}
        />
      )}
    </div>
  );
}