import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { CollectionService } from '../services/collection.service';
import { AppError } from '../middlewares/error.middleware';

export class CollectionController extends BaseController {
  private collectionService: CollectionService;

  constructor() {
    const collectionService = new CollectionService();
    super(collectionService);
    this.collectionService = collectionService;
  }

  async findBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const collection = await this.collectionService.findBySlug(slug);

    if (!collection) {
      throw new AppError('Collection not found', 404);
    }

    res.json({
      success: true,
      data: collection,
    });
  }
}
