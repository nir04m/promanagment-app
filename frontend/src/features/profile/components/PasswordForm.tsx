import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

function PasswordInput({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500,
        textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--text-secondary)',
      }}>
        {label}
      </label>
      <input
        type="password"
        {...props}
        style={{
          padding: '9px 12px', borderRadius: '6px',
          border: `1px solid ${error ? 'var(--danger)' : focused ? 'var(--accent)' : 'var(--border)'}`,
          background: 'var(--bg-elevated)', color: 'var(--text-primary)',
          fontFamily: 'DM Mono, monospace', fontSize: '13px', outline: 'none',
          width: '100%', maxWidth: '360px', transition: 'border-color 0.15s',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error && (
        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordForm() {
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiClient.patch('/auth/change-password', data),
    onSuccess: () => {
      reset();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const onSubmit = (data: FormData) =>
    mutation.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword });

  return (
    <div style={{
      padding: '24px', borderRadius: '8px',
      border: '1px solid var(--border)', background: 'var(--bg-surface)',
    }}>
      <div style={{ marginBottom: '20px' }}>
        <p style={{
          fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500,
          textTransform: 'uppercase' as const, letterSpacing: '0.08em',
          color: 'var(--text-muted)', marginBottom: '4px',
        }}>
          Change Password
        </p>
        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Minimum 8 characters with an uppercase letter, number, and special character.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          <PasswordInput
            label="Current Password"
            error={errors.currentPassword?.message}
            autoComplete="current-password"
            {...register('currentPassword')}
          />
          <PasswordInput
            label="New Password"
            error={errors.newPassword?.message}
            autoComplete="new-password"
            {...register('newPassword')}
          />
          <PasswordInput
            label="Confirm New Password"
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="submit"
            disabled={mutation.isPending}
            style={{
              padding: '8px 18px', borderRadius: '6px',
              border: '1px solid var(--accent)', background: 'var(--accent)',
              color: '#fff', fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 500,
              cursor: mutation.isPending ? 'not-allowed' : 'pointer',
              opacity: mutation.isPending ? 0.5 : 1, transition: 'opacity 0.15s',
            }}
          >
            {mutation.isPending ? 'Updating...' : 'Update Password'}
          </button>

          {saved && (
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--success)' }}>
              Password updated successfully
            </span>
          )}

          {mutation.isError && (
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--danger)' }}>
              {(mutation.error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? 'Incorrect current password'}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}