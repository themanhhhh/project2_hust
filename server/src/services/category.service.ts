import prisma from '../lib/prisma';

export class CategoryService {
  async findAll() {
    return prisma.category.findMany({ where: { is_active: true }, include: { children: true }, orderBy: { name: 'asc' } });
  }
  async findRoots() {
    return prisma.category.findMany({ where: { parent_id: null, is_active: true }, include: { children: true } });
  }
  async findById(id: string) {
    return prisma.category.findUnique({ where: { id }, include: { children: true, parent: true } });
  }
  async findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug }, include: { children: true } });
  }
  async create(data: any) {
    return prisma.category.create({ data });
  }
  async update(id: string, data: any) {
    return prisma.category.update({ where: { id }, data });
  }
  async delete(id: string) {
    await prisma.category.update({ where: { id }, data: { is_active: false } });
    return true;
  }
}
