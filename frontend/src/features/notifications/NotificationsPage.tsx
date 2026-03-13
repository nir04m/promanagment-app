import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useNotifications, useMarkAllAsRead } from '@/hooks/useNotifications';
import { timeAgo } from '@/utils/formatters';
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
  TASK_ASSIGNED: 'Task Assigned',
  TASK_UPDATED: 'Task Updated',
  TASK_COMMENTED: 'New Comment',
  PROJECT_INVITE: 'Project Invite',
  MEMBER_JOINED: 'Member Joined',
  DEADLINE_APPROACHING: 'Deadline',
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications();
  const markAllAsRead = useMarkAllAsRead();

  // Auto-mark all as read when page mounts
  useEffect(() => {
    markAllAsRead.mutate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getProjectIdFromPayload = (payload: Record<string, unknown> | null): string | null => {
    if (!payload) return null;
    return (payload.projectId as string) ?? null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Header title="Notifications" subtitle="Your recent activity and updates" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
              <Spinner size="lg" />
            </div>
          ) : (notifications ?? []).length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '64px 24px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '14px',
              }}>
                <Bell size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '13px',
                color: 'var(--text-muted)', marginBottom: '4px',
              }}>
                No notifications yet
              </p>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                Activity on your tasks and projects will appear here
              </p>
            </div>
          ) : (
            <div style={{
              borderRadius: '8px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              background: 'var(--bg-surface)',
            }}>
              {(notifications ?? []).map((notif, i) => {
                const projectId = getProjectIdFromPayload(notif.payload);
                const color = typeColor[notif.type] ?? 'var(--text-muted)';

                return (
                  <div
                    key={notif.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      padding: '16px 18px',
                      borderBottom: i < (notifications ?? []).length - 1
                        ? '1px solid var(--border-subtle)'
                        : 'none',
                      background: notif.isRead ? 'transparent' : 'rgba(59,110,246,0.03)',
                      transition: 'background 0.15s',
                      cursor: projectId ? 'pointer' : 'default',
                    }}
                    onClick={() => { if (projectId) navigate(`/projects/${projectId}`); }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = notif.isRead
                        ? 'transparent'
                        : 'rgba(59,110,246,0.03)';
                    }}
                  >
                    {/* Indicator */}
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: `${color}14`,
                      border: `1px solid ${color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: '1px',
                    }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color }} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500,
                          textTransform: 'uppercase' as const, letterSpacing: '0.07em',
                          color,
                        }}>
                          {typeLabel[notif.type] ?? notif.type}
                        </span>
                        {!notif.isRead && (
                          <div style={{
                            width: '5px', height: '5px', borderRadius: '50%',
                            background: 'var(--accent)', flexShrink: 0,
                          }} />
                        )}
                      </div>
                      <p style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '13px',
                        fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px',
                      }}>
                        {notif.title}
                      </p>
                      <p style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '12px',
                        color: 'var(--text-muted)', lineHeight: 1.5,
                      }}>
                        {notif.message}
                      </p>
                    </div>

                    {/* Right */}
                    <div style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'flex-end', gap: '8px', flexShrink: 0,
                    }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-muted)' }}>
                        {timeAgo(notif.createdAt)}
                      </span>
                      {projectId && (
                        <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </div>
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