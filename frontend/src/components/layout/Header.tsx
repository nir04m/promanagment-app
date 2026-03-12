import { Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotifications } from '@/hooks/useNotifications';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuthStore();
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div style={{
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      flexShrink: 0,
    }}>
      <div>
        <h1 style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginTop: '3px',
          }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Notification bell */}
        <button
          style={{
            position: 'relative' as const,
            width: '34px', height: '34px', borderRadius: '6px',
            border: '1px solid var(--border)', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Bell size={15} style={{ color: 'var(--text-muted)' }} />
          {unreadCount > 0 && (
            <div style={{
              position: 'absolute' as const, top: '6px', right: '6px',
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--accent)',
            }} />
          )}
        </button>

        {/* Avatar */}
        <div style={{
          width: '34px', height: '34px', borderRadius: '6px',
          background: 'var(--accent-subtle)', border: '1px solid rgba(59,110,246,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 600,
          color: 'var(--accent)', cursor: 'default',
        }}>
          {user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
      </div>
    </div>
  );
}