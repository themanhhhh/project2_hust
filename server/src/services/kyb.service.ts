import prisma from '../lib/prisma';
import { KybStatus, SellerStatus } from '@prisma/client';

export class KybService {
  async submitKyb(sellerId: string, data: any) {
    const existing = await prisma.kyb.findUnique({ where: { seller_id: sellerId } });
    if (existing) {
      if (existing.status === KybStatus.approved) throw new Error('Hồ sơ KYB đã được duyệt');
      if (existing.status === KybStatus.pending) throw new Error('Đang có hồ sơ KYB chờ duyệt');
      // Rejected → resubmit
      return prisma.kyb.update({
        where: { seller_id: sellerId },
        data: { ...data, status: KybStatus.pending, admin_notes: null },
      });
    }
    return prisma.kyb.create({ data: { seller_id: sellerId, ...data, status: KybStatus.pending } });
  }

  async getKyb(sellerId: string) {
    return prisma.kyb.findUnique({ where: { seller_id: sellerId } });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [kybs, total] = await Promise.all([
      prisma.kyb.findMany({ skip, take: limit, include: { seller: { select: { id: true, email: true, store_name: true } } }, orderBy: { created_at: 'desc' } }),
      prisma.kyb.count(),
    ]);
    return { data: kybs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async reviewKyb(kybId: string, status: KybStatus, adminNotes?: string) {
    const kyb = await prisma.kyb.findUnique({ where: { id: kybId } });
    if (!kyb) throw new Error('Không tìm thấy hồ sơ KYB');

    const updatedKyb = await prisma.kyb.update({
      where: { id: kybId },
      data: { status, admin_notes: adminNotes ?? null },
    });

    // Cập nhật trạng thái Seller
    if (status === KybStatus.approved) {
      await prisma.seller.update({ where: { id: kyb.seller_id }, data: { status: SellerStatus.active } });
    } else if (status === KybStatus.rejected) {
      await prisma.seller.update({ where: { id: kyb.seller_id }, data: { status: SellerStatus.suspended } });
    }

    return updatedKyb;
  }
}
