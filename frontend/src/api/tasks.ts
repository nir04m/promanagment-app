import { apiClient } from './client';
import { ApiResponse, Task } from '@/types';

export const tasksApi = {
  list: (projectId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    assigneeId?: string;
    search?: string;
  }) =>
    apiClient.get<ApiResponse<Task[]>>(`/projects/${projectId}/tasks`, { params }),

  get: (taskId: string) =>
    apiClient.get<ApiResponse<Task>>(`/projects/tasks/${taskId}`),

  create: (projectId: string, data: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    assigneeId?: string;
  }) =>
    apiClient.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, data),

  update: (projectId: string, taskId: string, data: Partial<{
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: string | null;
    assigneeId: string | null;
    position: number;
  }>) =>
    apiClient.patch<ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}`, data),

  selfAssign: (projectId: string, taskId: string) =>
    apiClient.patch<ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}/self-assign`),

  delete: (projectId: string, taskId: string) =>
    apiClient.delete(`/projects/${projectId}/tasks/${taskId}`),
};