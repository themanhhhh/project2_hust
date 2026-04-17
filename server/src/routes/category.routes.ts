import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();
const categoryController = new CategoryController();

router.get('/', asyncHandler((req, res) => categoryController.findAll(req, res)));
router.get('/root', asyncHandler((req, res) => categoryController.findRootCategories(req, res)));
router.get('/:id', asyncHandler((req, res) => categoryController.findById(req, res)));
router.get('/slug/:slug', asyncHandler((req, res) => categoryController.findBySlug(req, res)));
router.post('/', asyncHandler((req, res) => categoryController.create(req, res)));
router.put('/:id', asyncHandler((req, res) => categoryController.update(req, res)));
router.delete('/:id', asyncHandler((req, res) => categoryController.delete(req, res)));

export default router;
