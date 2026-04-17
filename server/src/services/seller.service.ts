import prisma from '../lib/prisma';

export class SellerService {
  async getProfile(sellerId: string) {
    const seller = await prisma.seller.findFirst({
      where: { id: sellerId, is_delete: false },
      include: { kyb: true },
    });
    if (!seller) throw new Error('Seller không tồn tại');
    const { password_hash, ...profile } = seller;
    return profile;
  }

  async updateProfile(sellerId: string, data: any) {
    // Không cho phép đổi email/password qua đây
    const { email, password_hash, ...safeData } = data;
    return prisma.seller.update({ where: { id: sellerId }, data: safeData });
  }

  async getProducts(sellerId: string) {
    return prisma.product.findMany({
      where: { seller_id: sellerId, is_delete: false },
      include: { category: true, brand: true, product_images: true },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [sellers, total] = await Promise.all([
      prisma.seller.findMany({
        where: { is_delete: false },
        skip,
        take: limit,
        include: { kyb: true },
        orderBy: { created_at: 'desc' },
      }),
      prisma.seller.count({ where: { is_delete: false } }),
    ]);
    // Strip password_hash
    const data = sellers.map(({ password_hash, ...s }) => s);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const seller = await prisma.seller.findFirst({ where: { id, is_delete: false }, include: { kyb: true } });
    if (!seller) return null;
    const { password_hash, ...profile } = seller;
    return profile;
  }

  async updateStatus(id: string, status: any) {
    return prisma.seller.update({ where: { id }, data: { status } });
  }

  async delete(id: string) {
    await prisma.seller.update({ where: { id }, data: { is_delete: true } });
    return true;
  }
}
