import { Request, Response } from 'express';
import { KybService } from '../services/kyb.service';

const kybService = new KybService();

export class KybController {
  async submitKyb(req: Request, res: Response) {
    try {
      const sellerId = (req as any).user?.id || req.body.seller_id;
      const kyb = await kybService.submitKyb(sellerId, req.body);
      res.status(201).json({ message: 'Nộp hồ sơ thành công', data: kyb });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getKyb(req: Request, res: Response) {
    try {
      const sellerId = (req as any).user?.id || req.params.sellerId;
      const kyb = await kybService.getKyb(sellerId);
      if (!kyb) {
        res.status(404).json({ message: 'Chưa có hồ sơ KYB' });
        return;
      }
      res.json({ data: kyb });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async reviewKyb(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;
      const result = await kybService.reviewKyb(id, status, admin_notes);
      res.json({ message: 'Đã xét duyệt KYB', data: result });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
