import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useLogout } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/reports/me', icon: BarChart3, label: 'My Report' },
];

const ADMIN_NAV_ITEMS = [
  { to: '/users', icon: Users, label: 'Users' },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const logout = useLogout();
  const navigate = useNavigate();
  const [logoutHovered, setLogoutHovered] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const allItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  const width = sidebarCollapsed ? '60px' : '220px';

  return (
    <aside style={{
      width,
      minWidth: width,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      borderRight: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      transition: 'width 0.2s ease, min-width 0.2s ease',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Logo row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        padding: '14px 12px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {!sidebarCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '5px',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 700, color: '#fff' }}>P</span>
            </div>
            <span style={{
              fontFamily: 'DM Mono, monospace', fontSize: '12px',
              fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase' as const, color: 'var(--text-primary)',
            }}>
              ProManage
            </span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '24px', height: '24px', borderRadius: '5px',
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-muted)', cursor: 'pointer',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        {allItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={sidebarCollapsed ? label : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: sidebarCollapsed ? '9px' : '9px 10px',
              borderRadius: '6px',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              fontFamily: 'DM Mono, monospace',
              fontSize: '12px',
              fontWeight: 500,
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              background: isActive ? 'var(--accent-subtle)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
              border: '1px solid',
              borderColor: isActive ? 'rgba(59,110,246,0.2)' : 'transparent',
            })}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              if (!el.style.background.includes('accent-subtle')) {
                el.style.background = 'var(--bg-elevated)';
                el.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              if (!el.style.background.includes('accent-subtle')) {
                el.style.background = 'transparent';
                el.style.color = 'var(--text-muted)';
              }
            }}
          >
            <Icon size={15} style={{ flexShrink: 0 }} />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '8px', flexShrink: 0 }}>
        {!sidebarCollapsed && (
          <div
            onClick={() => navigate('/profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 10px', borderRadius: '6px',
              cursor: 'pointer', marginBottom: '4px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'var(--accent-subtle)', border: '1px solid rgba(59,110,246,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'DM Mono, monospace', fontSize: '11px', fontWeight: 600,
              color: 'var(--accent)', flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 500,
                color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.name}
              </p>
              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-muted)',
                textTransform: 'uppercase' as const, letterSpacing: '0.05em',
              }}>
                {user?.role}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => logout.mutate()}
          title={sidebarCollapsed ? 'Sign Out' : undefined}
          style={{
            display: 'flex', alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            gap: '10px', width: '100%',
            padding: sidebarCollapsed ? '9px' : '9px 10px',
            borderRadius: '6px', border: 'none',
            background: logoutHovered ? 'rgba(239,68,68,0.08)' : 'transparent',
            color: logoutHovered ? '#f87171' : 'var(--text-muted)',
            fontFamily: 'DM Mono, monospace', fontSize: '12px',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={() => setLogoutHovered(true)}
          onMouseLeave={() => setLogoutHovered(false)}
        >
          <LogOut size={15} style={{ flexShrink: 0 }} />
          {!sidebarCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}