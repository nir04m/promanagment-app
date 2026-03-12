import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUnreadCount } from '@/hooks/useNotifications';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuthStore();
  const { data: unreadCount } = useUnreadCount();
  const navigate = useNavigate();

  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b shrink-0"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
    >
      <div>
        <h1 className="text-base font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded border transition-colors hover:bg-(--bg-elevated)"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <Bell size={16} />
          {unreadCount !== undefined && unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-mono flex items-center justify-center"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar name={user?.name ?? ''} avatarUrl={user?.avatarUrl} size="sm" />
          {user && (
            <span className="text-xs font-mono hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
              {user.name}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}