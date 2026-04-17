import { Request, Response } from 'express';
import { AppError } from '../middlewares/error.middleware';

// Generic base controller — services phải implement findAll, findById, create, update, delete
export abstract class BaseController {
  protected service: any;

  constructor(service: any) {
    this.service = service;
  }

  async findAll(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const result = await this.service.findAll(page, limit);

    if (result && typeof result === 'object' && 'data' in result) {
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } else {
      res.json({ success: true, data: result });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const entity = await this.service.findById(id);
    if (!entity) throw new AppError('Resource not found', 404);
    res.json({ success: true, data: entity });
  }

  async create(req: Request, res: Response): Promise<void> {
    const entity = await this.service.create(req.body);
    res.status(201).json({ success: true, data: entity });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const entity = await this.service.update(id, req.body);
    if (!entity) throw new AppError('Resource not found', 404);
    res.json({ success: true, data: entity });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const success = await this.service.delete(id);
    if (!success) throw new AppError('Resource not found', 404);
    res.json({ success: true, message: 'Deleted successfully' });
  }
}
