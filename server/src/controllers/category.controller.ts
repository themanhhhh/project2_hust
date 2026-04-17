import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { CategoryService } from '../services/category.service';
import { AppError } from '../middlewares/error.middleware';

export class CategoryController extends BaseController {
  private categoryService: CategoryService;

  constructor() {
    const categoryService = new CategoryService();
    super(categoryService);
    this.categoryService = categoryService;
  }

  async findBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const category = await this.categoryService.findBySlug(slug);

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.json({
      success: true,
      data: category,
    });
  }

  async findRootCategories(req: Request, res: Response): Promise<void> {
    const categories = await this.categoryService.findRoots();
    res.json({
      success: true,
      data: categories,
    });
  }
}
