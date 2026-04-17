import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();
const reviewController = new ReviewController();

router.get('/', asyncHandler((req, res) => reviewController.findAll(req, res)));
router.get('/:id', asyncHandler((req, res) => reviewController.findById(req, res)));
router.get('/product/:productId', asyncHandler((req, res) => reviewController.findByProduct(req, res)));
router.get('/product/:productId/rating', asyncHandler((req, res) => reviewController.getAverageRating(req, res)));
router.get('/user/:userId', asyncHandler((req, res) => reviewController.findByUser(req, res)));
router.post('/', asyncHandler((req, res) => reviewController.create(req, res)));
router.put('/:id', asyncHandler((req, res) => reviewController.update(req, res)));
router.delete('/:id', asyncHandler((req, res) => reviewController.delete(req, res)));

export default router;
