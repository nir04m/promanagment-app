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
  { initial: 'V', label: 'Developer', description: 'Engineering and builds' },
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
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
    }}>

      {/* Left half — Brand panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px 56px',
        background: 'var(--bg-elevated)',
        borderRight: '1px solid var(--border)',
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

        <div style={{ position: 'relative' as const }}>
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

          <h2 style={{
            fontFamily: 'DM Mono, monospace', fontSize: '30px', fontWeight: 500,
            color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '12px', maxWidth: '420px',
          }}>
            One platform for every role on the team
          </h2>
          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: '13px',
            color: 'var(--text-muted)', marginBottom: '36px', lineHeight: 1.7, maxWidth: '380px',
          }}>
            Your admin will assign your project role after registration.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '420px' }}>
            {roles.map(({ initial, label, description }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'var(--bg-overlay)',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '6px',
                  border: '1px solid rgba(59,110,246,0.3)', background: 'var(--accent-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 600, color: 'var(--accent)',
                }}>
                  {initial}
                </div>
                <div>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '3px' }}>
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

        <div style={{ position: 'relative' as const, paddingTop: '28px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Register first, then ask your admin to add you to a project and assign your role.
          </p>
        </div>
      </div>

      {/* Right half — Form */}
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
          <div style={{ marginBottom: '36px' }}>
            <h1 style={{
              fontFamily: 'DM Mono, monospace', fontSize: '28px', fontWeight: 500,
              color: 'var(--text-primary)', marginBottom: '10px', lineHeight: 1.3,
            }}>
              Create your account
            </h1>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Register to join your team on ProManage
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                padding: '10px 14px', borderRadius: '6px',
                border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)',
                color: '#f87171', fontFamily: 'DM Mono, monospace', fontSize: '12px', lineHeight: 1.5,
              }}>
                {(register_.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed'}
              </div>
            )}

            <Button type="submit" loading={register_.isPending} style={{ width: '100%', padding: '11px 16px', marginTop: '4px' }}>
              Create Account
            </Button>
          </form>

          <p style={{
            marginTop: '32px', textAlign: 'center' as const,
            fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-muted)',
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