import prisma from '../lib/prisma';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export class SellerAuthService {
  async register(data: any) {
    const existing = await prisma.seller.findFirst({
      where: { OR: [{ email: data.email }, { store_name: data.store_name }] },
    });
    if (existing) throw new Error('Email hoặc tên cửa hàng đã tồn tại');

    const password_hash = await bcrypt.hash(data.password, 10);
    const seller = await prisma.seller.create({
      data: { email: data.email, password_hash, store_name: data.store_name, description: data.description },
    });

    const { password_hash: _, ...sellerWithoutPassword } = seller;
    return sellerWithoutPassword;
  }

  async login(data: any) {
    const seller = await prisma.seller.findUnique({ where: { email: data.email } });
    if (!seller || !seller.is_active || seller.is_delete) {
      throw new Error('Tài khoản không tồn tại hoặc đã bị khóa');
    }

    const valid = await bcrypt.compare(data.password, seller.password_hash);
    if (!valid) throw new Error('Sai mật khẩu');

    const token = jwt.sign(
      {
        id: seller.id,
        userId: seller.id,
        email: seller.email,
        role: 'seller',
        store_name: seller.store_name,
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    return {
      token,
      seller: { id: seller.id, email: seller.email, store_name: seller.store_name, status: seller.status },
    };
  }
}
