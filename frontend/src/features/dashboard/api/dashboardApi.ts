import api from '../../../lib/axios';

export interface DashboardMetrics {
  createdVsClosed: Array<{ month: string; created: number; closed: number }>;
  byStatus: Array<{ status: string; count: number }>;
}

export const dashboardApi = {
  metrics: (from?: string, to?: string) =>
    api.get<DashboardMetrics>('/dashboard/metrics', { params: { from, to } }),
};
