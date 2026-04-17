import { Router } from 'express';
import { FlashSaleController } from '../controllers/flash-sale.controller';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();
const flashSaleController = new FlashSaleController();

router.get('/', asyncHandler((req, res) => flashSaleController.findAll(req, res)));
router.get('/active', asyncHandler((req, res) => flashSaleController.findActiveFlashSales(req, res)));
router.get('/:id', asyncHandler((req, res) => flashSaleController.findById(req, res)));
router.get('/:id/products', asyncHandler((req, res) => flashSaleController.findWithProducts(req, res)));
router.post('/', asyncHandler((req, res) => flashSaleController.create(req, res)));
router.put('/:id', asyncHandler((req, res) => flashSaleController.update(req, res)));
router.delete('/:id', asyncHandler((req, res) => flashSaleController.delete(req, res)));

export default router;
