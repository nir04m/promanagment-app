import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useMembers, useAddMember, useUpdateMemberRole, useRemoveMember } from '@/hooks/useMembers';
import { useAuthStore } from '@/stores/authStore';
import { timeAgo } from '@/utils/formatters';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const addSchema = z.object({
  userId: z.string().uuid('Enter a valid user ID'),
  projectRole: z.enum(['PM', 'DESIGNER', 'DEVELOPER', 'QA']),
});
type AddForm = z.infer<typeof addSchema>;

const roleLabels: Record<string, string> = {
  PM: 'Project Manager', DESIGNER: 'Designer', DEVELOPER: 'Developer', QA: 'QA Engineer',
};

const roleColor: Record<string, string> = {
  PM: 'var(--accent)', DESIGNER: 'var(--info)', DEVELOPER: 'var(--success)', QA: 'var(--warning)',
};

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: '6px',
  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
  color: 'var(--text-primary)', fontFamily: 'DM Mono, monospace', fontSize: '13px',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'DM Mono, monospace', fontSize: '11px', fontWeight: 500,
  textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)',
};

const thStyle: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left' as const,
  fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500,
  textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)',
};

export function MembersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('');

  const { data: members, isLoading } = useMembers(projectId!);
  const addMember = useAddMember(projectId!);
  const updateRole = useUpdateMemberRole(projectId!);
  const removeMember = useRemoveMember(projectId!);
  const isAdmin = user?.role === 'ADMIN';

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddForm>({
    resolver: zodResolver(addSchema),
    defaultValues: { projectRole: 'DEVELOPER' },
  });

  const onAdd = (data: AddForm) => {
    addMember.mutate(data, { onSuccess: () => { reset(); setShowAdd(false); } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Header title="Members" subtitle="Team members for this project" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${projectId}`)}>
            <ArrowLeft size={13} /> Back to project
          </Button>
          {isAdmin && (
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus size={13} /> Add Member
            </Button>
          )}
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
                  <th style={thStyle}>Member</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Joined</th>
                  {isAdmin && <th style={thStyle}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members?.map((member, i) => (
                  <tr
                    key={member.id}
                    style={{ borderBottom: i < (members.length - 1) ? '1px solid var(--border-subtle)' : 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                          background: 'var(--accent-subtle)', border: '1px solid rgba(59,110,246,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: 600, color: 'var(--accent)',
                        }}>
                          {member.user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
                            {member.user.name}
                          </p>
                          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {isAdmin && editingId === member.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            style={{ ...selectStyle, width: 'auto', padding: '5px 8px', fontSize: '12px' }}
                          >
                            {Object.entries(roleLabels).map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>
                          <Button size="sm" loading={updateRole.isPending}
                            onClick={() => updateRole.mutate({ memberId: member.id, projectRole: newRole }, { onSuccess: () => setEditingId(null) })}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <span style={{
                          padding: '3px 8px', borderRadius: '4px',
                          border: `1px solid ${roleColor[member.projectRole]}30`,
                          background: `${roleColor[member.projectRole]}10`,
                          fontFamily: 'DM Mono, monospace', fontSize: '10px', fontWeight: 500,
                          color: roleColor[member.projectRole] ?? 'var(--text-muted)',
                          textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                        }}>
                          {roleLabels[member.projectRole] ?? member.projectRole}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {timeAgo(member.joinedAt)}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Button size="sm" variant="ghost"
                            onClick={() => { setEditingId(member.id); setNewRole(member.projectRole); }}>
                            Edit Role
                          </Button>
                          <Button size="sm" variant="danger" loading={removeMember.isPending}
                            onClick={() => removeMember.mutate(member.id)}>
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Member">
        <form onSubmit={handleSubmit(onAdd)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="User ID" placeholder="Paste the user's UUID" error={errors.userId?.message}
            hint="Find user IDs in the Users page" {...register('userId')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>Project Role</label>
            <select style={selectStyle} {...register('projectRole')}>
              {Object.entries(roleLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          {addMember.error && (
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#f87171' }}>
              {(addMember.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to add member'}
            </p>
          )}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <Button variant="secondary" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" loading={addMember.isPending}>Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}