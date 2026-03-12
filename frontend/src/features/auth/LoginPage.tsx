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
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg-base)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '900px',
        display: 'flex',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        minHeight: '580px',
      }}>

        {/* Left — Form */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 40px',
          background: 'var(--bg-surface)',
        }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid var(--accent)',
              background: 'var(--accent-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'var(--accent)' }} />
            </div>
            <span style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
            }}>
              ProManage
            </span>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <h1 style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '24px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '6px',
            }}>
              Welcome back
            </h1>
            <p style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '13px',
              color: 'var(--text-muted)',
            }}>
              Sign in to continue to your workspace
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(239,68,68,0.25)',
                background: 'rgba(239,68,68,0.06)',
                color: '#f87171',
                fontFamily: 'DM Mono, monospace',
                fontSize: '12px',
              }}>
                {(login.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid email or password'}
              </div>
            )}

            <Button type="submit" loading={login.isPending} style={{ width: '100%', marginTop: '4px' }}>
              Sign In
            </Button>
          </form>

          <p style={{
            marginTop: '24px',
            textAlign: 'center',
            fontFamily: 'DM Mono, monospace',
            fontSize: '12px',
            color: 'var(--text-muted)',
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

        {/* Right — Brand panel */}
        <div style={{
          width: '380px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 40px',
          background: 'var(--bg-elevated)',
          borderLeft: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Grid bg */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage: 'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

          {/* Top accent line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--accent) 50%, transparent)',
          }} />

          <div style={{ position: 'relative' }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(59,110,246,0.3)',
              background: 'var(--accent-subtle)',
              marginBottom: '24px',
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent)',
              }} />
              <span style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '11px',
                color: 'var(--accent)',
                letterSpacing: '0.5px',
              }}>
                Project Management Platform
              </span>
            </div>

            <h2 style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              marginBottom: '28px',
            }}>
              Built for teams that ship fast and stay organized
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    border: '1px solid rgba(59,110,246,0.4)',
                    background: 'var(--accent-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '2px', background: 'var(--accent)' }} />
                  </div>
                  <span style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                  }}>
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <div style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border)',
          }}>
            {[
              { value: 'Tasks', label: 'Per project' },
              { value: 'Roles', label: '4 role types' },
              { value: 'Reports', label: 'Real-time' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--accent)',
                  marginBottom: '3px',
                }}>
                  {value}
                </p>
                <p style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.4,
                }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}