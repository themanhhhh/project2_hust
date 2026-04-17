export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export enum ProductBadge {
  NEW = 'new',
  BESTSELLER = 'bestseller',
  SALE = 'sale',
  NONE = 'none',
}

export enum OrderStatus {
  PENDING = 'pending',
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  AWAITING_SHIPMENT = 'awaiting_shipment',
  AWAITING_COLLECTION = 'awaiting_collection',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CONFIRMED = 'confirmed',
  SHIPPING = 'shipping',
  CANCELLED = 'cancelled',
}

export enum ShipmentStatus {
  PENDING = 'pending',
  PICKING = 'picking',
  PACKING = 'packing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED_DELIVERY = 'failed_delivery',
  RETURNED = 'returned',
}

export enum ShippingMethod {
  SELLER_FULFILLMENT = 'seller_fulfillment',
  PLATFORM_FULFILLMENT = 'platform_fulfillment',
}

export enum CarrierService {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

export enum SellerStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export enum KybStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
