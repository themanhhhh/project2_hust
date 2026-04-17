import { Router } from 'express';
import { BrandController } from '../controllers/brand.controller';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();
const brandController = new BrandController();

router.get('/', asyncHandler((req, res) => brandController.findAll(req, res)));
router.get('/:id', asyncHandler((req, res) => brandController.findById(req, res)));
router.get('/slug/:slug', asyncHandler((req, res) => brandController.findBySlug(req, res)));
router.post('/', asyncHandler((req, res) => brandController.create(req, res)));
router.put('/:id', asyncHandler((req, res) => brandController.update(req, res)));
router.delete('/:id', asyncHandler((req, res) => brandController.delete(req, res)));

export default router;
