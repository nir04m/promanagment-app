import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useMembers, useAddMember, useUpdateMemberRole, useRemoveMember } from '@/hooks/useMembers';
import { useAuthStore } from '@/stores/authStore';
import { ProjectRole } from '@/types';
import { getProjectRoleLabel, timeAgo } from '@/utils/formatters';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const addSchema = z.object({
  userId: z.string().uuid('Enter a valid user ID'),
  projectRole: z.enum(['PM', 'DESIGNER', 'DEVELOPER', 'QA']),
});

type AddForm = z.infer<typeof addSchema>;

const roleOptions = [
  { value: 'PM', label: 'Project Manager' },
  { value: 'DESIGNER', label: 'Designer' },
  { value: 'DEVELOPER', label: 'Developer' },
  { value: 'QA', label: 'QA Engineer' },
];

export function MembersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>('');

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
    <div className="flex flex-col h-full">
      <Header title="Members" subtitle={`Team members for this project`} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${projectId}`)}>
            <ArrowLeft size={14} /> Back to project
          </Button>
          {isAdmin && (
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Add Member
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: 'var(--border)' }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--bg-surface)' }}>
                  {['Member', 'Role', 'Joined', ...(isAdmin ? ['Actions'] : [])].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wide"
                      style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members?.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b hover:bg-(--bg-elevated) transition-colors"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={member.user.name} avatarUrl={member.user.avatarUrl} size="sm" />
                        <div>
                          <p className="text-sm font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                            {member.user.name}
                          </p>
                          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin && editingMemberId === member.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="px-2 py-1 text-xs rounded border bg-transparent outline-none font-mono"
                            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                          >
                            {roleOptions.map((r) => (
                              <option key={r.value} value={r.value} style={{ background: 'var(--bg-elevated)' }}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            onClick={() => {
                              updateRole.mutate(
                                { memberId: member.id, projectRole: newRole },
                                { onSuccess: () => setEditingMemberId(null) }
                              );
                            }}
                            loading={updateRole.isPending}
                          >
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingMemberId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="role" value={member.projectRole as ProjectRole}>
                          {getProjectRoleLabel(member.projectRole as ProjectRole)}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {timeAgo(member.joinedAt)}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingMemberId(member.id);
                              setNewRole(member.projectRole);
                            }}
                          >
                            Edit Role
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => removeMember.mutate(member.id)}
                            loading={removeMember.isPending}
                          >
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
        <form onSubmit={handleSubmit(onAdd)} className="flex flex-col gap-4">
          <Input
            label="User ID"
            placeholder="Paste the user's UUID"
            error={errors.userId?.message}
            hint="Go to Admin users list to copy a user's ID"
            {...register('userId')}
          />
          <Select
            label="Project Role"
            options={roleOptions}
            {...register('projectRole')}
          />
          {addMember.error && (
            <p className="text-xs font-mono text-red-400">
              {(addMember.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to add member'}
            </p>
          )}
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="secondary" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" loading={addMember.isPending}>Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}