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
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useLogout } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Tooltip } from '@/components/ui/Tooltip';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/reports/me', icon: BarChart3, label: 'My Report' },
];

const adminNavItems = [
  { to: '/users', icon: Users, label: 'Users' },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const logout = useLogout();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside
      className={cn(
        'flex flex-col h-screen border-r transition-all duration-200 shrink-0',
        sidebarCollapsed ? 'w-14' : 'w-52'
      )}
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-between px-3 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        {!sidebarCollapsed && (
          <span className="text-sm font-mono font-medium tracking-widest uppercase" style={{ color: 'var(--text-primary)' }}>
            ProManage
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'p-1.5 rounded border transition-colors hover:bg-(--bg-elevated)',
            sidebarCollapsed && 'mx-auto'
          )}
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Tooltip key={to} content={label} position="right">
            <NavLink
              to={to}
              className={({ isActive }: { isActive: boolean }) =>
                cn(
                  'flex items-center gap-3 px-2 py-2 rounded text-sm font-mono transition-colors duration-150 w-full',
                  isActive
                    ? 'bg-(--accent-subtle) text-(--accent)'
                    : 'text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated)',
                  sidebarCollapsed && 'justify-center'
                )
              }
            >
              <Icon size={16} className="shrink-0" />
              {!sidebarCollapsed && <span>{label}</span>}
            </NavLink>
          </Tooltip>
        ))}

        {isAdmin && adminNavItems.map(({ to, icon: Icon, label }) => (
          <Tooltip key={to} content={label} position="right">
            <NavLink
              to={to}
              className={({ isActive }: { isActive: boolean }) =>
                cn(
                  'flex items-center gap-3 px-2 py-2 rounded text-sm font-mono transition-colors duration-150 w-full',
                  isActive
                    ? 'bg-(--accent-subtle) text-(--accent)'
                    : 'text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated)',
                  sidebarCollapsed && 'justify-center'
                )
              }
            >
              <Icon size={16} className="shrink-0" />
              {!sidebarCollapsed && <span>{label}</span>}
            </NavLink>
          </Tooltip>
        ))}
      </nav>

      {/* User section */}
      <div
        className="border-t p-2"
        style={{ borderColor: 'var(--border)' }}
      >
        {!sidebarCollapsed && (
          <div
            className="flex items-center gap-2 px-2 py-2 rounded mb-1 cursor-pointer hover:bg-(--bg-elevated) transition-colors"
            onClick={() => navigate('/profile')}
          >
            <Avatar name={user?.name ?? ''} avatarUrl={user?.avatarUrl} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.name}
              </p>
              <p className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)' }}>
                {user?.role}
              </p>
            </div>
          </div>
        )}
        <Tooltip content="Sign out" position="right">
          <button
            onClick={() => logout.mutate()}
            className={cn(
              'flex items-center gap-3 px-2 py-2 rounded text-sm font-mono w-full transition-colors hover:bg-(--bg-elevated)',
              sidebarCollapsed && 'justify-center'
            )}
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut size={16} className="shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}