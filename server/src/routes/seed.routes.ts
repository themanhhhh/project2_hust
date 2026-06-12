import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// POST /api/v1/seed - Seed sample data (dev only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const existingProducts = await prisma.product.count();
    if (existingProducts > 5) {
      return res.json({ success: false, message: 'Database already has data. Skipping seed.', counts: { products: existingProducts } });
    }

    // Clear first
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.brand.deleteMany();

    const [catRacket, catShoes, catClothes] = await Promise.all([
      prisma.category.create({ data: { name: 'Vợt cầu lông', slug: 'vot-cau-long' } }),
      prisma.category.create({ data: { name: 'Giày cầu lông', slug: 'giay-cau-long' } }),
      prisma.category.create({ data: { name: 'Quần áo cầu lông', slug: 'quan-ao-cau-long' } }),
      prisma.category.create({ data: { name: 'Phụ kiện', slug: 'phu-kien' } }),
      prisma.category.create({ data: { name: 'Túi đựng vợt', slug: 'tui-dung-vot' } }),
      prisma.category.create({ data: { name: 'Cầu lông', slug: 'cau-long' } }),
    ]);

    const [brandYonex, brandVictor] = await Promise.all([
      prisma.brand.create({ data: { name: 'Yonex', slug: 'yonex' } }),
      prisma.brand.create({ data: { name: 'Victor', slug: 'victor' } }),
      prisma.brand.create({ data: { name: 'Lining', slug: 'lining' } }),
    ]);

    const products = await Promise.all([
      prisma.product.create({ data: { name: 'Yonex Astrox 100 ZZ', slug: 'yonex-astrox-100-zz', sku: 'YNX-AX100ZZ', price: 4500000, original_price: 5200000, category_id: catRacket.id, brand_id: brandYonex.id, stock_quantity: 25, badge: 'bestseller', rating: 4.9 } }),
      prisma.product.create({ data: { name: 'Yonex Nanoflare 800 Pro', slug: 'yonex-nanoflare-800-pro', sku: 'YNX-NF800P', price: 4200000, category_id: catRacket.id, brand_id: brandYonex.id, stock_quantity: 30, badge: 'new', rating: 4.8 } }),
      prisma.product.create({ data: { name: 'Victor Thruster K Falcon', slug: 'victor-thruster-k-falcon', sku: 'VCT-TKF', price: 3200000, original_price: 3800000, category_id: catRacket.id, brand_id: brandVictor.id, stock_quantity: 18, badge: 'sale', rating: 4.5 } }),
      prisma.product.create({ data: { name: 'Yonex Power Cushion 65 Z3', slug: 'yonex-power-cushion-65-z3', sku: 'YNX-PC65Z3', price: 3200000, category_id: catShoes.id, brand_id: brandYonex.id, stock_quantity: 50, badge: 'bestseller', rating: 4.8 } }),
      prisma.product.create({ data: { name: 'Yonex Men Polo Shirt 2024', slug: 'yonex-men-polo-shirt-2024', sku: 'YNX-MPS24', price: 850000, category_id: catClothes.id, brand_id: brandYonex.id, stock_quantity: 100, badge: 'new', rating: 4.5 } }),
    ]);

    res.json({ success: true, message: 'Seeded successfully!', counts: { categories: 6, brands: 3, products: products.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
