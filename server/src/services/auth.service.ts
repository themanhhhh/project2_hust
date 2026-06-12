import prisma from '../lib/prisma';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthPayload {
  userId: string;
  id?: string;
  email?: string;
  role: string;
  store_name?: string;
}

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(payload: AuthPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  verifyToken(token: string): AuthPayload {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  }

  async register(data: { email: string; password: string; name: string; phone?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error('Email already exists');

    const password_hash = await this.hashPassword(data.password);
    const user = await prisma.user.create({
      data: { email: data.email, password_hash, name: data.name, phone: data.phone },
    });

    const token = this.generateToken({ userId: user.id, email: user.email, role: user.role });
    const { password_hash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.is_active) throw new Error('Invalid email or password');

    const isValid = await this.comparePassword(password, user.password_hash);
    if (!isValid) throw new Error('Invalid email or password');

    const token = this.generateToken({ userId: user.id, email: user.email, role: user.role });
    const { password_hash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    const isValid = await this.comparePassword(currentPassword, user.password_hash);
    if (!isValid) throw new Error('Current password is incorrect');
    if (newPassword.length < 6) throw new Error('New password must be at least 6 characters');
    const newHash = await this.hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { password_hash: newHash } });
  }
}
