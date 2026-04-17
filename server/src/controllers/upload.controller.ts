import { Request, Response } from 'express';
import { PinataService } from '../services/pinata.service';
import { ProductImageService } from '../services/product-image.service';
import { AppError } from '../middlewares/error.middleware';
import prisma from '../lib/prisma';

export class UploadController {
  private pinataService: PinataService;
  private productImageService: ProductImageService;

  constructor() {
    this.pinataService = new PinataService();
    this.productImageService = new ProductImageService();
  }

  async uploadImage(req: Request, res: Response): Promise<void> {
    if (!req.file) throw new AppError('No file uploaded', 400);
    const imageUrl = await this.pinataService.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.status(201).json({ success: true, message: 'Image uploaded successfully', data: { url: imageUrl } });
  }

  async uploadProductImage(req: Request, res: Response): Promise<void> {
    const { productId } = req.params;
    const isPrimary = req.body.isPrimary === 'true' || req.body.isPrimary === true;
    if (!req.file) throw new AppError('No file uploaded', 400);

    const imageUrl = await this.pinataService.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);

    if (isPrimary) {
      const existing = await this.productImageService.findByProduct(productId);
      for (const img of existing) {
        if (img.is_primary) await this.productImageService.update(img.id, { is_primary: false });
      }
    }

    const productImage = await this.productImageService.create({ product_id: productId, image_url: imageUrl, is_primary: isPrimary });
    res.status(201).json({ success: true, message: 'Product image uploaded successfully', data: productImage });
  }

  async deleteProductImage(req: Request, res: Response): Promise<void> {
    const { imageId } = req.params;
    const productImage = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!productImage) throw new AppError('Product image not found', 404);

    const cid = this.pinataService.extractCid(productImage.image_url);
    if (cid) {
      try { await this.pinataService.unpinFile(cid); } catch { /* ignore */ }
    }

    await prisma.productImage.delete({ where: { id: imageId } });
    res.json({ success: true, message: 'Product image deleted successfully' });
  }

  async getProductImages(req: Request, res: Response): Promise<void> {
    const { productId } = req.params;
    const images = await this.productImageService.findByProduct(productId);
    res.json({ success: true, data: images });
  }
}
