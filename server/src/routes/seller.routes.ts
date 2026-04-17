import { Router } from 'express';
import { SellerAuthController } from '../controllers/seller-auth.controller';
import { SellerController } from '../controllers/seller.controller';

const router = Router();
const authController = new SellerAuthController();
const sellerController = new SellerController();

/** Auth */
router.post('/register', authController.register);
router.post('/login', authController.login);

/** Profile & Products */
// TODO: Gắn middleware check auth token role = seller vào đây
router.get('/profile', sellerController.getProfile);
router.put('/profile', sellerController.updateProfile);

router.get('/:id', sellerController.getProfile);
router.get('/:id/products', sellerController.getProducts);

export default router;
