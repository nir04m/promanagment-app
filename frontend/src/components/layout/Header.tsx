import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUnreadCount } from '@/hooks/useNotifications';
import { NotificationsPanel } from '@/features/notifications/NotificationsPanel';
import { useAuthStore } from '@/stores/authStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuthStore();
  const { data: unreadCount } = useUnreadCount();
  const navigate = useNavigate();
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: '56px',
      flexShrink: 0,
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-surface)',
    }}>
      {/* Title */}
      <div>
        <h1 style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginTop: '2px',
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Bell with panel */}
        <div style={{ position: 'relative' as const }}>
          <button
            onClick={() => setPanelOpen((p) => !p)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '34px', height: '34px', borderRadius: '6px',
              border: '1px solid var(--border)',
              background: panelOpen ? 'var(--bg-elevated)' : 'transparent',
              color: panelOpen ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.15s',
              position: 'relative' as const,
            }}
            onMouseEnter={(e) => {
              if (!panelOpen) e.currentTarget.style.background = 'var(--bg-elevated)';
            }}
            onMouseLeave={(e) => {
              if (!panelOpen) e.currentTarget.style.background = 'transparent';
            }}
          >
            <Bell size={15} />
            {unreadCount !== undefined && unreadCount > 0 && (
              <span style={{
                position: 'absolute' as const,
                top: '-4px', right: '-4px',
                width: '16px', height: '16px',
                borderRadius: '50%',
                background: 'var(--accent)',
                color: '#fff',
                fontFamily: 'DM Mono, monospace',
                fontSize: '9px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-surface)',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationsPanel
            isOpen={panelOpen}
            onClose={() => setPanelOpen(false)}
          />
        </div>

        {/* Avatar */}
        <div
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            cursor: 'pointer', padding: '4px 8px', borderRadius: '6px',
            border: '1px solid transparent', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.background = 'var(--bg-elevated)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'var(--accent-subtle)',
            border: '1px solid rgba(59,110,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'DM Mono, monospace', fontSize: '11px',
            fontWeight: 600, color: 'var(--accent)', flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span style={{
            fontFamily: 'DM Mono, monospace', fontSize: '12px',
            color: 'var(--text-secondary)',
          }}>
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
}