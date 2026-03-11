import { apiClient } from './client';
import { ApiResponse, Notification } from '@/types';

export const notificationsApi = {
  list: () =>
    apiClient.get<ApiResponse<Notification[]>>('/notifications'),

  unreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.patch('/notifications/mark-all-read'),

  delete: (id: string) =>
    apiClient.delete(`/notifications/${id}`),
};