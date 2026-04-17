import { Request, Response } from 'express';
import { SellerService } from '../services/seller.service';

const sellerService = new SellerService();

export class SellerController {
  async getProfile(req: Request, res: Response) {
    try {
      const sellerId = (req as any).user?.id || req.params.id; // Nếu xem người khác thì :id, còn xem chính mình thì từ token
      const profile = await sellerService.getProfile(sellerId);
      res.json({ data: profile });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const sellerId = (req as any).user?.id || req.params.id;
      const updated = await sellerService.updateProfile(sellerId, req.body);
      res.json({ message: 'Cập nhật thành công', data: updated });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getProducts(req: Request, res: Response) {
    try {
      const sellerId = req.params.id;
      const products = await sellerService.getProducts(sellerId);
      res.json({ data: products });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
