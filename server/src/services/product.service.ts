import prisma from '../lib/prisma';

const PRODUCT_INCLUDE = {
  category: true,
  brand: true,
  product_images: { orderBy: { sort_order: 'asc' as const } },
  seller: { select: { id: true, store_name: true } },
};

export class ProductService {
  async findAll(limit?: number) {
    return prisma.product.findMany({
      where: { is_delete: false, is_active: true },
      include: PRODUCT_INCLUDE,
      ...(limit ? { take: limit } : {}),
      orderBy: { created_at: 'desc' } as any,
    });
  }

  async findById(id: string) {
    return prisma.product.findFirst({ where: { id, is_delete: false }, include: PRODUCT_INCLUDE });
  }

  async findBySlug(slug: string) {
    return prisma.product.findFirst({ where: { slug, is_delete: false }, include: PRODUCT_INCLUDE });
  }

  async findBySku(sku: string) {
    return prisma.product.findFirst({ where: { sku }, include: PRODUCT_INCLUDE });
  }

  async findByCategory(categoryId: string) {
    return prisma.product.findMany({ where: { category_id: categoryId, is_delete: false }, include: PRODUCT_INCLUDE });
  }

  async findByBrand(brandId: string) {
    return prisma.product.findMany({ where: { brand_id: brandId, is_delete: false }, include: PRODUCT_INCLUDE });
  }

  async findBySeller(sellerId: string) {
    return prisma.product.findMany({ where: { seller_id: sellerId, is_delete: false }, include: PRODUCT_INCLUDE });
  }

  async findByCollection(collectionId: string) {
    return prisma.product.findMany({
      where: { is_delete: false, collections: { some: { id: collectionId } } },
      include: PRODUCT_INCLUDE,
    });
  }

  async create(data: any) {
    const { images, ...productData } = data;
    const product = await prisma.product.create({
      data: {
        ...productData,
        product_images: images?.length
          ? {
              create: images.map((img: any, i: number) => ({
                image_url: img.url || img.image_url,
                is_primary: i === 0,
                sort_order: img.display_order ?? i,
              })),
            }
          : undefined,
      },
      include: PRODUCT_INCLUDE,
    });
    return product;
  }

  async update(id: string, data: any) {
    const { images, ...productData } = data;
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { product_id: id } });
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((img: any, i: number) => ({
            product_id: id,
            image_url: img.url || img.image_url,
            is_primary: i === 0,
            sort_order: img.display_order ?? i,
          })),
        });
      }
    }
    return prisma.product.update({ where: { id }, data: productData, include: PRODUCT_INCLUDE });
  }

  async delete(id: string) {
    await prisma.product.update({ where: { id }, data: { is_delete: true } });
    return true;
  }
}
