import { useNavigate } from 'react-router-dom';
import { FolderKanban, CheckSquare, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useProjects } from '@/hooks/useProjects';
import { useMyReport } from '@/hooks/useReports';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, timeAgo, getProjectRoleLabel } from '@/utils/formatters';
import { ProjectStatus } from '@/types';

function StatCard({ label, value, icon: Icon, accent }: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <div
      className="p-4 rounded-lg border flex items-start justify-between"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      <div>
        <p className="text-xs font-mono uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        <p className="text-2xl font-mono font-medium" style={{ color: accent ?? 'var(--text-primary)' }}>
          {value}
        </p>
      </div>
      <div
        className="p-2 rounded border"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
      >
        <Icon size={16} style={{ color: accent ?? 'var(--text-muted)' }} />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: report, isLoading: reportLoading } = useMyReport();
  const { data: notifications } = useNotifications();

  const recentNotifications = notifications?.slice(0, 5) ?? [];
  const unreadNotifications = notifications?.filter((n) => !n.isRead) ?? [];

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`Good to see you, ${user?.name?.split(' ')[0]}`}
        subtitle="Here is what is happening across your projects"
      />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats row */}
        {reportLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Projects"
              value={projects?.data?.length ?? 0}
              icon={FolderKanban}
              accent="var(--accent)"
            />
            <StatCard
              label="Assigned Tasks"
              value={report?.totalAssigned ?? 0}
              icon={CheckSquare}
            />
            <StatCard
              label="In Progress"
              value={report?.inProgressTasks ?? 0}
              icon={Clock}
              accent="var(--warning)"
            />
            <StatCard
              label="Overdue"
              value={report?.overdueTasks ?? 0}
              icon={AlertTriangle}
              accent={report?.overdueTasks ? 'var(--danger)' : undefined}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Projects list */}
          <div
            className="lg:col-span-2 rounded-lg border"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <h2 className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Active Projects
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
                View all <ArrowRight size={12} />
              </Button>
            </div>

            {projectsLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : projects?.data?.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                  No projects yet
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {projects?.data?.slice(0, 6).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-(--bg-elevated) cursor-pointer transition-colors"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {project.name}
                      </p>
                      <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {project.memberCount} members · {project.taskCount} tasks
                        {project.deadline && ` · due ${formatDate(project.deadline)}`}
                      </p>
                    </div>
                    <div className="ml-3 shrink-0">
                      <Badge variant="projectStatus" value={project.status as ProjectStatus}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div
            className="rounded-lg border flex flex-col"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <h2 className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Notifications
              </h2>
              {unreadNotifications.length > 0 && (
                <span
                  className="text-xs font-mono px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                >
                  {unreadNotifications.length} new
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {recentNotifications.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                    No notifications
                  </p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                  {recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      className="px-4 py-3"
                      style={{ background: !n.isRead ? 'var(--accent-subtle)' : undefined }}
                    >
                      <p className="text-xs font-mono font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>
                        {n.title}
                      </p>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {n.message}
                      </p>
                      <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* My tasks by project */}
        {report && report.tasksByProject.length > 0 && (
          <div
            className="mt-4 rounded-lg border"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                My Task Breakdown
              </h2>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {report.tasksByProject.map((p) => {
                const completion = p.assignedTasks > 0
                  ? Math.round((p.completedTasks / p.assignedTasks) * 100)
                  : 0;

                return (
                  <div
                    key={p.projectId}
                    className="px-4 py-3 flex items-center gap-4 hover:bg-(--bg-elevated) cursor-pointer transition-colors"
                    onClick={() => navigate(`/projects/${p.projectId}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-sm font-mono font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {p.projectName}
                        </p>
                        <Badge variant="role" value={p.projectRole}>
                          {getProjectRoleLabel(p.projectRole as never)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex-1 h-1 rounded-full overflow-hidden"
                          style={{ background: 'var(--bg-overlay)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${completion}%`,
                              background: completion === 100 ? 'var(--success)' : 'var(--accent)',
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {p.completedTasks}/{p.assignedTasks}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}