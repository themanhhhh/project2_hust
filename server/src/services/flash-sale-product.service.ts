import prisma from '../lib/prisma';

export class FlashSaleProductService {
  async findByFlashSale(flashSaleId: string) {
    return prisma.flashSaleProduct.findMany({ where: { flash_sale_id: flashSaleId }, include: { product: { include: { product_images: true } } } });
  }
  async create(data: any) {
    return prisma.flashSaleProduct.create({ data });
  }
  async update(id: string, data: any) {
    return prisma.flashSaleProduct.update({ where: { id }, data });
  }
  async delete(id: string) {
    await prisma.flashSaleProduct.delete({ where: { id } });
    return true;
  }
}
