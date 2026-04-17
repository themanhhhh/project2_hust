import prisma from '../lib/prisma';

export class AddressService {
  async findByUser(userId: string) {
    return prisma.address.findMany({ where: { user_id: userId }, orderBy: { is_default: 'desc' } });
  }
  async findById(id: string) {
    return prisma.address.findUnique({ where: { id } });
  }
  async getDefault(userId: string) {
    return prisma.address.findFirst({ where: { user_id: userId, is_default: true } });
  }
  async create(data: any) {
    return prisma.address.create({ data });
  }
  async update(id: string, data: any) {
    return prisma.address.update({ where: { id }, data });
  }
  async setDefault(id: string, userId: string) {
    await prisma.address.updateMany({ where: { user_id: userId }, data: { is_default: false } });
    return prisma.address.update({ where: { id }, data: { is_default: true } });
  }
  async delete(id: string) {
    await prisma.address.delete({ where: { id } });
    return true;
  }
}
