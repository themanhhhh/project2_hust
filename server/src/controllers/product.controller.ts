import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { ProductService } from '../services/product.service';
import { AppError } from '../middlewares/error.middleware';

export class ProductController extends BaseController {
  private productService: ProductService;

  constructor() {
    const productService = new ProductService();
    super(productService);
    this.productService = productService;
  }

  async findBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const product = await this.productService.findBySlug(slug);
    if (!product) throw new AppError('Product not found', 404);
    res.json({ success: true, data: product });
  }

  async findByCategory(req: Request, res: Response): Promise<void> {
    const { categoryId } = req.params;
    const products = await this.productService.findByCategory(categoryId);
    res.json({ success: true, data: products });
  }

  async findByBrand(req: Request, res: Response): Promise<void> {
    const { brandId } = req.params;
    const products = await this.productService.findByBrand(brandId);
    res.json({ success: true, data: products });
  }

  async findByCollection(req: Request, res: Response): Promise<void> {
    const { collectionId } = req.params;
    const products = await this.productService.findByCollection(collectionId);
    res.json({ success: true, data: products });
  }

  // Alias for findById with full relations (Prisma always includes relations)
  async findWithRelations(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const product = await this.productService.findById(id);
    if (!product) throw new AppError('Product not found', 404);
    res.json({ success: true, data: product });
  }
}
