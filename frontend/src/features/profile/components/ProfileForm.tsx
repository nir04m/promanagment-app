import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

type FormData = z.infer<typeof schema>;

export function ProfileForm() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
    defaultValues: { name: user?.name ?? '' },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => apiClient.patch('/users/me', data),
    onSuccess: (res) => {
      const updated = res.data.data;
      // Sync into the auth store so sidebar/header update without page refresh
      if (user && accessToken && refreshToken) {
        setAuth(
          { ...user, name: updated.name, avatarUrl: updated.avatarUrl } as User,
          accessToken,
          refreshToken
        );
      }
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div style={{
      padding: '24px',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      background: 'var(--bg-surface)',
    }}>
      <div style={{ marginBottom: '20px' }}>
        <p style={{
          fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500,
          textTransform: 'uppercase' as const, letterSpacing: '0.08em',
          color: 'var(--text-muted)', marginBottom: '4px',
        }}>
          Display Name
        </p>
        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>
          This name is shown across the application to other team members.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
          <label style={{
            fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500,
            textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: 'var(--text-secondary)',
          }}>
            Full Name
          </label>
          <input
            {...register('name')}
            style={{
              padding: '9px 12px', borderRadius: '6px',
              border: `1px solid ${errors.name ? 'var(--danger)' : 'var(--border)'}`,
              background: 'var(--bg-elevated)', color: 'var(--text-primary)',
              fontFamily: 'DM Mono, monospace', fontSize: '13px', outline: 'none',
              width: '100%', maxWidth: '360px', transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { if (!errors.name) e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onBlur={(e) => { if (!errors.name) e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
          {errors.name && (
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--danger)' }}>
              {errors.name.message}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="submit"
            disabled={!isDirty || mutation.isPending}
            style={{
              padding: '8px 18px', borderRadius: '6px',
              border: '1px solid var(--accent)', background: 'var(--accent)',
              color: '#fff', fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 500,
              cursor: !isDirty || mutation.isPending ? 'not-allowed' : 'pointer',
              opacity: !isDirty || mutation.isPending ? 0.5 : 1, transition: 'opacity 0.15s',
            }}
          >
            {mutation.isPending ? 'Saving...' : 'Save Name'}
          </button>

          {saved && (
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--success)' }}>
              Name updated successfully
            </span>
          )}

          {mutation.isError && (
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--danger)' }}>
              {(mutation.error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ?? 'Update failed'}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}