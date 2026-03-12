import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useProjectReport } from '@/hooks/useReports';
import { getProjectRoleLabel } from '@/utils/formatters';
import { ProjectRole } from '@/types';

const roleColor: Record<string, string> = {
  PM: 'var(--accent)', DESIGNER: 'var(--info)', DEVELOPER: 'var(--success)', QA: 'var(--warning)',
};

const statusBarColor: Record<string, string> = {
  BACKLOG: 'var(--text-muted)', TODO: 'var(--text-secondary)',
  IN_PROGRESS: 'var(--accent)', IN_REVIEW: 'var(--warning)', DONE: 'var(--success)',
};

const priorityBarColor: Record<string, string> = {
  LOW: 'var(--success)', MEDIUM: 'var(--warning)', HIGH: 'var(--danger)', CRITICAL: '#dc2626',
};

const thStyle: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left' as const,
  fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500,
  textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)',
};

export function ProjectReportPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: report, isLoading, error } = useProjectReport(projectId!);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Header title="Project Report" />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Spinner size="lg" /></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Header title="Project Report" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px' }}>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-muted)' }}>
            Report not available or access denied
          </p>
          <Button variant="ghost" onClick={() => navigate(`/projects/${projectId}`)}>
            <ArrowLeft size={13} /> Back to project
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Header title={`${report.projectName} — Report`} subtitle={`${report.totalTasks} total tasks · ${report.memberCount} members`} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

        <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${projectId}`)} style={{ marginBottom: '20px' }}>
          <ArrowLeft size={13} /> Back to project
        </Button>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total Tasks', value: report.totalTasks },
            { label: 'Completed', value: report.tasksByStatus['DONE'] ?? 0 },
            { label: 'Overdue', value: report.overdueTaskCount },
            { label: 'Completion', value: `${report.completionPercentage}%` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              padding: '20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)',
            }}>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {label}
              </p>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '28px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1 }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {[
            { title: 'By Status', entries: Object.entries(report.tasksByStatus), colors: statusBarColor },
            { title: 'By Priority', entries: Object.entries(report.tasksByPriority), colors: priorityBarColor },
          ].map(({ title, entries, colors }) => (
            <div key={title} style={{ padding: '20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {entries.map(([key, count]) => {
                  const pct = report.totalTasks > 0 ? (count / report.totalTasks) * 100 : 0;
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-secondary)', width: '80px', flexShrink: 0 }}>
                        {key}
                      </span>
                      <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--bg-overlay)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '3px', width: `${pct}%`, background: colors[key] ?? 'var(--text-muted)' }} />
                      </div>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', width: '20px', textAlign: 'right' as const }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Member contributions */}
        <div style={{ borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--bg-surface)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Member Contributions
            </p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr>
                {['Member', 'Role', 'Assigned', 'Completed', 'In Progress', 'Progress'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.memberContributions.map((m, i) => {
                const pct = m.assignedTasks > 0 ? Math.round((m.completedTasks / m.assignedTasks) * 100) : 0;
                return (
                  <tr
                    key={m.userId}
                    style={{ borderBottom: i < report.memberContributions.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                          background: 'var(--accent-subtle)', border: '1px solid rgba(59,110,246,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'DM Mono, monospace', fontSize: '11px', fontWeight: 600, color: 'var(--accent)',
                        }}>
                          {m.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>{m.name}</p>
                          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-muted)' }}>{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '4px',
                        border: `1px solid ${roleColor[m.projectRole] ?? 'var(--border)'}30`,
                        background: `${roleColor[m.projectRole] ?? 'var(--bg-overlay)'}10`,
                        fontFamily: 'DM Mono, monospace', fontSize: '10px',
                        color: roleColor[m.projectRole] ?? 'var(--text-muted)',
                        textTransform: 'uppercase' as const,
                      }}>
                        {getProjectRoleLabel(m.projectRole as ProjectRole)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-primary)' }}>{m.assignedTasks}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--success)' }}>{m.completedTasks}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--accent)' }}>{m.inProgressTasks}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80px', height: '4px', borderRadius: '2px', background: 'var(--bg-overlay)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: '2px', width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--accent)' }} />
                        </div>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}