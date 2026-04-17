import { Router } from 'express';
import { FulfillmentController } from '../controllers/fulfillment.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const fulfillmentController = new FulfillmentController();

router.post('/order/:orderId/shipment', authenticate, asyncHandler((req, res) => fulfillmentController.createShipment(req, res)));
router.post('/order/:orderId/picking', authenticate, asyncHandler((req, res) => fulfillmentController.startPicking(req, res)));
router.post('/order/:orderId/packing', authenticate, asyncHandler((req, res) => fulfillmentController.startPacking(req, res)));
router.post('/order/:orderId/ready', authenticate, asyncHandler((req, res) => fulfillmentController.markReadyForPickup(req, res)));
router.post('/order/:orderId/tracking', authenticate, asyncHandler((req, res) => fulfillmentController.inputTracking(req, res)));
router.post('/order/:orderId/handover', authenticate, asyncHandler((req, res) => fulfillmentController.handoverToCarrier(req, res)));
router.post('/order/:orderId/confirm-delivery', authenticate, asyncHandler((req, res) => fulfillmentController.confirmDelivery(req, res)));
router.post('/order/:orderId/cancel', authenticate, asyncHandler((req, res) => fulfillmentController.cancelShipment(req, res)));

router.get('/order/:orderId/shipment', asyncHandler((req, res) => fulfillmentController.getShipmentByOrder(req, res)));
router.get('/order/:orderId/shipments', asyncHandler((req, res) => fulfillmentController.getAllShipmentsByOrder(req, res)));
router.get('/tracking/:trackingNumber', asyncHandler((req, res) => fulfillmentController.getShipmentByTracking(req, res)));

router.put('/order/:orderId/status', authenticate, asyncHandler((req, res) => fulfillmentController.updateShipmentStatus(req, res)));
router.post('/sync-carrier/:trackingNumber', asyncHandler((req, res) => fulfillmentController.syncCarrierStatus(req, res)));

export default router;
