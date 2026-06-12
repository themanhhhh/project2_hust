import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { authenticate, authorize, requireOrderAccess, requireSelfOrAdmin } from '../middlewares/auth.middleware';
import { UserRole } from '../enums';

const router = Router();
const orderController = new OrderController();

router.get('/', authenticate, authorize(UserRole.ADMIN, 'seller'), asyncHandler((req, res) => orderController.findAll(req, res)));
router.get('/number/:orderNumber', authenticate, requireOrderAccess({ paramName: 'orderNumber', byOrderNumber: true }), asyncHandler((req, res) => orderController.findByOrderNumber(req, res)));
router.get('/user/:userId', authenticate, authorize(UserRole.ADMIN, UserRole.CUSTOMER), requireSelfOrAdmin('userId'), asyncHandler((req, res) => orderController.findByUser(req, res)));
router.get('/:id', authenticate, requireOrderAccess(), asyncHandler((req, res) => orderController.findById(req, res)));
router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.CUSTOMER), asyncHandler((req, res) => orderController.createOrder(req, res)));
router.post('/:id/verify-otp', authenticate, requireOrderAccess({ allowSeller: false }), asyncHandler((req, res) => orderController.verifyOTP(req, res)));
router.post('/:id/resend-otp', authenticate, requireOrderAccess({ allowSeller: false }), asyncHandler((req, res) => orderController.resendOTP(req, res)));
router.put('/:id', authenticate, authorize(UserRole.ADMIN, 'seller'), requireOrderAccess({ allowCustomer: false }), asyncHandler((req, res) => orderController.update(req, res)));
router.delete('/:id', authenticate, authorize(UserRole.ADMIN, 'seller'), requireOrderAccess({ allowCustomer: false }), asyncHandler((req, res) => orderController.delete(req, res)));

export default router;
