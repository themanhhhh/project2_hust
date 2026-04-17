import { Request, Response } from 'express';
import { StatsService } from '../services/stats.service';

export class StatsController {
  private statsService: StatsService;

  constructor() {
    this.statsService = new StatsService();
  }

  /**
   * Get dashboard statistics
   * GET /api/v1/stats/dashboard
   */
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    const stats = await this.statsService.getDashboardStats();

    res.json({
      success: true,
      data: stats,
    });
  }
}
