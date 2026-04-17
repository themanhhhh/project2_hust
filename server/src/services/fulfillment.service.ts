import prisma from '../lib/prisma';
import { ShipmentService } from './shipment.service';
import { OrderService } from './order.service';
import { ShipmentStatus, OrderStatus, ShippingMethod, CarrierService } from '@prisma/client';

export class FulfillmentService {
  private shipmentService = new ShipmentService();
  private orderService = new OrderService();

  async createShipmentForOrder(orderId: string, shipmentData: any) {
    const order = await prisma.order.findFirst({ where: { id: orderId }, include: { order_items: true } });
    if (!order) return { success: false, message: 'Đơn hàng không tồn tại' };
    if (order.payment_status !== 'paid') return { success: false, message: 'Đơn hàng chưa thanh toán' };
    if (order.status === OrderStatus.cancelled) return { success: false, message: 'Đơn hàng đã bị hủy' };

    const existing = await this.shipmentService.findByOrderIdActive(orderId);
    if (existing) return { success: false, message: 'Đơn hàng đã có shipment' };

    const shipment = await this.shipmentService.createShipment({
      order_id: orderId,
      carrier: shipmentData.carrier,
      carrier_service: shipmentData.carrier_service ?? CarrierService.standard,
      shipping_method: shipmentData.shipping_method ?? ShippingMethod.seller_fulfillment,
      tracking_number: shipmentData.tracking_number,
      status: ShipmentStatus.pending,
      notes: shipmentData.notes,
    });

    await this.orderService.update(orderId, { status: OrderStatus.awaiting_shipment });
    return { success: true, message: 'Tạo shipment thành công', shipment };
  }

  async startPicking(orderId: string) {
    const s = await this.shipmentService.findByOrderIdActive(orderId);
    if (!s) return { success: false, message: 'Không tìm thấy shipment' };
    if (s.status !== ShipmentStatus.pending) return { success: false, message: 'Trạng thái shipment không hợp lệ' };
    await this.shipmentService.updateShipment(s.id, { status: ShipmentStatus.picking });
    return { success: true, message: 'Bắt đầu lấy hàng' };
  }

  async startPacking(orderId: string) {
    const s = await this.shipmentService.findByOrderIdActive(orderId);
    if (!s) return { success: false, message: 'Không tìm thấy shipment' };
    if (s.status !== ShipmentStatus.picking) return { success: false, message: 'Trạng thái shipment không hợp lệ' };
    await this.shipmentService.updateShipment(s.id, { status: ShipmentStatus.packing });
    return { success: true, message: 'Bắt đầu đóng gói' };
  }

  async markReadyForPickup(orderId: string) {
    const s = await this.shipmentService.findByOrderIdActive(orderId);
    if (!s) return { success: false, message: 'Không tìm thấy shipment' };
    if (s.status !== ShipmentStatus.packing) return { success: false, message: 'Trạng thái shipment không hợp lệ' };
    await this.shipmentService.updateShipment(s.id, { status: ShipmentStatus.ready_for_pickup });
    return { success: true, message: 'Đơn hàng đã sẵn sàng để lấy' };
  }

  async inputTrackingNumber(orderId: string, trackingNumber: string, carrier: string) {
    const s = await this.shipmentService.findByOrderIdActive(orderId);
    if (!s) return { success: false, message: 'Không tìm thấy shipment' };
    await this.shipmentService.updateShipment(s.id, { tracking_number: trackingNumber, carrier });
    return { success: true, message: 'Cập nhật tracking thành công' };
  }

  async handoverToCarrier(orderId: string, trackingNumber?: string, carrier?: string) {
    const s = await this.shipmentService.findByOrderIdActive(orderId);
    if (!s) return { success: false, message: 'Không tìm thấy shipment' };
    const validStatuses: string[] = [ShipmentStatus.ready_for_pickup, ShipmentStatus.pending];
    if (!validStatuses.includes(s.status)) return { success: false, message: 'Trạng thái shipment không hợp lệ' };
    await this.shipmentService.updateShipment(s.id, {
      status: ShipmentStatus.picked_up,
      shipped_at: new Date(),
      ...(trackingNumber ? { tracking_number: trackingNumber } : {}),
      ...(carrier ? { carrier } : {}),
    });
    await this.orderService.update(orderId, { status: OrderStatus.awaiting_collection });
    return { success: true, message: 'Đã bàn giao cho hãng vận chuyển' };
  }

  async markPickedUp(orderId: string) {
    const s = await this.shipmentService.findByOrderIdActive(orderId);
    if (!s) return { success: false, message: 'Không tìm thấy shipment' };
    await this.shipmentService.updateShipment(s.id, { status: ShipmentStatus.in_transit });
    await this.orderService.update(orderId, { status: OrderStatus.in_transit });
    return { success: true, message: 'Đơn hàng đang trên đường' };
  }

  async updateShipmentStatus(orderId: string, status: ShipmentStatus, additionalData?: any) {
    const s = await this.shipmentService.findByOrderIdActive(orderId);
    if (!s) return { success: false, message: 'Không tìm thấy shipment' };
    await this.shipmentService.updateShipment(s.id, { status, ...additionalData });
    if (status === ShipmentStatus.delivered) {
      await this.orderService.update(orderId, { status: OrderStatus.completed });
    }
    return { success: true, message: 'Cập nhật trạng thái thành công' };
  }

  async confirmDelivery(orderId: string) {
    const s = await this.shipmentService.findByOrderIdActive(orderId);
    if (!s) return { success: false, message: 'Không tìm thấy shipment' };
    if (s.status !== ShipmentStatus.in_transit && s.status !== ShipmentStatus.out_for_delivery) {
      return { success: false, message: 'Trạng thái shipment không hợp lệ' };
    }
    await this.shipmentService.updateShipment(s.id, { status: ShipmentStatus.delivered, delivered_at: new Date() });
    await this.orderService.update(orderId, { status: OrderStatus.completed });
    return { success: true, message: 'Xác nhận giao hàng thành công' };
  }

  async getShipmentByOrderId(orderId: string) {
    return this.shipmentService.findByOrderIdActive(orderId);
  }

  async getShipmentByTracking(trackingNumber: string) {
    return this.shipmentService.findByTrackingNumber(trackingNumber);
  }

  async getAllShipmentsByOrder(orderId: string) {
    return this.shipmentService.findByOrderId(orderId);
  }

  async cancelShipment(orderId: string) {
    const s = await this.shipmentService.findByOrderIdActive(orderId);
    if (!s) return { success: false, message: 'Không tìm thấy shipment' };
    if (s.status === ShipmentStatus.delivered || s.status === ShipmentStatus.returned) {
      return { success: false, message: 'Không thể hủy shipment đã giao hoặc trả lại' };
    }
    await this.shipmentService.updateShipment(s.id, { status: ShipmentStatus.returned });
    await this.orderService.update(orderId, { status: OrderStatus.cancelled });
    return { success: true, message: 'Hủy shipment thành công' };
  }

  async syncCarrierStatus(trackingNumber: string, carrierStatus: any) {
    const s = await this.shipmentService.findByTrackingNumber(trackingNumber);
    if (!s) return { success: false, message: 'Không tìm thấy shipment' };
    const statusMap: Record<string, ShipmentStatus> = {
      picked_up: ShipmentStatus.picked_up,
      in_transit: ShipmentStatus.in_transit,
      out_for_delivery: ShipmentStatus.out_for_delivery,
      delivered: ShipmentStatus.delivered,
      failed: ShipmentStatus.failed_delivery,
      returned: ShipmentStatus.returned,
    };
    const newStatus = statusMap[carrierStatus.status] || s.status;
    await this.shipmentService.updateShipment(s.id, { status: newStatus });
    if (newStatus === ShipmentStatus.delivered) {
      await this.orderService.update(s.order_id, { status: OrderStatus.completed });
    } else if (newStatus === ShipmentStatus.in_transit) {
      await this.orderService.update(s.order_id, { status: OrderStatus.in_transit });
    }
    return { success: true, message: 'Đồng bộ trạng thái thành công' };
  }
}
