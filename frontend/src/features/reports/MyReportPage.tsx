import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { useMyReport } from '@/hooks/useReports';
import { getProjectRoleLabel } from '@/utils/formatters';
import { ProjectRole } from '@/types';

export function MyReportPage() {
  const navigate = useNavigate();
  const { data: report, isLoading } = useMyReport();

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="My Report" />
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      </div>
    );
  }

  if (!report) return null;

  const stats = [
    { label: 'Total Assigned', value: report.totalAssigned },
    { label: 'Completed', value: report.completedTasks },
    { label: 'In Progress', value: report.inProgressTasks },
    { label: 'Overdue', value: report.overdueTasks },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="My Report" subtitle="Personal task summary across all projects" />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="p-4 rounded-lg border"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
              <p className="text-xs font-mono uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                {label}
              </p>
              <p className="text-2xl font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Completion bar */}
        <div
          className="p-4 rounded-lg border mb-6"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Overall Completion
            </p>
            <p className="text-sm font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
              {report.completionPercentage}%
            </p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${report.completionPercentage}%`,
                background: report.completionPercentage === 100 ? 'var(--success)' : 'var(--accent)',
              }}
            />
          </div>
        </div>

        {/* Per-project breakdown */}
        <div
          className="rounded-lg border"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              By Project
            </h2>
          </div>
          {report.tasksByProject.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>No tasks assigned</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {report.tasksByProject.map((p) => {
                const pct = p.assignedTasks > 0 ? Math.round((p.completedTasks / p.assignedTasks) * 100) : 0;

                return (
                  <div
                    key={p.projectId}
                    className="px-4 py-3 flex items-center gap-4 hover:bg-(--bg-elevated) cursor-pointer transition-colors"
                    onClick={() => navigate(`/projects/${p.projectId}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-sm font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                          {p.projectName}
                        </p>
                        <Badge variant="role" value={p.projectRole as ProjectRole}>
                          {getProjectRoleLabel(p.projectRole as ProjectRole)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--accent)' }}
                          />
                        </div>
                        <span className="text-xs font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {p.completedTasks}/{p.assignedTasks} done
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
    </div>
  );
}