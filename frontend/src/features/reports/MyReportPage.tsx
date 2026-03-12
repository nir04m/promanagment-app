import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Spinner } from '@/components/ui/Spinner';
import { useMyReport } from '@/hooks/useReports';
import { getProjectRoleLabel } from '@/utils/formatters';
import { ProjectRole } from '@/types';

const roleColor: Record<string, string> = {
  PM: 'var(--accent)', DESIGNER: 'var(--info)', DEVELOPER: 'var(--success)', QA: 'var(--warning)',
};

export function MyReportPage() {
  const navigate = useNavigate();
  const { data: report, isLoading } = useMyReport();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Header title="My Report" />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Spinner size="lg" /></div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Header title="My Report" subtitle="Personal task summary across all projects" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total Assigned', value: report.totalAssigned },
            { label: 'Completed', value: report.completedTasks },
            { label: 'In Progress', value: report.inProgressTasks },
            { label: 'Overdue', value: report.overdueTasks },
          ].map(({ label, value }) => (
            <div key={label} style={{
              padding: '20px', borderRadius: '8px',
              border: '1px solid var(--border)', background: 'var(--bg-surface)',
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

        {/* Completion bar */}
        <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Overall Completion
            </p>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {report.completionPercentage}%
            </p>
          </div>
          <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-overlay)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '3px',
              width: `${report.completionPercentage}%`,
              background: report.completionPercentage === 100 ? 'var(--success)' : 'var(--accent)',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Per-project */}
        <div style={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              By Project
            </p>
          </div>
          {report.tasksByProject.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' as const }}>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-muted)' }}>No tasks assigned</p>
            </div>
          ) : (
            report.tasksByProject.map((p, i) => {
              const pct = p.assignedTasks > 0 ? Math.round((p.completedTasks / p.assignedTasks) * 100) : 0;
              return (
                <div
                  key={p.projectId}
                  onClick={() => navigate(`/projects/${p.projectId}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px',
                    cursor: 'pointer', transition: 'background 0.1s',
                    borderBottom: i < report.tasksByProject.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {p.projectName}
                      </p>
                      <span style={{
                        padding: '2px 7px', borderRadius: '4px',
                        border: `1px solid ${roleColor[p.projectRole] ?? 'var(--border)'}30`,
                        background: `${roleColor[p.projectRole] ?? 'var(--bg-overlay)'}10`,
                        fontFamily: 'DM Mono, monospace', fontSize: '10px',
                        color: roleColor[p.projectRole] ?? 'var(--text-muted)',
                        textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                      }}>
                        {getProjectRoleLabel(p.projectRole as ProjectRole)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'var(--bg-overlay)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '2px', width: `${pct}%`,
                          background: pct === 100 ? 'var(--success)' : 'var(--accent)',
                        }} />
                      </div>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                        {p.completedTasks}/{p.assignedTasks} done
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}