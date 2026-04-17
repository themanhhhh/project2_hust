import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', asyncHandler((req, res) => authController.register(req, res)));
router.post('/login', asyncHandler((req, res) => authController.login(req, res)));
router.post('/logout', asyncHandler((req, res) => authController.logout(req, res)));

// Protected routes
router.get('/me', authenticate, asyncHandler((req, res) => authController.me(req, res)));
router.post('/change-password', authenticate, asyncHandler((req, res) => authController.changePassword(req, res)));

export default router;
