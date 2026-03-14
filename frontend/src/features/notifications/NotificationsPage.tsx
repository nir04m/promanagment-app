import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight, CheckCheck, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useNotifications, useMarkAllAsRead, useMarkAsRead } from '@/hooks/useNotifications';
import { notificationsApi } from '@/api/notifications';
import { useQueryClient } from '@tanstack/react-query';
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
  TASK_COMMENTED: 'Comment',
  PROJECT_INVITE: 'Project Invite',
  MEMBER_JOINED: 'Member Joined',
  DEADLINE_APPROACHING: 'Deadline',
};

type FilterType = 'all' | 'unread' | NotificationType;

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'TASK_ASSIGNED', label: 'Assigned' },
  { value: 'PROJECT_INVITE', label: 'Invites' },
  { value: 'TASK_COMMENTED', label: 'Comments' },
  { value: 'DEADLINE_APPROACHING', label: 'Deadlines' },
];

export function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useNotifications();
  const markAllAsRead = useMarkAllAsRead();
  const markAsRead = useMarkAsRead();
  const [filter, setFilter] = useState<FilterType>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const all = notifications ?? [];
  const unreadCount = all.filter(n => !n.isRead).length;

  const filtered = all.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    return n.type === filter;
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await notificationsApi.delete(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } finally {
      setDeletingId(null);
    }
  };

  const handleNotifClick = (notifId: string, projectId: string | null, isRead: boolean) => {
    if (!isRead) markAsRead.mutate(notifId);
    if (projectId) navigate(`/projects/${projectId}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Header title="Notifications" subtitle="All your notifications in one place" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          {/* Filter tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {filterOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '5px',
                  border: '1px solid',
                  borderColor: filter === opt.value ? 'var(--accent)' : 'var(--border)',
                  background: filter === opt.value ? 'var(--accent-subtle)' : 'transparent',
                  color: filter === opt.value ? 'var(--accent)' : 'var(--text-muted)',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                  whiteSpace: 'nowrap',
                }}
              >
                {opt.label}
                {opt.value === 'unread' && unreadCount > 0 && (
                  <span style={{
                    marginLeft: '5px', padding: '0 5px', borderRadius: '8px',
                    background: 'var(--accent)', color: '#fff',
                    fontSize: '9px', fontWeight: 700,
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mark all read */}
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              loading={markAllAsRead.isPending}
            >
              <CheckCheck size={13} />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications list */}
        <div style={{
          borderRadius: '8px',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          overflow: 'hidden',
        }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
              <Spinner />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '64px 24px', gap: '12px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bell size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-primary)' }}>
                No notifications
              </p>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                {filter !== 'all' ? 'Try a different filter' : 'You are all caught up'}
              </p>
            </div>
          ) : (
            filtered.map((notif, i) => {
              const projectId = (notif.payload?.projectId as string) ?? null;
              const color = typeColor[notif.type] ?? 'var(--text-muted)';
              const isClickable = !!projectId;
              const isDeleting = deletingId === notif.id;

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif.id, projectId, notif.isRead)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    padding: '16px 20px',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    background: !notif.isRead ? 'rgba(59,110,246,0.03)' : 'transparent',
                    cursor: isClickable ? 'pointer' : 'default',
                    transition: 'background 0.1s',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (isClickable) e.currentTarget.style.background = 'var(--bg-elevated)';
                    const btn = e.currentTarget.querySelector('[data-delete]') as HTMLElement;
                    if (btn) btn.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = !notif.isRead ? 'rgba(59,110,246,0.03)' : 'transparent';
                    const btn = e.currentTarget.querySelector('[data-delete]') as HTMLElement;
                    if (btn) btn.style.opacity = '0';
                  }}
                >
                  {/* Unread indicator bar */}
                  {!notif.isRead && (
                    <div style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: '2px', borderRadius: '1px', background: 'var(--accent)',
                    }} />
                  )}

                  {/* Type icon */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: `${color}14`, border: `1px solid ${color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: '1px',
                  }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '9px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.08em', color,
                      }}>
                        {typeLabel[notif.type] ?? notif.type}
                      </span>
                      <span style={{
                        fontFamily: 'DM Mono, monospace', fontSize: '10px',
                        color: 'var(--text-muted)',
                      }}>
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p style={{
                      fontFamily: 'DM Mono, monospace', fontSize: '13px', fontWeight: 500,
                      color: 'var(--text-primary)', marginBottom: '4px',
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

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {isClickable && (
                      <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />
                    )}
                    <button
                      data-delete
                      onClick={(e) => handleDelete(e, notif.id)}
                      disabled={isDeleting}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '26px', height: '26px', borderRadius: '5px',
                        border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                        color: 'var(--text-muted)', cursor: 'pointer',
                        opacity: 0,
                        transition: 'opacity 0.1s, color 0.1s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                      {isDeleting ? <Spinner size="sm" /> : <Trash2 size={11} />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filtered.length > 0 && (
          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: '11px',
            color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px',
          }}>
            {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
            {filter !== 'all' ? ` matching filter` : ' total'}
          </p>
        )}

      </div>
    </div>
  );
}