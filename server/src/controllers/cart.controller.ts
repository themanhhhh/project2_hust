import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { CartService } from '../services/cart.service';

export class CartController extends BaseController {
  private cartService: CartService;

  constructor() {
    const cartService = new CartService();
    super(cartService);
    this.cartService = cartService;
  }

  async findByUser(req: Request, res: Response): Promise<void> {
    const cart = await this.cartService.findByUser(req.params.userId);
    res.json({ success: true, data: cart });
  }

  async getOrCreateCart(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const cart = await this.cartService.getOrCreate(userId);
    res.json({ success: true, data: cart });
  }

  async addItem(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const { productId, quantity } = req.body;
    await this.cartService.addItem(userId, productId, quantity || 1);
    const cart = await this.cartService.findByUser(userId);
    res.status(201).json({ success: true, data: cart });
  }

  async updateItemQuantity(req: Request, res: Response): Promise<void> {
    const { itemId } = req.params;
    const { quantity } = req.body;
    await this.cartService.updateItem(itemId, quantity);
    res.json({ success: true, message: 'Updated' });
  }

  async removeItem(req: Request, res: Response): Promise<void> {
    const { itemId } = req.params;
    await this.cartService.removeItem(itemId);
    res.json({ success: true, message: 'Removed' });
  }

  async clearCart(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    await this.cartService.clearCart(userId);
    res.json({ success: true, message: 'Cart cleared' });
  }
}
