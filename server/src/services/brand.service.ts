import prisma from '../lib/prisma';

export class BrandService {
  async findAll() {
    return prisma.brand.findMany({ where: { is_active: true }, orderBy: { name: 'asc' } });
  }
  async findById(id: string) {
    return prisma.brand.findUnique({ where: { id } });
  }
  async findBySlug(slug: string) {
    return prisma.brand.findUnique({ where: { slug } });
  }
  async create(data: any) {
    return prisma.brand.create({ data });
  }
  async update(id: string, data: any) {
    return prisma.brand.update({ where: { id }, data });
  }
  async delete(id: string) {
    await prisma.brand.update({ where: { id }, data: { is_active: false } });
    return true;
  }
}
