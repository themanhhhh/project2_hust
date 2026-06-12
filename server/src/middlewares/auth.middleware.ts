import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthPayload } from '../services/auth.service';
import { AppError } from './error.middleware';
import { UserRole } from '../enums';
import prisma from '../lib/prisma';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId: string;
        email?: string;
        role: string;
        store_name?: string;
      };
    }
  }
}

function mapAuthPayloadToRequestUser(payload: AuthPayload) {
  const identityId = payload.userId || payload.id;

  if (!identityId) {
    throw new AppError('Invalid token payload', 401);
  }

  return {
    id: identityId,
    userId: identityId,
    email: payload.email,
    role: payload.role,
    store_name: payload.store_name,
  };
}

export type AppRole = UserRole | 'seller';

function isAdmin(req: Request): boolean {
  return req.user?.role === UserRole.ADMIN;
}

async function loadOrderAccessContext(where: { id?: string; order_number?: string }) {
  return prisma.order.findFirst({
    where: { ...where, is_delete: false },
    select: {
      id: true,
      user_id: true,
      order_items: {
        select: {
          product: {
            select: {
              seller_id: true,
            },
          },
        },
      },
    },
  });
}

function sellerOwnsOrder(order: Awaited<ReturnType<typeof loadOrderAccessContext>>, sellerId: string): boolean {
  if (!order) {
    return false;
  }

  const sellerIds = new Set(
    order.order_items
      .map((item) => item.product?.seller_id)
      .filter((value): value is string => Boolean(value))
  );

  return sellerIds.size === 1 && sellerIds.has(sellerId);
}

const authService = new AuthService();

/**
 * Middleware to authenticate user via JWT token
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('No authorization token provided', 401);
    }

    // Check Bearer format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AppError('Invalid authorization format. Use: Bearer <token>', 401);
    }

    const token = parts[1];

    // Verify token
    const payload: AuthPayload = authService.verifyToken(token);

    // Attach user info to request
    req.user = mapAuthPayloadToRequestUser(payload);

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    // JWT verification errors
    next(new AppError('Invalid or expired token', 401));
  }
}

/**
 * Middleware to check user role
 */
export function authorize(...allowedRoles: AppRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const userRole = req.user.role as UserRole;
    
    if (!allowedRoles.includes(userRole)) {
      next(new AppError('You do not have permission to perform this action', 403));
      return;
    }

    next();
  };
}

export function requireSelfOrAdmin(paramName = 'userId') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    if (isAdmin(req) || req.user.id === req.params[paramName]) {
      next();
      return;
    }

    next(new AppError('You do not have permission to access this resource', 403));
  };
}

export function requireActiveSeller(options: { allowAdmin?: boolean } = {}) {
  const { allowAdmin = true } = options;

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        next(new AppError('Authentication required', 401));
        return;
      }

      if (allowAdmin && isAdmin(req)) {
        next();
        return;
      }

      if (req.user.role !== 'seller') {
        next(new AppError('Seller authentication required', 403));
        return;
      }

      const seller = await prisma.seller.findFirst({
        where: {
          id: req.user.id,
          is_delete: false,
          is_active: true,
          status: 'active',
        },
        select: { id: true },
      });

      if (!seller) {
        next(new AppError('Seller account is not active', 403));
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function attachSellerIdToBody(fieldName = 'seller_id') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.user?.role === 'seller') {
      req.body[fieldName] = req.user.id;
    }

    next();
  };
}

export function requireProductAccess(paramName = 'id') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        next(new AppError('Authentication required', 401));
        return;
      }

      if (isAdmin(req)) {
        next();
        return;
      }

      if (req.user.role !== 'seller') {
        next(new AppError('Seller authentication required', 403));
        return;
      }

      const product = await prisma.product.findFirst({
        where: { id: req.params[paramName], is_delete: false },
        select: { seller_id: true },
      });

      if (!product) {
        next(new AppError('Product not found', 404));
        return;
      }

      if (product.seller_id !== req.user.id) {
        next(new AppError('You do not have permission to access this product', 403));
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireOrderAccess(options: { paramName?: string; byOrderNumber?: boolean; allowCustomer?: boolean; allowSeller?: boolean; allowAdmin?: boolean } = {}) {
  const {
    paramName = 'id',
    byOrderNumber = false,
    allowCustomer = true,
    allowSeller = true,
    allowAdmin = true,
  } = options;

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        next(new AppError('Authentication required', 401));
        return;
      }

      if (allowAdmin && isAdmin(req)) {
        next();
        return;
      }

      const value = req.params[paramName];
      const order = await loadOrderAccessContext(byOrderNumber ? { order_number: value } : { id: value });

      if (!order) {
        next(new AppError('Order not found', 404));
        return;
      }

      if (allowCustomer && req.user.role === UserRole.CUSTOMER && order.user_id === req.user.id) {
        next();
        return;
      }

      if (allowSeller && req.user.role === 'seller' && sellerOwnsOrder(order, req.user.id)) {
        next();
        return;
      }

      next(new AppError('You do not have permission to access this order', 403));
    } catch (error) {
      next(error);
    }
  };
}

export function requireTrackingAccess(paramName = 'trackingNumber') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        next(new AppError('Authentication required', 401));
        return;
      }

      if (isAdmin(req)) {
        next();
        return;
      }

      if (req.user.role !== 'seller') {
        next(new AppError('Seller authentication required', 403));
        return;
      }

      const shipment = await prisma.shipment.findFirst({
        where: { tracking_number: req.params[paramName] },
        select: {
          id: true,
          order: {
            select: {
              user_id: true,
              order_items: {
                select: {
                  product: {
                    select: {
                      seller_id: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!shipment) {
        next(new AppError('Shipment not found', 404));
        return;
      }

      if (!sellerOwnsOrder({
        id: shipment.id,
        user_id: shipment.order.user_id,
        order_items: shipment.order.order_items,
      }, req.user.id)) {
        next(new AppError('You do not have permission to access this shipment', 403));
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Optional authentication - doesn't fail if no token, but parses if present
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      next();
      return;
    }

    const token = parts[1];
    const payload: AuthPayload = authService.verifyToken(token);

    req.user = mapAuthPayloadToRequestUser(payload);

    next();
  } catch {
    // Token invalid but that's okay for optional auth
    next();
  }
}
