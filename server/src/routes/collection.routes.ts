import { Router } from 'express';
import { CollectionController } from '../controllers/collection.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../enums';

const router = Router();
const collectionController = new CollectionController();

// Public routes
router.get('/', collectionController.findAll.bind(collectionController));
router.get('/slug/:slug', collectionController.findBySlug.bind(collectionController));
router.get('/:id', collectionController.findById.bind(collectionController));

// Admin routes
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.post('/', collectionController.create.bind(collectionController));
router.put('/:id', collectionController.update.bind(collectionController));
router.delete('/:id', collectionController.delete.bind(collectionController));

export default router;
