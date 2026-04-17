import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { ReviewService } from '../services/review.service';

export class ReviewController extends BaseController {
  private reviewService: ReviewService;

  constructor() {
    const reviewService = new ReviewService();
    super(reviewService);
    this.reviewService = reviewService;
  }

  async findByProduct(req: Request, res: Response): Promise<void> {
    const { productId } = req.params;
    const reviews = await this.reviewService.findByProduct(productId);
    res.json({
      success: true,
      data: reviews,
    });
  }

  async findByUser(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const reviews = await this.reviewService.findByUser(userId);
    res.json({
      success: true,
      data: reviews,
    });
  }

  async getAverageRating(req: Request, res: Response): Promise<void> {
    const { productId } = req.params;
    const rating = await this.reviewService.getAverageRating(productId);
    res.json({
      success: true,
      data: { rating },
    });
  }
}
