import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, BarChart3, ArrowLeft, Plus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { TaskBoard } from '@/features/tasks/TaskBoard';
import { CreateTaskModal } from '@/features/tasks/CreateTaskModal';
import { useProject } from '@/hooks/useProjects';
import { useMembers } from '@/hooks/useMembers';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/utils/formatters';

const statusColor: Record<string, string> = {
  PLANNING: 'var(--text-muted)',
  ACTIVE: 'var(--accent)',
  ON_HOLD: 'var(--warning)',
  COMPLETED: 'var(--success)',
  CANCELLED: 'var(--danger)',
};

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-muted)' }}>
          Project not found
        </p>
        <Button variant="ghost" onClick={() => navigate('/projects')}>
          <ArrowLeft size={13} /> Back to projects
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Header title={project.name} subtitle={project.description ?? undefined} />

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: '48px', flexShrink: 0,
        borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft size={13} /> Projects
          </Button>
          <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
          <span style={{
            padding: '3px 8px', borderRadius: '4px',
            border: '1px solid var(--border)', background: 'var(--bg-elevated)',
            fontFamily: 'DM Mono, monospace', fontSize: '10px',
            color: statusColor[project.status] ?? 'var(--text-muted)',
            textTransform: 'uppercase' as const, letterSpacing: '0.05em',
          }}>
            {project.status}
          </span>
          {project.deadline && (
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
              Due {formatDate(project.deadline)}
            </span>
          )}
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
            {members?.length ?? 0} members
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {canCreateTask && (
            <Button size="sm" onClick={() => setShowCreateTask(true)}>
              <Plus size={13} /> Add Task
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => navigate(`/projects/${projectId}/members`)}>
            <Users size={13} /> Members
          </Button>
          {(isPM || isAdmin) && (
            <Button variant="secondary" size="sm" onClick={() => navigate(`/projects/${projectId}/report`)}>
              <BarChart3 size={13} /> Report
            </Button>
          )}
        </div>
      </div>

      {/* Task board */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <TaskBoard projectId={projectId!} currentMember={currentMember} isAdmin={isAdmin} />
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