import { Request, Response } from 'express';
import { FulfillmentService } from '../services/fulfillment.service';
import { ShipmentStatus, CarrierService, ShippingMethod } from '../enums';
import { AppError } from '../middlewares/error.middleware';

export class FulfillmentController {
  private fulfillmentService: FulfillmentService;

  constructor() {
    this.fulfillmentService = new FulfillmentService();
  }

  async createShipment(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const {
      carrier,
      carrier_service,
      shipping_method,
      pickup_address,
      pickup_name,
      pickup_phone,
      pickup_note,
      delivery_address,
      delivery_name,
      delivery_phone,
      estimated_delivery,
      shipping_fee,
      weight,
      package_dimension,
    } = req.body;

    const result = await this.fulfillmentService.createShipmentForOrder(orderId, {
      carrier,
      carrier_service: carrier_service as CarrierService,
      shipping_method: shipping_method as ShippingMethod,
      pickup_address,
      pickup_name,
      pickup_phone,
      pickup_note,
      delivery_address,
      delivery_name,
      delivery_phone,
      estimated_delivery: estimated_delivery ? new Date(estimated_delivery) : undefined,
      shipping_fee,
      weight,
      package_dimension,
    });

    if (!result.success) {
      throw new AppError(result.message, 400);
    }

    res.status(201).json({
      success: true,
      message: result.message,
      data: result.shipment,
    });
  }

  async startPicking(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const result = await this.fulfillmentService.startPicking(orderId);

    if (!result.success) {
      throw new AppError(result.message, 400);
    }

    res.json({
      success: true,
      message: result.message,
    });
  }

  async startPacking(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const result = await this.fulfillmentService.startPacking(orderId);

    if (!result.success) {
      throw new AppError(result.message, 400);
    }

    res.json({
      success: true,
      message: result.message,
    });
  }

  async markReadyForPickup(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const result = await this.fulfillmentService.markReadyForPickup(orderId);

    if (!result.success) {
      throw new AppError(result.message, 400);
    }

    res.json({
      success: true,
      message: result.message,
    });
  }

  async inputTracking(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const { tracking_number, carrier } = req.body;

    if (!tracking_number || !carrier) {
      throw new AppError('Tracking number và carrier là bắt buộc', 400);
    }

    const result = await this.fulfillmentService.inputTrackingNumber(orderId, tracking_number, carrier);

    if (!result.success) {
      throw new AppError(result.message, 400);
    }

    res.json({
      success: true,
      message: result.message,
    });
  }

  async handoverToCarrier(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const { tracking_number, carrier } = req.body;

    const result = await this.fulfillmentService.handoverToCarrier(orderId, tracking_number, carrier);

    if (!result.success) {
      throw new AppError(result.message, 400);
    }

    res.json({
      success: true,
      message: result.message,
    });
  }

  async confirmDelivery(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const result = await this.fulfillmentService.confirmDelivery(orderId);

    if (!result.success) {
      throw new AppError(result.message, 400);
    }

    res.json({
      success: true,
      message: result.message,
    });
  }

  async getShipmentByOrder(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const shipment = await this.fulfillmentService.getShipmentByOrderId(orderId);

    res.json({
      success: true,
      data: shipment,
    });
  }

  async getShipmentByTracking(req: Request, res: Response): Promise<void> {
    const { trackingNumber } = req.params;
    const shipment = await this.fulfillmentService.getShipmentByTracking(trackingNumber);

    if (!shipment) {
      throw new AppError('Không tìm thấy shipment', 404);
    }

    res.json({
      success: true,
      data: shipment,
    });
  }

  async getAllShipmentsByOrder(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const shipments = await this.fulfillmentService.getAllShipmentsByOrder(orderId);

    res.json({
      success: true,
      data: shipments,
    });
  }

  async cancelShipment(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const result = await this.fulfillmentService.cancelShipment(orderId);

    if (!result.success) {
      throw new AppError(result.message, 400);
    }

    res.json({
      success: true,
      message: result.message,
    });
  }

  async updateShipmentStatus(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params;
    const { status, tracking_number, carrier, actual_delivery, tracking_event } = req.body;

    if (!status) {
      throw new AppError('Status là bắt buộc', 400);
    }

    const result = await this.fulfillmentService.updateShipmentStatus(orderId, status, {
      tracking_number,
      carrier,
      actual_delivery: actual_delivery ? new Date(actual_delivery) : undefined,
      tracking_event,
    });

    if (!result.success) {
      throw new AppError(result.message, 400);
    }

    res.json({
      success: true,
      message: result.message,
    });
  }

  async syncCarrierStatus(req: Request, res: Response): Promise<void> {
    const { trackingNumber } = req.params;
    const carrierStatus = req.body;

    const result = await this.fulfillmentService.syncCarrierStatus(trackingNumber, carrierStatus);

    if (!result.success) {
      throw new AppError(result.message, 400);
    }

    res.json({
      success: true,
      message: result.message,
    });
  }
}
