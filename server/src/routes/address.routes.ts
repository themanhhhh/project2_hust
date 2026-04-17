import { Router } from 'express';
import { AddressController } from '../controllers/address.controller';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();
const addressController = new AddressController();

router.get('/', asyncHandler((req, res) => addressController.findAll(req, res)));
router.get('/:id', asyncHandler((req, res) => addressController.findById(req, res)));
router.get('/user/:userId', asyncHandler((req, res) => addressController.findByUser(req, res)));
router.get('/user/:userId/default', asyncHandler((req, res) => addressController.findDefaultAddress(req, res)));
router.post('/', asyncHandler((req, res) => addressController.create(req, res)));
router.put('/:id', asyncHandler((req, res) => addressController.update(req, res)));
router.delete('/:id', asyncHandler((req, res) => addressController.delete(req, res)));

export default router;
