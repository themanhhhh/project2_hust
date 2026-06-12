import { Router } from 'express';
import { KybController } from '../controllers/kyb.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../enums';

const router = Router();
const kybController = new KybController();

router.post('/submit', authenticate, authorize('seller'), kybController.submitKyb);
router.get('/my-kyb', authenticate, authorize('seller'), kybController.getKyb);

// Admin endpoints
router.get('/seller/:sellerId', authenticate, authorize(UserRole.ADMIN), kybController.getKyb);
router.put('/:id/review', authenticate, authorize(UserRole.ADMIN), kybController.reviewKyb);

export default router;
