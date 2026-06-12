import { Router } from 'express';
import { SellerAuthController } from '../controllers/seller-auth.controller';
import { SellerController } from '../controllers/seller.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const authController = new SellerAuthController();
const sellerController = new SellerController();

/** Auth */
router.post('/register', authController.register);
router.post('/login', authController.login);

/** Profile & Products */
router.get('/profile', authenticate, authorize('seller'), sellerController.getProfile);
router.put('/profile', authenticate, authorize('seller'), sellerController.updateProfile);
router.get('/profile/orders', authenticate, authorize('seller'), sellerController.getOrders);
router.patch('/profile/orders/:id', authenticate, authorize('seller'), sellerController.updateOrder);
router.delete('/profile/orders/:id', authenticate, authorize('seller'), sellerController.deleteOrder);

router.get('/:id', sellerController.getProfile);
router.get('/:id/products', sellerController.getProducts);

export default router;
