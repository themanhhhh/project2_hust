import prisma from '../lib/prisma';

export class UserService {
  async findAll(page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { is_delete: false },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: { id: true, email: true, name: true, phone: true, role: true, is_active: true, created_at: true },
      }),
      prisma.user.count({ where: { is_delete: false } }),
    ]);
    return {
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    return prisma.user.findFirst({ where: { id, is_delete: false } });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: any) {
    return prisma.user.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    await prisma.user.update({ where: { id }, data: { is_delete: true } });
    return true;
  }
}
