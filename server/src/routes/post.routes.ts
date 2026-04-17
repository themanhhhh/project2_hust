import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const postController = new PostController();

router.get('/', asyncHandler((req, res) => postController.findAll(req, res)));
router.get('/published', asyncHandler((req, res) => postController.findPublished(req, res)));
router.get('/slug/:slug', asyncHandler((req, res) => postController.findBySlug(req, res)));
router.get('/:id', asyncHandler((req, res) => postController.findById(req, res)));
router.post('/', authenticate, asyncHandler((req, res) => postController.create(req, res)));
router.put('/:id', authenticate, asyncHandler((req, res) => postController.update(req, res)));
router.delete('/:id', authenticate, asyncHandler((req, res) => postController.delete(req, res)));

export default router;
