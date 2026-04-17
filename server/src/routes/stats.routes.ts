import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../enums';

const router = Router();
const statsController = new StatsController();

// Get dashboard stats - requires admin
router.get(
  '/dashboard',
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler((req, res) => statsController.getDashboardStats(req, res))
);

export default router;
