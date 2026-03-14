import { useNavigate } from 'react-router-dom';
import { FolderKanban, CheckSquare, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Spinner } from '@/components/ui/Spinner';
import { useProjects } from '@/hooks/useProjects';
import { useMyReport } from '@/hooks/useReports';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, timeAgo, getProjectRoleLabel } from '@/utils/formatters';
import { NotificationType } from '@/types';

const typeColor: Record<NotificationType, string> = {
  TASK_ASSIGNED: 'var(--accent)',
  TASK_UPDATED: 'var(--text-secondary)',
  TASK_COMMENTED: 'var(--info)',
  PROJECT_INVITE: 'var(--success)',
  MEMBER_JOINED: 'var(--success)',
  DEADLINE_APPROACHING: 'var(--warning)',
};

const typeLabel: Record<NotificationType, string> = {
  TASK_ASSIGNED: 'Assigned',
  TASK_UPDATED: 'Updated',
  TASK_COMMENTED: 'Comment',
  PROJECT_INVITE: 'Invite',
  MEMBER_JOINED: 'Joined',
  DEADLINE_APPROACHING: 'Deadline',
};

function StatCard({
  label, value, icon: Icon, accent,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <div style={{
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '12px',
    }}>
      <div>
        <p style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '10px',
          fontWeight: 500,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          marginBottom: '10px',
        }}>
          {label}
        </p>
        <p style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '28px',
          fontWeight: 500,
          color: accent ?? 'var(--text-primary)',
          lineHeight: 1,
        }}>
          {value}
        </p>
      </div>
      <div style={{
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        flexShrink: 0,
      }}>
        <Icon size={16} style={{ color: accent ?? 'var(--text-muted)', display: 'block' }} />
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

  const all = notifications ?? [];
  const dashboardNotifications = all.slice(0, 2);
  const unreadCount = all.filter(n => !n.isRead).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Header
        title={`Good to see you, ${user?.name?.split(' ')[0]}`}
        subtitle="Here is what is happening across your projects"
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

        {/* Stats row */}
        {reportLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
            <Spinner />
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '24px',
          }}>
            <StatCard label="Projects" value={projects?.data?.length ?? 0} icon={FolderKanban} accent="var(--accent)" />
            <StatCard label="Assigned Tasks" value={report?.totalAssigned ?? 0} icon={CheckSquare} />
            <StatCard label="In Progress" value={report?.inProgressTasks ?? 0} icon={Clock} accent="var(--warning)" />
            <StatCard
              label="Overdue"
              value={report?.overdueTasks ?? 0}
              icon={AlertTriangle}
              accent={(report?.overdueTasks ?? 0) > 0 ? 'var(--danger)' : undefined}
            />
          </div>
        )}

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', marginBottom: '16px' }}>

          {/* Active projects */}
          <div style={{
            borderRadius: '8px', border: '1px solid var(--border)',
            background: 'var(--bg-surface)', overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderBottom: '1px solid var(--border)',
            }}>
              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500,
                textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-muted)',
              }}>
                Active Projects
              </p>
              <button
                onClick={() => navigate('/projects')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--accent)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                }}
              >
                View all <ArrowRight size={11} />
              </button>
            </div>

            {projectsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                <Spinner />
              </div>
            ) : (projects?.data?.length ?? 0) === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' as const }}>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                  No projects yet
                </p>
              </div>
            ) : (
              projects?.data?.slice(0, 6).map((project, i) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', cursor: 'pointer',
                    borderBottom: i < Math.min((projects?.data?.length ?? 0), 6) - 1 ? '1px solid var(--border-subtle)' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{
                      fontFamily: 'DM Mono, monospace', fontSize: '13px', fontWeight: 500,
                      color: 'var(--text-primary)', marginBottom: '4px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                    }}>
                      {project.name}
                    </p>
                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {project.memberCount} members · {project.taskCount} tasks
                      {project.deadline && ` · due ${formatDate(project.deadline)}`}
                    </p>
                  </div>
                  <div style={{
                    padding: '3px 8px', borderRadius: '4px', marginLeft: '12px', flexShrink: 0,
                    border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                    fontFamily: 'DM Mono, monospace', fontSize: '10px',
                    color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                  }}>
                    {project.status}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Notifications — capped at 2 with View all footer */}
          <div style={{
            borderRadius: '8px', border: '1px solid var(--border)',
            background: 'var(--bg-surface)', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0,
            }}>
              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500,
                textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-muted)',
              }}>
                Notifications
              </p>
              {unreadCount > 0 && (
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontSize: '10px',
                  padding: '2px 7px', borderRadius: '4px',
                  background: 'var(--accent-subtle)', color: 'var(--accent)',
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ flex: 1 }}>
              {dashboardNotifications.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center' as const }}>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                    No notifications
                  </p>
                </div>
              ) : (
                dashboardNotifications.map((n, i) => {
                  const color = typeColor[n.type] ?? 'var(--text-muted)';
                  const projectId = (n.payload?.projectId as string) ?? null;
                  return (
                    <div
                      key={n.id}
                      onClick={() => projectId && navigate(`/projects/${projectId}`)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                        padding: '12px 18px',
                        borderBottom: i < dashboardNotifications.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        background: !n.isRead ? 'rgba(59,110,246,0.03)' : 'transparent',
                        cursor: projectId ? 'pointer' : 'default',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => { if (projectId) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = !n.isRead ? 'rgba(59,110,246,0.03)' : 'transparent';
                      }}
                    >
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        background: `${color}14`, border: `1px solid ${color}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: '2px',
                      }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                          <span style={{
                            fontFamily: 'DM Mono, monospace', fontSize: '9px', fontWeight: 600,
                            textTransform: 'uppercase' as const, letterSpacing: '0.07em', color,
                          }}>
                            {typeLabel[n.type] ?? n.type}
                          </span>
                          {!n.isRead && (
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                          )}
                        </div>
                        <p style={{
                          fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 500,
                          color: 'var(--text-primary)', marginBottom: '2px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                        }}>
                          {n.title}
                        </p>
                        <p style={{
                          fontFamily: 'DM Mono, monospace', fontSize: '10px',
                          color: 'var(--text-muted)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                        }}>
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Always show View all footer */}
            <div
              onClick={() => navigate('/notifications')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                padding: '10px 18px',
                borderTop: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'background 0.1s',
                marginTop: 'auto',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--accent)' }}>
                {all.length > 2 ? `View all ${all.length} notifications` : 'View all notifications'}
              </span>
              <ArrowRight size={11} style={{ color: 'var(--accent)' }} />
            </div>
          </div>
        </div>

        {/* My task breakdown */}
        {report && (report.tasksByProject?.length ?? 0) > 0 && (
          <div style={{
            borderRadius: '8px', border: '1px solid var(--border)',
            background: 'var(--bg-surface)', overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500,
                textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-muted)',
              }}>
                My Task Breakdown
              </p>
            </div>
            {report.tasksByProject.map((p, i) => {
              const pct = p.assignedTasks > 0 ? Math.round((p.completedTasks / p.assignedTasks) * 100) : 0;
              return (
                <div
                  key={p.projectId}
                  onClick={() => navigate(`/projects/${p.projectId}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '14px 18px', cursor: 'pointer',
                    borderBottom: i < report.tasksByProject.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <p style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '13px', fontWeight: 500,
                        color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                      }}>
                        {p.projectName}
                      </p>
                      <span style={{
                        padding: '2px 7px', borderRadius: '4px', flexShrink: 0,
                        border: '1px solid rgba(59,110,246,0.3)', background: 'var(--accent-subtle)',
                        fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--accent)',
                        textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                      }}>
                        {getProjectRoleLabel(p.projectRole as never)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        flex: 1, height: '4px', borderRadius: '2px',
                        background: 'var(--bg-overlay)', overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', borderRadius: '2px',
                          width: `${pct}%`,
                          background: pct === 100 ? 'var(--success)' : 'var(--accent)',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                      <span style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '11px',
                        color: 'var(--text-muted)', flexShrink: 0,
                      }}>
                        {p.completedTasks}/{p.assignedTasks}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}