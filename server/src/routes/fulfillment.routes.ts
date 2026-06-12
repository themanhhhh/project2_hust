import { Router } from 'express';
import { FulfillmentController } from '../controllers/fulfillment.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { authenticate, authorize, requireOrderAccess, requireTrackingAccess } from '../middlewares/auth.middleware';
import { UserRole } from '../enums';

const router = Router();
const fulfillmentController = new FulfillmentController();

router.post('/order/:orderId/shipment', authenticate, authorize(UserRole.ADMIN, 'seller'), requireOrderAccess({ paramName: 'orderId', allowCustomer: false }), asyncHandler((req, res) => fulfillmentController.createShipment(req, res)));
router.post('/order/:orderId/picking', authenticate, authorize(UserRole.ADMIN, 'seller'), requireOrderAccess({ paramName: 'orderId', allowCustomer: false }), asyncHandler((req, res) => fulfillmentController.startPicking(req, res)));
router.post('/order/:orderId/packing', authenticate, authorize(UserRole.ADMIN, 'seller'), requireOrderAccess({ paramName: 'orderId', allowCustomer: false }), asyncHandler((req, res) => fulfillmentController.startPacking(req, res)));
router.post('/order/:orderId/ready', authenticate, authorize(UserRole.ADMIN, 'seller'), requireOrderAccess({ paramName: 'orderId', allowCustomer: false }), asyncHandler((req, res) => fulfillmentController.markReadyForPickup(req, res)));
router.post('/order/:orderId/tracking', authenticate, authorize(UserRole.ADMIN, 'seller'), requireOrderAccess({ paramName: 'orderId', allowCustomer: false }), asyncHandler((req, res) => fulfillmentController.inputTracking(req, res)));
router.post('/order/:orderId/handover', authenticate, authorize(UserRole.ADMIN, 'seller'), requireOrderAccess({ paramName: 'orderId', allowCustomer: false }), asyncHandler((req, res) => fulfillmentController.handoverToCarrier(req, res)));
router.post('/order/:orderId/confirm-delivery', authenticate, authorize(UserRole.ADMIN, 'seller'), requireOrderAccess({ paramName: 'orderId', allowCustomer: false }), asyncHandler((req, res) => fulfillmentController.confirmDelivery(req, res)));
router.post('/order/:orderId/cancel', authenticate, authorize(UserRole.ADMIN, 'seller'), requireOrderAccess({ paramName: 'orderId', allowCustomer: false }), asyncHandler((req, res) => fulfillmentController.cancelShipment(req, res)));

router.get('/order/:orderId/shipment', authenticate, authorize(UserRole.ADMIN, 'seller'), requireOrderAccess({ paramName: 'orderId', allowCustomer: false }), asyncHandler((req, res) => fulfillmentController.getShipmentByOrder(req, res)));
router.get('/order/:orderId/shipments', authenticate, authorize(UserRole.ADMIN, 'seller'), requireOrderAccess({ paramName: 'orderId', allowCustomer: false }), asyncHandler((req, res) => fulfillmentController.getAllShipmentsByOrder(req, res)));
router.get('/tracking/:trackingNumber', authenticate, authorize(UserRole.ADMIN, 'seller'), requireTrackingAccess(), asyncHandler((req, res) => fulfillmentController.getShipmentByTracking(req, res)));

router.put('/order/:orderId/status', authenticate, authorize(UserRole.ADMIN, 'seller'), requireOrderAccess({ paramName: 'orderId', allowCustomer: false }), asyncHandler((req, res) => fulfillmentController.updateShipmentStatus(req, res)));
router.post('/sync-carrier/:trackingNumber', authenticate, authorize(UserRole.ADMIN, 'seller'), requireTrackingAccess(), asyncHandler((req, res) => fulfillmentController.syncCarrierStatus(req, res)));

export default router;
