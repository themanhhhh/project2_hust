import prisma from '../lib/prisma';

export class CollectionService {
  async findAll() {
    return prisma.collection.findMany({
      where: { is_active: true },
      include: { products: { include: { product_images: true, category: true, brand: true } } },
    });
  }
  async findById(id: string) {
    return prisma.collection.findUnique({
      where: { id },
      include: { products: { include: { product_images: true, category: true, brand: true } } },
    });
  }
  async findBySlug(slug: string) {
    return prisma.collection.findUnique({
      where: { slug },
      include: { products: { include: { product_images: true, category: true, brand: true } } },
    });
  }
  async create(data: any) {
    const { productIds, ...rest } = data;
    return prisma.collection.create({
      data: {
        ...rest,
        ...(productIds?.length ? { products: { connect: productIds.map((id: string) => ({ id })) } } : {}),
      },
      include: { products: true },
    });
  }
  async update(id: string, data: any) {
    const { productIds, ...rest } = data;
    return prisma.collection.update({
      where: { id },
      data: {
        ...rest,
        ...(productIds !== undefined
          ? { products: { set: productIds.map((pid: string) => ({ id: pid })) } }
          : {}),
      },
      include: { products: true },
    });
  }
  async delete(id: string) {
    await prisma.collection.update({ where: { id }, data: { is_active: false } });
    return true;
  }
}
