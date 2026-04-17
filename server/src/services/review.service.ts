import prisma from '../lib/prisma';

export class ReviewService {
  async findAll() {
    return prisma.review.findMany({
      include: { user: { select: { id: true, name: true } }, product: { select: { id: true, name: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.review.findUnique({ where: { id }, include: { user: { select: { id: true, name: true } } } });
  }

  async findByProduct(productId: string) {
    return prisma.review.findMany({
      where: { product_id: productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByUser(userId: string) {
    return prisma.review.findMany({ where: { user_id: userId }, include: { product: { select: { id: true, name: true } } } });
  }

  async getAverageRating(productId: string) {
    const result = await prisma.review.aggregate({ where: { product_id: productId }, _avg: { rating: true }, _count: true });
    return { rating: result._avg.rating ?? 0, count: result._count };
  }

  async create(data: any) {
    const review = await prisma.review.create({ data });
    // Cập nhật rating trung bình
    const result = await prisma.review.aggregate({ where: { product_id: review.product_id }, _avg: { rating: true } });
    await prisma.product.update({ where: { id: review.product_id }, data: { rating: result._avg.rating ?? 0 } });
    return review;
  }

  async delete(id: string) {
    await prisma.review.delete({ where: { id } });
    return true;
  }

  // For BaseController compatibility
  async findAll_paged(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.review.findMany({ skip, take: limit, include: { user: { select: { id: true, name: true } } }, orderBy: { created_at: 'desc' } }),
      prisma.review.count(),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
