import prisma from '../lib/prisma';

export class CartItemService {
  async findByCart(cartId: string) {
    return prisma.cartItem.findMany({ where: { cart_id: cartId }, include: { product: { include: { product_images: true } } } });
  }
  async create(data: any) {
    return prisma.cartItem.create({ data });
  }
  async update(id: string, quantity: number) {
    return prisma.cartItem.update({ where: { id }, data: { quantity } });
  }
  async delete(id: string) {
    await prisma.cartItem.delete({ where: { id } });
    return true;
  }
}
