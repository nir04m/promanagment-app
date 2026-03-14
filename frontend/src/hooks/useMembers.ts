import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '@/api/members';

export function useMembers(projectId: string) {
  return useQuery({
    queryKey: ['members', projectId],
    queryFn: () => membersApi.list(projectId),
    enabled: !!projectId,
    select: (res) => res.data.data,
  });
}

export function useAddMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; projectRole: string }) =>
      membersApi.add(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] }); // add this line
    },
  });
}

export function useUpdateMemberRole(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, projectRole }: { memberId: string; projectRole: string }) =>
      membersApi.updateRole(projectId, memberId, { projectRole }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members', projectId] }),
  });
}

export function useRemoveMember(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => membersApi.remove(projectId, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members', projectId] }),
  });
}