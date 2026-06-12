import prisma from '../lib/prisma';
import { OrderStatus } from '@prisma/client';

function normalizeStatus(status?: string): OrderStatus | undefined {
  if (!status) return undefined;
  const map: Record<string, OrderStatus> = {
    processing: OrderStatus.confirmed,
    shipped: OrderStatus.shipping,
  };
  return (map[status] ?? status) as OrderStatus;
}

export class SellerService {
  async getProfile(sellerId: string) {
    const seller = await prisma.seller.findFirst({
      where: { id: sellerId, is_delete: false },
      include: { kyb: true },
    });
    if (!seller) throw new Error('Seller không tồn tại');
    const { password_hash: _password_hash, ...profile } = seller;
    return profile;
  }

  async updateProfile(sellerId: string, data: any) {
    // Không cho phép đổi email/password qua đây
    const { email: _email, password_hash: _password_hash, ...safeData } = data;
    return prisma.seller.update({ where: { id: sellerId }, data: safeData });
  }

  async getProducts(sellerId: string) {
    return prisma.product.findMany({
      where: { seller_id: sellerId, is_delete: false },
      include: { category: true, brand: true, product_images: true },
    });
  }

  async getOrders(sellerId: string, options: any = {}) {
    const { page = 1, limit = 10, search, status, date } = options;
    const skip = (page - 1) * limit;
    const where: any = {
      is_delete: false,
      order_items: {
        some: {
          product: {
            seller_id: sellerId,
          },
        },
      },
    };

    if (status && status !== 'all') where.status = normalizeStatus(status) ?? status;
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      where.created_at = { gte: d, lt: next };
    }
    if (search) {
      where.OR = [
        { order_number: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const include = {
      user: { select: { id: true, name: true, email: true } },
      order_items: {
        where: { product: { seller_id: sellerId } },
        include: { product: { include: { product_images: true } } },
      },
      shipments: true,
      campaign: true,
    };

    const [data, total] = await Promise.all([
      prisma.order.findMany({ where, skip, take: limit, include, orderBy: { created_at: 'desc' } }),
      prisma.order.count({ where }),
    ]);

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async updateOrder(sellerId: string, orderId: string, data: any) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        is_delete: false,
        order_items: {
          some: {
            product: {
              seller_id: sellerId,
            },
          },
        },
      },
      select: { id: true },
    });

    if (!order) {
      throw new Error('Đơn hàng không tồn tại hoặc không thuộc seller');
    }

    const normalized = { ...data };
    if (data.status) {
      normalized.status = normalizeStatus(data.status) ?? data.status;
    }

    return prisma.order.update({
      where: { id: orderId },
      data: normalized,
      include: {
        user: { select: { id: true, name: true, email: true } },
        order_items: {
          where: { product: { seller_id: sellerId } },
          include: { product: { include: { product_images: true } } },
        },
        shipments: true,
        campaign: true,
      },
    });
  }

  async deleteOrder(sellerId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        is_delete: false,
        order_items: {
          some: {
            product: {
              seller_id: sellerId,
            },
          },
        },
      },
      select: { id: true },
    });

    if (!order) {
      throw new Error('Đơn hàng không tồn tại hoặc không thuộc seller');
    }

    await prisma.order.update({ where: { id: orderId }, data: { is_delete: true } });
    return true;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [sellers, total] = await Promise.all([
      prisma.seller.findMany({
        where: { is_delete: false },
        skip,
        take: limit,
        include: { kyb: true },
        orderBy: { created_at: 'desc' },
      }),
      prisma.seller.count({ where: { is_delete: false } }),
    ]);
    // Strip password_hash
    const data = sellers.map(({ password_hash: _password_hash, ...s }) => s);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const seller = await prisma.seller.findFirst({ where: { id, is_delete: false }, include: { kyb: true } });
    if (!seller) return null;
    const { password_hash: _password_hash, ...profile } = seller;
    return profile;
  }

  async updateStatus(id: string, status: any) {
    return prisma.seller.update({ where: { id }, data: { status } });
  }

  async delete(id: string) {
    await prisma.seller.update({ where: { id }, data: { is_delete: true } });
    return true;
  }
}
