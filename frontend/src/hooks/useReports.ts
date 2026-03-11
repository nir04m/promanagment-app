import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports';

export function useProjectReport(projectId: string) {
  return useQuery({
    queryKey: ['reports', 'project', projectId],
    queryFn: () => reportsApi.projectReport(projectId),
    enabled: !!projectId,
    select: (res) => res.data.data,
  });
}

export function useMyReport() {
  return useQuery({
    queryKey: ['reports', 'me'],
    queryFn: () => reportsApi.myReport(),
    select: (res) => res.data.data,
  });
}