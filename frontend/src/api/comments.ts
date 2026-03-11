import { apiClient } from './client';
import { ApiResponse, Comment } from '@/types';

export const commentsApi = {
  list: (taskId: string) =>
    apiClient.get<ApiResponse<Comment[]>>(`/tasks/${taskId}/comments`),

  create: (taskId: string, data: { content: string }) =>
    apiClient.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, data),

  update: (taskId: string, commentId: string, data: { content: string }) =>
    apiClient.patch<ApiResponse<Comment>>(`/tasks/${taskId}/comments/${commentId}`, data),

  delete: (taskId: string, commentId: string) =>
    apiClient.delete(`/tasks/${taskId}/comments/${commentId}`),
};