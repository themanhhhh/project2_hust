import prisma from '../lib/prisma';

export class CartService {
  async findByUser(userId: string) {
    return prisma.cart.findFirst({
      where: { user_id: userId },
      include: { cart_items: { include: { product: { include: { product_images: true } } } } },
    });
  }

  async getOrCreate(userId: string) {
    let cart = await this.findByUser(userId);
    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id: userId },
        include: { cart_items: { include: { product: { include: { product_images: true } } } } },
      });
    }
    return cart;
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const cart = await this.getOrCreate(userId);
    const existing = await prisma.cartItem.findFirst({ where: { cart_id: cart.id, product_id: productId } });
    if (existing) {
      return prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
    }
    return prisma.cartItem.create({ data: { cart_id: cart.id, product_id: productId, quantity } });
  }

  async updateItem(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
      return null;
    }
    return prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
  }

  async removeItem(cartItemId: string) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return true;
  }

  async clearCart(userId: string) {
    const cart = await this.findByUser(userId);
    if (cart) await prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });
  }

  // For BaseController
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.cart.findMany({ skip, take: limit, include: { cart_items: true } }),
      prisma.cart.count(),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    return prisma.cart.findUnique({ where: { id }, include: { cart_items: { include: { product: true } } } });
  }

  async delete(id: string) {
    await prisma.cart.delete({ where: { id } });
    return true;
  }
}
