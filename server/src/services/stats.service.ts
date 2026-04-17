import prisma from '../lib/prisma';
import { OrderStatus } from '@prisma/client';

export class StatsService {
  async getDashboardStats() {
    const [revenueResult, totalOrders, totalCustomers, totalProducts] = await Promise.all([
      prisma.order.aggregate({
        where: { is_delete: false, status: { not: OrderStatus.cancelled } },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { is_delete: false } }),
      prisma.user.count({ where: { is_delete: false } }),
      prisma.product.count({ where: { is_delete: false } }),
    ]);

    return {
      totalRevenue: Number(revenueResult._sum.total ?? 0),
      totalOrders,
      totalCustomers,
      totalProducts,
      revenueGrowth: 0,
      ordersGrowth: 0,
      customersGrowth: 0,
      productsGrowth: 0,
    };
  }
}
