import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useRegister } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
});

type FormData = z.infer<typeof schema>;

const roles = [
  { initial: 'P', label: 'Project Manager', description: 'Creates projects, assigns tasks' },
  { initial: 'D', label: 'Designer', description: 'UI/UX work and assets' },
  { initial: 'D', label: 'Developer', description: 'Engineering and builds' },
  { initial: 'Q', label: 'QA Engineer', description: 'Testing and quality assurance' },
];

export function RegisterPage() {
  const register_ = useRegister();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => register_.mutate(data);

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
        minHeight: '600px',
      }}>

        {/* Left — Brand panel */}
        <div style={{
          width: '360px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 36px',
          background: 'var(--bg-elevated)',
          borderRight: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage: 'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--accent) 50%, transparent)',
          }} />

          <div style={{ position: 'relative' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                border: '1px solid var(--accent)',
                background: 'var(--accent-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'var(--accent)' }} />
              </div>
              <span style={{
                fontFamily: 'DM Mono, monospace', fontSize: '13px',
                fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase',
                color: 'var(--text-primary)',
              }}>
                ProManage
              </span>
            </div>

            <h2 style={{
              fontFamily: 'DM Mono, monospace', fontSize: '17px',
              fontWeight: 500, color: 'var(--text-primary)',
              lineHeight: 1.5, marginBottom: '8px',
            }}>
              One platform for every role on the team
            </h2>
            <p style={{
              fontFamily: 'DM Mono, monospace', fontSize: '12px',
              color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6,
            }}>
              Your admin will assign you a project role after registration.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {roles.map(({ initial, label, description }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-overlay)',
                }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '6px',
                    border: '1px solid rgba(59,110,246,0.3)',
                    background: 'var(--accent-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontFamily: 'DM Mono, monospace', fontSize: '11px',
                    fontWeight: 600, color: 'var(--accent)',
                  }}>
                    {initial}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '1px' }}>
                      {label}
                    </p>
                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            position: 'relative',
            paddingTop: '20px',
            borderTop: '1px solid var(--border)',
          }}>
            <p style={{
              fontFamily: 'DM Mono, monospace', fontSize: '11px',
              color: 'var(--text-muted)', lineHeight: 1.6,
            }}>
              Register first, then ask your admin to add you to a project and assign your role.
            </p>
          </div>
        </div>

        {/* Right — Form */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 40px',
          background: 'var(--bg-surface)',
        }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{
              fontFamily: 'DM Mono, monospace', fontSize: '24px',
              fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px',
            }}>
              Create your account
            </h1>
            <p style={{
              fontFamily: 'DM Mono, monospace', fontSize: '13px',
              color: 'var(--text-muted)',
            }}>
              Register to join your team on ProManage
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Full Name"
              placeholder="Your full name"
              error={errors.name?.message}
              autoComplete="name"
              {...register('name')}
            />
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
              placeholder="Min 8 chars, uppercase, number, symbol"
              error={errors.password?.message}
              autoComplete="new-password"
              {...register('password')}
            />

            {register_.error && (
              <div style={{
                padding: '10px 12px', borderRadius: '6px',
                border: '1px solid rgba(239,68,68,0.25)',
                background: 'rgba(239,68,68,0.06)',
                color: '#f87171',
                fontFamily: 'DM Mono, monospace', fontSize: '12px',
              }}>
                {(register_.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed'}
              </div>
            )}

            <Button type="submit" loading={register_.isPending} style={{ width: '100%', marginTop: '4px' }}>
              Create Account
            </Button>
          </form>

          <p style={{
            marginTop: '24px', textAlign: 'center',
            fontFamily: 'DM Mono, monospace', fontSize: '12px',
            color: 'var(--text-muted)',
          }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: 'var(--accent)', textDecoration: 'none' }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}