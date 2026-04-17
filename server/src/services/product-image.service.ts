import prisma from '../lib/prisma';

export class ProductImageService {
  async findByProduct(productId: string) {
    return prisma.productImage.findMany({ where: { product_id: productId }, orderBy: { sort_order: 'asc' } });
  }
  async create(data: any) {
    return prisma.productImage.create({ data });
  }
  async update(id: string, data: any) {
    return prisma.productImage.update({ where: { id }, data });
  }
  async delete(id: string) {
    await prisma.productImage.delete({ where: { id } });
    return true;
  }
  async setPrimary(id: string, productId: string) {
    await prisma.productImage.updateMany({ where: { product_id: productId }, data: { is_primary: false } });
    return prisma.productImage.update({ where: { id }, data: { is_primary: true } });
  }
}
