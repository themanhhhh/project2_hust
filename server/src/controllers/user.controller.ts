import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { UserService } from '../services/user.service';
import { AppError } from '../middlewares/error.middleware';

export class UserController extends BaseController {
  private userService: UserService;

  constructor() {
    const userService = new UserService();
    super(userService);
    this.userService = userService;
  }

  async findByEmail(req: Request, res: Response): Promise<void> {
    const { email } = req.params;
    const user = await this.userService.findByEmail(email);
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.create(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already exists') {
        throw new AppError('Email already exists', 400);
      }
      throw error;
    }
  }
}
