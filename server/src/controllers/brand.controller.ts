import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { BrandService } from '../services/brand.service';
import { AppError } from '../middlewares/error.middleware';

export class BrandController extends BaseController {
  private brandService: BrandService;

  constructor() {
    const brandService = new BrandService();
    super(brandService);
    this.brandService = brandService;
  }

  async findBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const brand = await this.brandService.findBySlug(slug);

    if (!brand) {
      throw new AppError('Brand not found', 404);
    }

    res.json({
      success: true,
      data: brand,
    });
  }
}
