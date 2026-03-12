import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useProjectReport } from '@/hooks/useReports';
import { getProjectRoleLabel } from '@/utils/formatters';
import { ProjectRole } from '@/types';

export function ProjectReportPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: report, isLoading, error } = useProjectReport(projectId!);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Project Report" />
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Project Report" />
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
            Report not available or access denied
          </p>
          <Button variant="ghost" onClick={() => navigate(`/projects/${projectId}`)}>
            <ArrowLeft size={14} /> Back to project
          </Button>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    BACKLOG: 'var(--text-muted)',
    TODO: 'var(--text-secondary)',
    IN_PROGRESS: 'var(--accent)',
    IN_REVIEW: 'var(--warning)',
    DONE: 'var(--success)',
  };

  return (
    <div className="flex flex-col h-full">
      <Header title={`${report.projectName} — Report`} subtitle={`${report.totalTasks} total tasks · ${report.memberCount} members`} />

      <div className="flex-1 overflow-y-auto p-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${projectId}`)} className="mb-5">
          <ArrowLeft size={14} /> Back to project
        </Button>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Tasks', value: report.totalTasks },
            { label: 'Completed', value: report.tasksByStatus['DONE'] ?? 0 },
            { label: 'Overdue', value: report.overdueTaskCount },
            { label: 'Completion', value: `${report.completionPercentage}%` },
          ].map(({ label, value }) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Tasks by status */}
          <div
            className="p-4 rounded-lg border"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <h3 className="text-xs font-mono uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
              By Status
            </h3>
            <div className="flex flex-col gap-2.5">
              {Object.entries(report.tasksByStatus).map(([status, count]) => {
                const pct = report.totalTasks > 0 ? (count / report.totalTasks) * 100 : 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="text-xs font-mono w-24 shrink-0" style={{ color: 'var(--text-secondary)' }}>
                      {status}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: statusColors[status] ?? 'var(--text-muted)' }}
                      />
                    </div>
                    <span className="text-xs font-mono w-6 text-right shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tasks by priority */}
          <div
            className="p-4 rounded-lg border"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <h3 className="text-xs font-mono uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
              By Priority
            </h3>
            <div className="flex flex-col gap-2.5">
              {Object.entries(report.tasksByPriority).map(([priority, count]) => {
                const pct = report.totalTasks > 0 ? (count / report.totalTasks) * 100 : 0;
                const colors: Record<string, string> = {
                  LOW: 'var(--success)',
                  MEDIUM: 'var(--warning)',
                  HIGH: 'var(--danger)',
                  CRITICAL: '#dc2626',
                };
                return (
                  <div key={priority} className="flex items-center gap-3">
                    <span className="text-xs font-mono w-24 shrink-0" style={{ color: 'var(--text-secondary)' }}>
                      {priority}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: colors[priority] ?? 'var(--text-muted)' }}
                      />
                    </div>
                    <span className="text-xs font-mono w-6 text-right shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Member contributions */}
        <div
          className="rounded-lg border"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Member Contributions
            </h3>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg-elevated)' }}>
                {['Member', 'Role', 'Assigned', 'Completed', 'In Progress', 'Progress'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-mono uppercase tracking-wide"
                    style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.memberContributions.map((m) => {
                const pct = m.assignedTasks > 0 ? Math.round((m.completedTasks / m.assignedTasks) * 100) : 0;
                return (
                  <tr
                    key={m.userId}
                    className="border-b hover:bg-(--bg-elevated) transition-colors"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={m.name} avatarUrl={m.avatarUrl} size="sm" />
                        <div>
                          <p className="text-xs font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="role" value={m.projectRole as ProjectRole}>
                        {getProjectRoleLabel(m.projectRole as ProjectRole)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{m.assignedTasks}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono" style={{ color: 'var(--success)' }}>{m.completedTasks}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono" style={{ color: 'var(--accent)' }}>{m.inProgressTasks}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--accent)' }}
                          />
                        </div>
                        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
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