import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

export function useDashboardMetrics(from?: string, to?: string) {
  return useQuery({
    queryKey: ['dashboard', from, to],
    queryFn: () => dashboardApi.metrics(from, to).then((r) => r.data),
  });
}
