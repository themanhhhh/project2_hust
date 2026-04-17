import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../middlewares/error.middleware';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, phone } = req.body;

      // Validate required fields
      if (!email || !password || !name) {
        throw new AppError('Email, password, and name are required', 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError('Invalid email format', 400);
      }

      // Validate password length
      if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters', 400);
      }

      const result = await this.authService.register({ email, password, name, phone });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already exists') {
        throw new AppError('Email already exists', 400);
      }
      throw error;
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      const result = await this.authService.login(email, password);

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid email or password') {
          throw new AppError('Invalid email or password', 401);
        }
        if (error.message === 'Account is deactivated') {
          throw new AppError('Account is deactivated', 403);
        }
      }
      throw error;
    }
  }

  /**
   * Get current user info
   * GET /api/v1/auth/me
   */
  async me(req: Request, res: Response): Promise<void> {
    // User is attached to request by auth middleware
    const user = (req as any).user;

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user,
    });
  }

  /**
   * Logout user (client-side token removal)
   * POST /api/v1/auth/logout
   */
  async logout(_req: Request, res: Response): Promise<void> {
    // JWT tokens are stateless, so logout is handled client-side
    // This endpoint is just for consistency and potential future enhancements
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  /**
   * Change user password
   * POST /api/v1/auth/change-password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    const user = (req as any).user;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new AppError('All fields are required', 400);
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      throw new AppError('New passwords do not match', 400);
    }

    // Validate new password length
    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters', 400);
    }

    try {
      await this.authService.changePassword(user.id, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Current password is incorrect') {
          throw new AppError('Current password is incorrect', 400);
        }
      }
      throw error;
    }
  }
}
