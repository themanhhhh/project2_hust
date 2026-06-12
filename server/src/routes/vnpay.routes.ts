import { Router } from 'express';
import { VnpayController } from '../controllers/vnpay.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../enums';

const router = Router();
const vnpayController = new VnpayController();

// Create VNPay payment URL — requires authenticated customer
router.post(
  '/create-payment',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.CUSTOMER),
  asyncHandler((req, res) => vnpayController.createPayment(req, res))
);

// VNPay return URL — public (VNPay redirects user here)
router.get(
  '/return',
  asyncHandler((req, res) => vnpayController.vnpayReturn(req, res))
);

// VNPay IPN — public (VNPay server-to-server callback)
router.get(
  '/ipn',
  asyncHandler((req, res) => vnpayController.vnpayIPN(req, res))
);

export default router;
