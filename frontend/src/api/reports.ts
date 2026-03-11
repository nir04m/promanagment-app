import { apiClient } from './client';
import { ApiResponse, ProjectReport, MyReport } from '@/types';

export const reportsApi = {
  projectReport: (projectId: string) =>
    apiClient.get<ApiResponse<ProjectReport>>(`/reports/projects/${projectId}`),

  myReport: () =>
    apiClient.get<ApiResponse<MyReport>>('/reports/me'),
};