import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();
const userController = new UserController();

router.get('/', asyncHandler((req, res) => userController.findAll(req, res)));
router.get('/:id', asyncHandler((req, res) => userController.findById(req, res)));
router.get('/email/:email', asyncHandler((req, res) => userController.findByEmail(req, res)));
router.post('/', asyncHandler((req, res) => userController.createUser(req, res)));
router.put('/:id', asyncHandler((req, res) => userController.update(req, res)));
router.delete('/:id', asyncHandler((req, res) => userController.delete(req, res)));

export default router;
