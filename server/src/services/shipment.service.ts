import prisma from '../lib/prisma';
import { ShipmentStatus, OrderStatus } from '@prisma/client';

export class ShipmentService {
  async findById(id: string) {
    return prisma.shipment.findUnique({ where: { id }, include: { order: true } });
  }

  async findByOrderId(orderId: string) {
    return prisma.shipment.findMany({ where: { order_id: orderId }, orderBy: { created_at: 'desc' } });
  }

  async findByOrderIdActive(orderId: string) {
    return prisma.shipment.findFirst({
      where: { order_id: orderId, status: { notIn: [ShipmentStatus.returned] } },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByTrackingNumber(trackingNumber: string) {
    return prisma.shipment.findFirst({ where: { tracking_number: trackingNumber } });
  }

  async createShipment(data: any) {
    return prisma.shipment.create({ data });
  }

  async updateShipment(id: string, data: any) {
    return prisma.shipment.update({ where: { id }, data });
  }

  async updateTrackingHistory(id: string, event: any) {
    const shipment = await prisma.shipment.findUnique({ where: { id } });
    if (!shipment) throw new Error('Shipment not found');
    const history = shipment.notes ? JSON.parse(shipment.notes) : [];
    history.push({ ...event, timestamp: new Date().toISOString() });
    return prisma.shipment.update({ where: { id }, data: { notes: JSON.stringify(history) } });
  }
}
