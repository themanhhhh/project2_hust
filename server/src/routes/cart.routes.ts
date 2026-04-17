import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();
const cartController = new CartController();

router.get('/', asyncHandler((req, res) => cartController.findAll(req, res)));
router.get('/:id', asyncHandler((req, res) => cartController.findById(req, res)));
router.get('/user/:userId', asyncHandler((req, res) => cartController.findByUser(req, res)));
router.post('/user/:userId', asyncHandler((req, res) => cartController.getOrCreateCart(req, res)));
router.post('/:cartId/items', asyncHandler((req, res) => cartController.addItem(req, res)));
router.put('/:cartId/items/:productId', asyncHandler((req, res) => cartController.updateItemQuantity(req, res)));
router.delete('/:cartId/items/:productId', asyncHandler((req, res) => cartController.removeItem(req, res)));
router.delete('/:cartId/items', asyncHandler((req, res) => cartController.clearCart(req, res)));
router.delete('/:id', asyncHandler((req, res) => cartController.delete(req, res)));

export default router;
