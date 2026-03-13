import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/stores/authStore';
import { ProfileForm } from './components/ProfileForm';
import { PasswordForm } from './components/PasswordForm';

export function ProfilePage() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Header title="Profile" subtitle="Manage your account settings" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        <div style={{ maxWidth: '600px' }}>

          {/* Account summary */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '20px 24px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--bg-surface)',
            marginBottom: '20px',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'var(--accent-subtle)', border: '1px solid rgba(59,110,246,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'DM Mono, monospace', fontSize: '18px', fontWeight: 600,
              color: 'var(--accent)', flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: 'DM Mono, monospace', fontSize: '14px', fontWeight: 500,
                color: 'var(--text-primary)', marginBottom: '3px',
              }}>
                {user?.name}
              </p>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                {user?.email}
              </p>
            </div>

            <div style={{
              padding: '4px 10px', borderRadius: '4px',
              border: '1px solid rgba(59,110,246,0.25)', background: 'var(--accent-subtle)',
              fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 600,
              color: 'var(--accent)', textTransform: 'uppercase' as const,
              letterSpacing: '0.07em', flexShrink: 0,
            }}>
              {user?.role}
            </div>
          </div>

          {/* Account ID */}
          <div style={{
            padding: '20px 24px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--bg-surface)',
            marginBottom: '20px',
          }}>
            <p style={{
              fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500,
              textTransform: 'uppercase' as const, letterSpacing: '0.08em',
              color: 'var(--text-muted)', marginBottom: '4px',
            }}>
              Account ID
            </p>
            <p style={{
              fontFamily: 'DM Mono, monospace', fontSize: '12px',
              color: 'var(--text-secondary)', marginBottom: '14px',
            }}>
              Share this ID with an Admin to be added to a project.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                flex: 1, padding: '9px 12px', borderRadius: '6px',
                border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                userSelect: 'all' as const,
              }}>
                {user?.id ?? '—'}
              </div>
              <button
                onClick={handleCopyId}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 14px', borderRadius: '6px',
                  border: `1px solid ${copied ? 'var(--success)' : 'var(--border)'}`,
                  background: copied ? 'rgba(34,197,94,0.08)' : 'var(--bg-elevated)',
                  color: copied ? 'var(--success)' : 'var(--text-secondary)',
                  fontFamily: 'DM Mono, monospace', fontSize: '12px',
                  cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
                }}
                onMouseEnter={(e) => { if (!copied) e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
                onMouseLeave={(e) => { if (!copied) e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Update name */}
          <div style={{ marginBottom: '20px' }}>
            <ProfileForm />
          </div>

          {/* Change password */}
          <PasswordForm />

        </div>
      </div>
    </div>
  );
}