import prisma from '../lib/prisma';

export class OrderItemService {
  async findByOrder(orderId: string) {
    return prisma.orderItem.findMany({ where: { order_id: orderId }, include: { product: { include: { product_images: true } } } });
  }
  async create(data: any) {
    return prisma.orderItem.create({ data });
  }
}
