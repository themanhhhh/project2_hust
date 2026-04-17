import { Request, Response } from 'express';
import { SellerAuthService } from '../services/seller-auth.service';

const sellerAuthService = new SellerAuthService();

export class SellerAuthController {
  async register(req: Request, res: Response) {
    try {
      const seller = await sellerAuthService.register(req.body);
      res.status(201).json({ message: 'Đăng ký gian hàng thành công', data: seller });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await sellerAuthService.login(req.body);
      res.json({ message: 'Đăng nhập thành công', data: result });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }
}
