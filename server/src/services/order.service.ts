import prisma from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from './email.service';
import { OrderStatus } from '@prisma/client';
import { AppError } from '../middlewares/error.middleware';

const ORDER_INCLUDE = {
  user: { select: { id: true, name: true, email: true } },
  order_items: { include: { product: { include: { product_images: true } } } },
  shipments: true,
  campaign: true,
};

function normalizeStatus(status?: string): OrderStatus | undefined {
  if (!status) return undefined;
  const map: Record<string, OrderStatus> = {
    processing: OrderStatus.confirmed,
    shipped: OrderStatus.shipping,
  };
  return (map[status] ?? status) as OrderStatus;
}

export class OrderService {
  private emailService = new EmailService();

  private buildAccessWhere(actor?: { id?: string; role?: string }) {
    if (!actor?.id || !actor.role) {
      return {};
    }

    if (actor.role === 'seller') {
      return {
        order_items: {
          some: {
            product: {
              seller_id: actor.id,
            },
          },
        },
      };
    }

    return {};
  }

  async findAll() {
    return prisma.order.findMany({ where: { is_delete: false }, include: ORDER_INCLUDE, orderBy: { created_at: 'desc' } });
  }

  async findAllWithFilters(options: any = {}, actor?: { id?: string; role?: string }) {
    const { page = 1, limit = 10, search, status, date } = options;
    const skip = (page - 1) * limit;
    const where: any = { is_delete: false, ...this.buildAccessWhere(actor) };

    if (status && status !== 'all') where.status = normalizeStatus(status) ?? status;
    if (date) {
      const d = new Date(date);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      where.created_at = { gte: d, lt: next };
    }
    if (search) {
      where.OR = [
        { order_number: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.order.findMany({ where, skip, take: limit, include: ORDER_INCLUDE, orderBy: { created_at: 'desc' } }),
      prisma.order.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, actor?: { id?: string; role?: string }) {
    return prisma.order.findFirst({ where: { id, is_delete: false, ...this.buildAccessWhere(actor) }, include: ORDER_INCLUDE });
  }

  async findByOrderNumber(orderNumber: string, actor?: { id?: string; role?: string }) {
    return prisma.order.findFirst({ where: { order_number: orderNumber, is_delete: false, ...this.buildAccessWhere(actor) }, include: ORDER_INCLUDE });
  }

  async findByUser(userId: string, actor?: { id?: string; role?: string }) {
    return prisma.order.findMany({ where: { user_id: userId, is_delete: false, ...this.buildAccessWhere(actor) }, include: ORDER_INCLUDE, orderBy: { created_at: 'desc' } });
  }

  async createOrder(data: any) {
    const orderNumber = `ORD-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;
    const items = data.items || [];
    const otpCode = this.emailService.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const productIds = items
      .map((item: any) => item.product_id || item.productId)
      .filter((value: unknown): value is string => typeof value === 'string' && value.length > 0);

    if (productIds.length === 0) {
      throw new AppError('Đơn hàng phải có ít nhất một sản phẩm', 400);
    }

    if (productIds.length !== items.length) {
      throw new AppError('Mỗi sản phẩm trong đơn hàng phải có productId hợp lệ', 400);
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        is_delete: false,
      },
      select: {
        id: true,
        seller_id: true,
      },
    });

    if (products.length !== new Set(productIds).size) {
      throw new AppError('Có sản phẩm không tồn tại hoặc đã bị xóa', 400);
    }

    const sellerIds = new Set(
      products
        .map((product) => product.seller_id)
        .filter((sellerId): sellerId is string => Boolean(sellerId))
    );

    if (sellerIds.size !== 1) {
      throw new AppError('Một đơn hàng chỉ được chứa sản phẩm của một seller', 400);
    }

    const order = await prisma.order.create({
      data: {
        order_number: orderNumber,
        user_id: data.user_id || data.userId,
        total: data.total || 0,
        status: normalizeStatus(data.status) ?? OrderStatus.pending_payment,
        payment_status: data.payment_status ?? 'pending',
        campaign_id: data.campaign_id ?? data.campaignId ?? undefined,
        otp_code: otpCode,
        otp_expires_at: otpExpiresAt,
        is_verified: false,
        order_items: items.length ? {
          create: items.map((item: any) => ({
            product_id: item.product_id || item.productId,
            price: item.price,
            quantity: item.quantity,
          })),
        } : undefined,
      },
      include: ORDER_INCLUDE,
    });

    // Send OTP email
    try {
      const user = await prisma.user.findUnique({ where: { id: order.user_id } });
      if (user?.email) {
        await this.emailService.sendOrderOTP(user.email, otpCode, orderNumber, Number(order.total));
      }
    } catch (err) {
      console.error('Failed to send OTP email:', err);
    }

    return order;
  }

  async update(id: string, data: any) {
    const normalized = { ...data };
    if (data.status) normalized.status = normalizeStatus(data.status) ?? data.status;
    return prisma.order.update({ where: { id }, data: normalized, include: ORDER_INCLUDE });
  }

  async delete(id: string) {
    await prisma.order.update({ where: { id }, data: { is_delete: true } });
    return true;
  }

  async verifyOTP(orderId: string, otpCode: string) {
    const order = await this.findById(orderId);
    if (!order) return { success: false, message: 'Đơn hàng không tồn tại' };
    if (order.is_verified) return { success: true, message: 'Đơn hàng đã được xác nhận' };
    if (!order.otp_code) return { success: false, message: 'Mã OTP không hợp lệ' };
    if (new Date() > new Date(order.otp_expires_at!)) return { success: false, message: 'Mã OTP đã hết hạn' };
    if (order.otp_code !== otpCode) return { success: false, message: 'Mã OTP không đúng' };
    await prisma.order.update({ where: { id: orderId }, data: { is_verified: true, otp_code: null } });
    return { success: true, message: 'Xác nhận đơn hàng thành công!' };
  }

  async resendOTP(orderId: string) {
    const order = await this.findById(orderId);
    if (!order) return { success: false, message: 'Đơn hàng không tồn tại' };
    if (order.is_verified) return { success: true, message: 'Đơn hàng đã được xác nhận' };
    const otpCode = this.emailService.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.order.update({ where: { id: orderId }, data: { otp_code: otpCode, otp_expires_at: otpExpiresAt } });
    try {
      const user = await prisma.user.findUnique({ where: { id: order.user_id } });
      if (user?.email) await this.emailService.sendOrderOTP(user.email, otpCode, order.order_number, Number(order.total));
    } catch {
      return { success: false, message: 'Không thể gửi email. Vui lòng thử lại.' };
    }
    return { success: true, message: 'Đã gửi lại mã OTP' };
  }
}
