import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, ArrowRight } from 'lucide-react';
import { useNotifications, useMarkAllAsRead } from '@/hooks/useNotifications';
import { timeAgo } from '@/utils/formatters';
import { NotificationType } from '@/types';
import { Spinner } from '@/components/ui/Spinner';

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

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const { data: notifications, isLoading } = useNotifications();
  const markAllAsRead = useMarkAllAsRead();

  // Mark all as read when panel opens
  useEffect(() => {
    if (isOpen) {
      markAllAsRead.mutate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid immediate close from the bell button click
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 100);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick); };
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const list = notifications ?? [];

  const handleNotifClick = (projectId: string | null) => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
      onClose();
    }
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute' as const,
        top: 'calc(100% + 8px)',
        right: 0,
        width: '360px',
        maxHeight: '480px',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={13} style={{ color: 'var(--text-muted)' }} />
          <span style={{
            fontFamily: 'DM Mono, monospace', fontSize: '12px',
            fontWeight: 500, color: 'var(--text-primary)',
          }}>
            Notifications
          </span>
          {list.filter(n => !n.isRead).length > 0 && (
            <span style={{
              padding: '1px 6px', borderRadius: '10px',
              background: 'var(--accent)', color: '#fff',
              fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 600,
            }}>
              {list.filter(n => !n.isRead).length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '24px', height: '24px', borderRadius: '5px',
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-muted)', cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <X size={12} />
        </button>
      </div>

      {/* Body */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
            <Spinner />
          </div>
        ) : list.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '40px 24px', gap: '8px',
          }}>
            <Bell size={20} style={{ color: 'var(--text-muted)' }} />
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
              No notifications
            </p>
          </div>
        ) : (
          list.map((notif, i) => {
            const projectId = (notif.payload?.projectId as string) ?? null;
            const color = typeColor[notif.type] ?? 'var(--text-muted)';
            const isClickable = !!projectId;

            return (
              <div
                key={notif.id}
                onClick={() => handleNotifClick(projectId)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '12px 16px',
                  borderBottom: i < list.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  background: !notif.isRead ? 'rgba(59,110,246,0.03)' : 'transparent',
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { if (isClickable) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = !notif.isRead
                    ? 'rgba(59,110,246,0.03)' : 'transparent';
                }}
              >
                {/* Dot indicator */}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '7px',
                  background: `${color}14`,
                  border: `1px solid ${color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: '1px',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <span style={{
                      fontFamily: 'DM Mono, monospace', fontSize: '9px', fontWeight: 600,
                      textTransform: 'uppercase' as const, letterSpacing: '0.07em', color,
                    }}>
                      {typeLabel[notif.type] ?? notif.type}
                    </span>
                    {!notif.isRead && (
                      <div style={{
                        width: '4px', height: '4px', borderRadius: '50%',
                        background: 'var(--accent)', flexShrink: 0,
                      }} />
                    )}
                  </div>
                  <p style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '12px',
                    fontWeight: 500, color: 'var(--text-primary)',
                    marginBottom: '2px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                  }}>
                    {notif.title}
                  </p>
                  <p style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '11px',
                    color: 'var(--text-muted)', lineHeight: 1.4,
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {notif.message}
                  </p>
                </div>

                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'flex-end', gap: '6px', flexShrink: 0,
                }}>
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '10px',
                    color: 'var(--text-muted)', whiteSpace: 'nowrap' as const,
                  }}>
                    {timeAgo(notif.createdAt)}
                  </span>
                  {isClickable && <ArrowRight size={11} style={{ color: 'var(--text-muted)' }} />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}