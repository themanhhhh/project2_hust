import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { OrderService } from '../services/order.service';
import { AppError } from '../middlewares/error.middleware';

export class OrderController extends BaseController {
  private orderService: OrderService;

  constructor() {
    const orderService = new OrderService();
    super(orderService);
    this.orderService = orderService;
  }

  async findAll(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await this.orderService.findAllWithFilters({ page, limit, search: req.query.search as string, status: req.query.status as string, date: req.query.date as string });
    res.json({ success: true, data: result.data, pagination: result.pagination });
  }

  async findByOrderNumber(req: Request, res: Response): Promise<void> {
    const order = await this.orderService.findByOrderNumber(req.params.orderNumber);
    if (!order) throw new AppError('Order not found', 404);
    res.json({ success: true, data: order });
  }

  async findByUser(req: Request, res: Response): Promise<void> {
    const orders = await this.orderService.findByUser(req.params.userId);
    res.json({ success: true, data: orders });
  }

  async findById(req: Request, res: Response): Promise<void> {
    const order = await this.orderService.findById(req.params.id);
    if (!order) throw new AppError('Order not found', 404);
    res.json({ success: true, data: order });
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    const authUser = (req as any).user;
    const userId = authUser?.id || req.body.user_id || req.body.userId;
    if (!userId) throw new AppError('User authentication required', 401);
    const order = await this.orderService.createOrder({ ...req.body, user_id: userId });
    res.status(201).json({ success: true, data: order });
  }

  async verifyOTP(req: Request, res: Response): Promise<void> {
    const { otp } = req.body;
    if (!otp) throw new AppError('Vui lòng nhập mã OTP', 400);
    const result = await this.orderService.verifyOTP(req.params.id, otp);
    res.json({ success: result.success, message: result.message });
  }

  async resendOTP(req: Request, res: Response): Promise<void> {
    const result = await this.orderService.resendOTP(req.params.id);
    res.json({ success: result.success, message: result.message });
  }
}
