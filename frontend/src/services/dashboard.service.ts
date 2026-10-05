import type { DashboardSummary } from '../types/api';
import { api } from './api';

export const dashboardService = {
  async getSummary(signal?: AbortSignal): Promise<DashboardSummary> {
    const { data } = await api.get<DashboardSummary>('/dashboard', { signal });
    return data;
  },
};
