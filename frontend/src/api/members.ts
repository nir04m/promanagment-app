import { apiClient } from './client';
import { ApiResponse, Member } from '@/types';

export const membersApi = {
  list: (projectId: string) =>
    apiClient.get<ApiResponse<Member[]>>(`/projects/${projectId}/members`),

  add: (projectId: string, data: { userId: string; projectRole: string }) =>
    apiClient.post<ApiResponse<Member>>(`/projects/${projectId}/members`, data),

  updateRole: (projectId: string, memberId: string, data: { projectRole: string }) =>
    apiClient.patch<ApiResponse<Member>>(`/projects/${projectId}/members/${memberId}/role`, data),

  remove: (projectId: string, memberId: string) =>
    apiClient.delete(`/projects/${projectId}/members/${memberId}`),
};