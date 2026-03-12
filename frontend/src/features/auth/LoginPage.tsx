import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useLogin } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

const features = [
  'Kanban board with full status tracking',
  'Role-based access — PM, Designer, Developer, QA',
  'Real-time notifications on task assignments',
  'Project reports and member contributions',
];

export function LoginPage() {
  const login = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => login.mutate(data);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
    }}>

      {/* Left half — Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--bg-surface)',
        padding: '48px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '8px',
              border: '1px solid var(--accent)', background: 'var(--accent-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <div style={{ width: '15px', height: '15px', borderRadius: '3px', background: 'var(--accent)' }} />
            </div>
            <span style={{
              fontFamily: 'DM Mono, monospace', fontSize: '13px', fontWeight: 500,
              letterSpacing: '3px', textTransform: 'uppercase' as const, color: 'var(--text-primary)',
            }}>
              ProManage
            </span>
          </div>

          <div style={{ marginBottom: '36px' }}>
            <h1 style={{
              fontFamily: 'DM Mono, monospace', fontSize: '28px', fontWeight: 500,
              color: 'var(--text-primary)', marginBottom: '10px', lineHeight: 1.3,
            }}>
              Welcome back
            </h1>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Sign in to continue to your workspace
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              error={errors.password?.message}
              autoComplete="current-password"
              {...register('password')}
            />

            {login.error && (
              <div style={{
                padding: '10px 14px', borderRadius: '6px',
                border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)',
                color: '#f87171', fontFamily: 'DM Mono, monospace', fontSize: '12px', lineHeight: 1.5,
              }}>
                {(login.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid email or password'}
              </div>
            )}

            <Button type="submit" loading={login.isPending} style={{ width: '100%', padding: '11px 16px', marginTop: '4px' }}>
              Sign In
            </Button>
          </form>

          <p style={{
            marginTop: '32px', textAlign: 'center' as const,
            fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-muted)',
          }}>
            No account?{' '}
            <Link
              to="/register"
              style={{ color: 'var(--accent)', textDecoration: 'none' }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right half — Brand panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px 56px',
        background: 'var(--bg-elevated)',
        borderLeft: '1px solid var(--border)',
        position: 'relative' as const,
        overflow: 'hidden',
      }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute' as const, inset: 0, opacity: 0.04, pointerEvents: 'none' as const,
          backgroundImage: 'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Top accent line */}
        <div style={{
          position: 'absolute' as const, top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--accent) 50%, transparent)',
        }} />

        {/* Top content */}
        <div style={{ position: 'relative' as const }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '6px',
            border: '1px solid rgba(59,110,246,0.3)', background: 'var(--accent-subtle)', marginBottom: '36px',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--accent)', letterSpacing: '0.5px' }}>
              Project Management Platform
            </span>
          </div>

          <h2 style={{
            fontFamily: 'DM Mono, monospace', fontSize: '32px', fontWeight: 500,
            color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '40px', maxWidth: '440px',
          }}>
            Built for teams that ship fast and stay organized
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {features.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '4px',
                  border: '1px solid rgba(59,110,246,0.4)', background: 'var(--accent-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px',
                }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '2px', background: 'var(--accent)' }} />
                </div>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {f}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div style={{
          position: 'relative' as const,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px',
          paddingTop: '32px', borderTop: '1px solid var(--border)',
        }}>
          {[
            { value: 'Tasks', label: 'Tracked per project' },
            { value: 'Roles', label: '4 role types' },
            { value: 'Reports', label: 'Real-time progress' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '15px', fontWeight: 500, color: 'var(--accent)', marginBottom: '5px' }}>
                {value}
              </p>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}