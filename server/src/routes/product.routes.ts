import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { attachSellerIdToBody, authenticate, authorize, requireActiveSeller, requireProductAccess } from '../middlewares/auth.middleware';
import { UserRole } from '../enums';

const router = Router();
const productController = new ProductController();

router.get('/', asyncHandler((req, res) => productController.findAll(req, res)));
router.get('/:id', asyncHandler((req, res) => productController.findById(req, res)));
router.get('/:id/details', asyncHandler((req, res) => productController.findWithRelations(req, res)));
router.get('/slug/:slug', asyncHandler((req, res) => productController.findBySlug(req, res)));
router.get('/category/:categoryId', asyncHandler((req, res) => productController.findByCategory(req, res)));
router.get('/brand/:brandId', asyncHandler((req, res) => productController.findByBrand(req, res)));
router.get('/collection/:collectionId', asyncHandler((req, res) => productController.findByCollection(req, res)));
router.post('/', authenticate, authorize(UserRole.ADMIN, 'seller'), requireActiveSeller(), attachSellerIdToBody(), asyncHandler((req, res) => productController.create(req, res)));
router.put('/:id', authenticate, authorize(UserRole.ADMIN, 'seller'), requireActiveSeller(), requireProductAccess(), asyncHandler((req, res) => productController.update(req, res)));
router.delete('/:id', authenticate, authorize(UserRole.ADMIN, 'seller'), requireActiveSeller(), requireProductAccess(), asyncHandler((req, res) => productController.delete(req, res)));

export default router;
