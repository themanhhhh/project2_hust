import prisma from '../lib/prisma';

export class FlashSaleService {
  async findAll() {
    return prisma.flashSale.findMany({ include: { flash_sale_products: { include: { product: true } } }, orderBy: { starts_at: 'desc' } });
  }
  async findById(id: string) {
    return prisma.flashSale.findUnique({ where: { id }, include: { flash_sale_products: { include: { product: { include: { product_images: true } } } } } });
  }
  async findActive() {
    const now = new Date();
    return prisma.flashSale.findMany({
      where: { is_active: true, starts_at: { lte: now }, ends_at: { gte: now } },
      include: { flash_sale_products: { include: { product: { include: { product_images: true } } } } },
    });
  }
  async create(data: any) {
    return prisma.flashSale.create({ data });
  }
  async update(id: string, data: any) {
    return prisma.flashSale.update({ where: { id }, data });
  }
  async delete(id: string) {
    await prisma.flashSale.delete({ where: { id } });
    return true;
  }
  async addProduct(flashSaleId: string, productId: string, salePrice: number, quantity: number) {
    return prisma.flashSaleProduct.create({ data: { flash_sale_id: flashSaleId, product_id: productId, sale_price: salePrice, quantity } });
  }
  async removeProduct(flashSaleProductId: string) {
    await prisma.flashSaleProduct.delete({ where: { id: flashSaleProductId } });
    return true;
  }
}
