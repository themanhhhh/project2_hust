import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthPayload } from '../services/auth.service';
import { AppError } from './error.middleware';
import { UserRole } from '../enums';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
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
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

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
export function authorize(...allowedRoles: UserRole[]) {
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

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    // Token invalid but that's okay for optional auth
    next();
  }
}
