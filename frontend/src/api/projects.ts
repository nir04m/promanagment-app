import { apiClient } from './client';
import { ApiResponse, Project } from '@/types';

export const projectsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    apiClient.get<ApiResponse<Project[]>>('/projects', { params }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Project>>(`/projects/${id}`),

  create: (data: { name: string; description?: string; deadline?: string }) =>
    apiClient.post<ApiResponse<Project>>('/projects', data),

  update: (id: string, data: Partial<{ name: string; description: string; status: string; deadline: string | null }>) =>
    apiClient.patch<ApiResponse<Project>>(`/projects/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/projects/${id}`),
};