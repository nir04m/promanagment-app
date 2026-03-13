import { useState } from 'react';
import { Search, Copy, Check } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Spinner } from '@/components/ui/Spinner';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ApiResponse, UserProfile } from '@/types';
import { timeAgo } from '@/utils/formatters';

function useAllUsers(search: string) {
  return useQuery({
    queryKey: ['users', search],
    queryFn: () =>
      apiClient.get<ApiResponse<UserProfile[]>>('/users', {
        params: search ? { search } : undefined,
      }),
    select: (res) => res.data.data,
  });
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left' as const,
  fontFamily: 'DM Mono, monospace',
  fontSize: '10px',
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg-elevated)',
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy ID"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 7px',
        borderRadius: '4px',
        border: '1px solid var(--border)',
        background: 'transparent',
        color: copied ? 'var(--success)' : 'var(--text-muted)',
        fontFamily: 'DM Mono, monospace',
        fontSize: '10px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? 'Copied' : 'Copy ID'}
    </button>
  );
}

export function UsersPage() {
  const [search, setSearch] = useState('');
  const { data: users, isLoading } = useAllUsers(search);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Header title="Users" subtitle="All registered users in the system" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {/* Search */}
        <div style={{ position: 'relative' as const, maxWidth: '320px', marginBottom: '20px' }}>
          <Search size={13} style={{
            position: 'absolute' as const, left: '12px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' as const,
          }} />
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '34px', paddingRight: '12px',
              paddingTop: '8px', paddingBottom: '8px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontFamily: 'DM Mono, monospace',
              fontSize: '13px',
              outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
        </div>

        {/* Info banner */}
        <div style={{
          padding: '12px 16px',
          borderRadius: '6px',
          border: '1px solid rgba(59,110,246,0.2)',
          background: 'rgba(59,110,246,0.06)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}>
          <div style={{
            width: '4px', height: '4px', borderRadius: '50%',
            background: 'var(--accent)', marginTop: '5px', flexShrink: 0,
          }} />
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Copy a user ID to add them as a project member. Navigate to a project, open Members, and paste the ID.
          </p>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <Spinner size="lg" />
          </div>
        ) : (
          <div style={{ borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>System Role</th>
                  <th style={thStyle}>Joined</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>User ID</th>
                </tr>
              </thead>
              <tbody>
                {(users ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px', textAlign: 'center' as const }}>
                      <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {search ? 'No users match your search' : 'No users found'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  (users ?? []).map((u, i) => (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: i < (users ?? []).length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'var(--accent-subtle)',
                            border: '1px solid rgba(59,110,246,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'DM Mono, monospace', fontSize: '12px',
                            fontWeight: 600, color: 'var(--accent)', flexShrink: 0,
                          }}>
                            {u.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p style={{
                              fontFamily: 'DM Mono, monospace', fontSize: '13px',
                              fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px',
                            }}>
                              {u.name}
                            </p>
                            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '4px',
                          border: u.role === 'ADMIN'
                            ? '1px solid rgba(59,110,246,0.3)'
                            : '1px solid var(--border)',
                          background: u.role === 'ADMIN'
                            ? 'rgba(59,110,246,0.08)'
                            : 'var(--bg-overlay)',
                          fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500,
                          color: u.role === 'ADMIN' ? 'var(--accent)' : 'var(--text-muted)',
                          textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                          {timeAgo(u.createdAt)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: u.isActive ? 'var(--success)' : 'var(--text-muted)',
                            flexShrink: 0,
                          }} />
                          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontFamily: 'DM Mono, monospace', fontSize: '10px',
                            color: 'var(--text-muted)',
                            overflow: 'hidden', textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap' as const, maxWidth: '120px',
                          }}>
                            {u.id}
                          </span>
                          <CopyButton value={u.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}