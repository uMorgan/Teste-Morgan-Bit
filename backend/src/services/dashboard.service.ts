import type { DashboardSummary } from '../models/service-request.model';
import type { IDashboardRepository } from '../repositories/dashboard.repository';

export class DashboardService {
  constructor(private readonly repository: IDashboardRepository) {}

  getSummary(): Promise<DashboardSummary> {
    return this.repository.getSummary();
  }
}
