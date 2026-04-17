import { Router } from 'express';
import { KybController } from '../controllers/kyb.controller';

const router = Router();
const kybController = new KybController();

// TODO: Gắn middleware check user/seller
router.post('/submit', kybController.submitKyb);
router.get('/my-kyb', kybController.getKyb);

// Admin endpoints
router.get('/seller/:sellerId', kybController.getKyb);
router.put('/:id/review', kybController.reviewKyb);

export default router;
