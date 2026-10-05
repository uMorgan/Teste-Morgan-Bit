import type { Request, Response } from 'express';
import type { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  summary = async (_req: Request, res: Response): Promise<void> => {
    const summary = await this.service.getSummary();
    res.status(200).json(summary);
  };
}
