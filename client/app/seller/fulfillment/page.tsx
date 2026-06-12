'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  CheckCircle2,
  Loader2,
  PackageCheck,
  PackageOpen,
  Search,
  ShieldCheck,
  Truck,
  XCircle,
} from 'lucide-react';
import { AdminLoading } from '@/components/admin/AdminLoading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useSellerOrders, useShipmentByOrder } from '@/hooks/useApi';
import { fulfillmentApi } from '@/lib/api';
import { formatPrice } from '@/lib/productMapper';
import { cn } from '@/lib/utils';
import type { Order, Shipment } from '@/lib/types';

type ShipmentFormState = {
  carrier: string;
  carrier_service: 'standard' | 'express' | 'same_day';
  shipping_method: 'seller_fulfillment' | 'platform_fulfillment';
  pickup_name: string;
  pickup_phone: string;
  pickup_address: string;
  pickup_note: string;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  package_dimension: string;
  weight: string;
  shipping_fee: string;
};

const orderStageLabel: Record<string, string> = {
  pending_payment: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  awaiting_shipment: 'Chờ tạo shipment',
  awaiting_collection: 'Chờ hãng vận chuyển lấy hàng',
  in_transit: 'Đang vận chuyển',
  delivered: 'Hoàn tất',
  completed: 'Hoàn tất',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  cancelled: 'Đã hủy',
};

const shipmentStageLabel: Record<string, string> = {
  pending: 'Mới tạo',
  picking: 'Đang pick',
  packing: 'Đang pack',
  ready_for_pickup: 'Sẵn sàng lấy hàng',
  picked_up: 'Đã bàn giao',
  in_transit: 'Đang trung chuyển',
  out_for_delivery: 'Đang giao cuối',
  delivered: 'Đã giao',
  failed_delivery: 'Giao thất bại',
  returned: 'Hoàn trả',
};

const shipmentActions: Array<{
  key: 'startPicking' | 'startPacking' | 'markReady' | 'handover' | 'confirmDelivery' | 'cancelShipment';
  label: string;
  icon: typeof Box;
  destructive?: boolean;
}> = [
  { key: 'startPicking', label: 'Bắt đầu pick', icon: Box },
  { key: 'startPacking', label: 'Chuyển sang pack', icon: PackageOpen },
  { key: 'markReady', label: 'Sẵn sàng pickup', icon: PackageCheck },
  { key: 'handover', label: 'Bàn giao carrier', icon: Truck },
  { key: 'confirmDelivery', label: 'Xác nhận hoàn tất', icon: CheckCircle2 },
  { key: 'cancelShipment', label: 'Hủy shipment', icon: XCircle, destructive: true },
] as const;

function getOrderNumber(order: Partial<Order> & Record<string, any>) {
  return order.orderNumber || order.order_number || order.id;
}

function parseTrackingHistory(trackingHistory: Shipment['tracking_history']) {
  if (!trackingHistory) return [];
  if (Array.isArray(trackingHistory)) return trackingHistory;

  try {
    const parsed = JSON.parse(trackingHistory);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AdminFulfillmentPage() {
  const { data: ordersResult, loading, refetch } = useSellerOrders({ page: 1, limit: 100 });
  const [query, setQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [busyAction, setBusyAction] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [shipmentForm, setShipmentForm] = useState<ShipmentFormState>({
    carrier: 'GHN',
    carrier_service: 'standard' as const,
    shipping_method: 'seller_fulfillment' as const,
    pickup_name: 'SmashX Warehouse',
    pickup_phone: '',
    pickup_address: '',
    pickup_note: '',
    delivery_name: '',
    delivery_phone: '',
    delivery_address: '',
    package_dimension: '',
    weight: '',
    shipping_fee: '',
  });
  const [trackingForm, setTrackingForm] = useState({
    tracking_number: '',
    carrier: 'GHN',
    status: 'in_transit',
    tracking_note: '',
  });

  const normalizedOrders = useMemo(() => {
    const items = Array.isArray(ordersResult?.data) ? ordersResult.data : [];
    return items.filter(Boolean);
  }, [ordersResult]);

  const filteredOrders = useMemo(() => {
    return normalizedOrders.filter((order: any) => {
      const orderNumber = getOrderNumber(order).toLowerCase();
      const customer = (order.user?.name || '').toLowerCase();
      const status = (order.status || '').toLowerCase();
      const search = query.trim().toLowerCase();
      return !search || orderNumber.includes(search) || customer.includes(search) || status.includes(search);
    });
  }, [normalizedOrders, query]);

  const selectedOrder = useMemo(() => {
    return filteredOrders.find((order: any) => order.id === selectedOrderId) || normalizedOrders[0] || null;
  }, [filteredOrders, normalizedOrders, selectedOrderId]);

  const { data: shipment, loading: shipmentLoading, refetch: refetchShipment } = useShipmentByOrder(selectedOrder?.id || '');

  useEffect(() => {
    if (!selectedOrderId && normalizedOrders[0]?.id) {
      setSelectedOrderId(normalizedOrders[0].id);
    }
  }, [normalizedOrders, selectedOrderId]);

  const trackingHistory = parseTrackingHistory(shipment?.tracking_history);

  async function runAction(action: string, runner: () => Promise<unknown>) {
    try {
      setBusyAction(action);
      setFeedback(null);
      await runner();
      setFeedback({ type: 'success', text: 'Cập nhật fulfillment thành công.' });
      await Promise.all([refetch(), refetchShipment()]);
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Có lỗi xảy ra.' });
    } finally {
      setBusyAction('');
    }
  }

  if (loading) {
    return <AdminLoading fullPage text="Đang tải workspace fulfillment..." />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Đơn có thể ship', value: normalizedOrders.filter((o: any) => ['paid', 'awaiting_shipment'].includes(o.status)).length },
              { label: 'Đang pick/pack', value: normalizedOrders.filter((o: any) => ['awaiting_shipment', 'awaiting_collection'].includes(o.status)).length },
              { label: 'In transit', value: normalizedOrders.filter((o: any) => o.status === 'in_transit').length },
              { label: 'Completed', value: normalizedOrders.filter((o: any) => o.status === 'completed').length },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-background px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</div>
                <div className="mt-2 text-2xl font-semibold text-foreground">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {feedback && (
        <div className={cn(
          'rounded-2xl border px-4 py-3 text-sm',
          feedback.type === 'success' 
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400' 
            : 'border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-400'
        )}>
          {feedback.text}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Queue xử lý</CardTitle>
            <CardDescription>Chọn một đơn để thao tác fulfillment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo mã đơn hoặc khách hàng" className="pl-9" />
            </div>

            <div className="space-y-3">
              {filteredOrders.map((order: any) => {
                const isActive = selectedOrder?.id === order.id;
                const itemCount = (order.items || order.order_items || []).length;

                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelectedOrderId(order.id)}
                    className={cn(
                      'w-full rounded-2xl border p-4 text-left transition-all',
                      isActive
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border bg-card hover:border-accent hover:bg-accent/50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-mono text-sm font-semibold text-foreground">{getOrderNumber(order)}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{order.user?.name || 'Khach hang'}</div>
                      </div>
                      <Badge variant="outline" className="border-border bg-card text-foreground">
                        {orderStageLabel[order.status] || order.status}
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{itemCount} san pham</span>
                      <span>{formatPrice(order.total || 0)}</span>
                    </div>
                  </button>
                );
              })}

              {!filteredOrders.length && (
                <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  Không tìm thấy đơn hàng phù hợp.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedOrder && (
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle className="text-xl">{getOrderNumber(selectedOrder as any)}</CardTitle>
                    <CardDescription className="mt-2">
                      {selectedOrder.user?.name || 'Khach hang'} - {selectedOrder.user?.email || 'chua co email'}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{orderStageLabel[(selectedOrder as any).status] || (selectedOrder as any).status}</Badge>
                    <Badge variant="outline">Thanh toan: {(selectedOrder as any).payment_status || (selectedOrder as any).paymentStatus || 'pending'}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-muted/50 p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Tổng giá trị</div>
                      <div className="mt-2 text-lg font-semibold text-foreground">{formatPrice((selectedOrder as any).total || 0)}</div>
                    </div>
                    <div className="rounded-2xl bg-muted/50 p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Shipment</div>
                      <div className="mt-2 text-lg font-semibold text-foreground">{shipment ? 'Đã tạo' : 'Chưa có'}</div>
                    </div>
                    <div className="rounded-2xl bg-muted/50 p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Tracking</div>
                      <div className="mt-2 truncate text-lg font-semibold text-foreground">{shipment?.tracking_number || '--'}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Action nhanh
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {shipmentActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <Button
                            key={action.key}
                            variant={action.destructive ? 'destructive' : 'outline'}
                            size="sm"
                            disabled={busyAction === action.key}
                            onClick={() => {
                              const orderId = selectedOrder.id;
                              if (action.key === 'startPicking') return runAction(action.key, () => fulfillmentApi.startPicking(orderId));
                              if (action.key === 'startPacking') return runAction(action.key, () => fulfillmentApi.startPacking(orderId));
                              if (action.key === 'markReady') return runAction(action.key, () => fulfillmentApi.markReady(orderId));
                              if (action.key === 'handover') return runAction(action.key, () => fulfillmentApi.handover(orderId, {
                                tracking_number: trackingForm.tracking_number || shipment?.tracking_number,
                                carrier: trackingForm.carrier || shipment?.carrier,
                              }));
                              if (action.key === 'confirmDelivery') return runAction(action.key, () => fulfillmentApi.confirmDelivery(orderId));
                              return runAction(action.key, () => fulfillmentApi.cancelShipment(orderId));
                            }}
                          >
                            {busyAction === action.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                            {action.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-slate-950 p-5 text-slate-50 shadow-sm dark:bg-black/40">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Current shipment</div>
                  {shipmentLoading ? (
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                      <Loader2 className="h-4 w-4 animate-spin" /> Dang tai shipment...
                    </div>
                  ) : shipment ? (
                    <div className="mt-4 space-y-4">
                      <div>
                        <div className="text-2xl font-semibold">{shipmentStageLabel[shipment.status] || shipment.status}</div>
                        <div className="mt-1 text-sm text-slate-300">{shipment.carrier || 'Chua gan carrier'} - {shipment.tracking_number || 'Chua co tracking'}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl bg-white/5 p-3">
                          <div className="text-slate-400">Mode</div>
                          <div className="mt-1 font-medium text-white">{shipment.shipping_method || '--'}</div>
                        </div>
                        <div className="rounded-2xl bg-white/5 p-3">
                          <div className="text-slate-400">Service</div>
                          <div className="mt-1 font-medium text-white">{shipment.carrier_service || '--'}</div>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-gradient-to-r from-sky-500/15 to-cyan-400/10 p-4 text-sm text-slate-200">
                        Timeline đang lấy từ `tracking_history`; seller có thể push event thủ công ở khung cập nhật trạng thái bên dưới.
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-white/15 p-4 text-sm text-slate-300">
                      Don nay chua co shipment. Tao shipment de bat dau luong fulfillment.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Tao shipment</CardTitle>
                  <CardDescription>Tao cau hinh giao nhan cho seller fulfillment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input placeholder="Carrier" value={shipmentForm.carrier} onChange={(e) => setShipmentForm((prev) => ({ ...prev, carrier: e.target.value }))} />
                    <Input placeholder="Carrier service" value={shipmentForm.carrier_service} onChange={(e) => setShipmentForm((prev) => ({ ...prev, carrier_service: e.target.value as 'standard' | 'express' | 'same_day' }))} />
                    <Input placeholder="Shipping method" value={shipmentForm.shipping_method} onChange={(e) => setShipmentForm((prev) => ({ ...prev, shipping_method: e.target.value as 'seller_fulfillment' | 'platform_fulfillment' }))} />
                    <Input placeholder="Pickup name" value={shipmentForm.pickup_name} onChange={(e) => setShipmentForm((prev) => ({ ...prev, pickup_name: e.target.value }))} />
                    <Input placeholder="Pickup phone" value={shipmentForm.pickup_phone} onChange={(e) => setShipmentForm((prev) => ({ ...prev, pickup_phone: e.target.value }))} />
                    <Input placeholder="Delivery name" value={shipmentForm.delivery_name} onChange={(e) => setShipmentForm((prev) => ({ ...prev, delivery_name: e.target.value }))} />
                    <Input placeholder="Delivery phone" value={shipmentForm.delivery_phone} onChange={(e) => setShipmentForm((prev) => ({ ...prev, delivery_phone: e.target.value }))} />
                    <Input placeholder="Khoi luong (kg)" value={shipmentForm.weight} onChange={(e) => setShipmentForm((prev) => ({ ...prev, weight: e.target.value }))} />
                    <Input placeholder="Kich thuoc" value={shipmentForm.package_dimension} onChange={(e) => setShipmentForm((prev) => ({ ...prev, package_dimension: e.target.value }))} />
                    <Input placeholder="Phi ship" value={shipmentForm.shipping_fee} onChange={(e) => setShipmentForm((prev) => ({ ...prev, shipping_fee: e.target.value }))} />
                  </div>
                  <Textarea placeholder="Dia chi lay hang" value={shipmentForm.pickup_address} onChange={(e) => setShipmentForm((prev) => ({ ...prev, pickup_address: e.target.value }))} />
                  <Textarea placeholder="Dia chi giao hang" value={shipmentForm.delivery_address} onChange={(e) => setShipmentForm((prev) => ({ ...prev, delivery_address: e.target.value }))} />
                  <Textarea placeholder="Ghi chu pickup / SLA" value={shipmentForm.pickup_note} onChange={(e) => setShipmentForm((prev) => ({ ...prev, pickup_note: e.target.value }))} />
                  <Button
                    className="w-full"
                    disabled={busyAction === 'createShipment'}
                    onClick={() => runAction('createShipment', () => fulfillmentApi.createShipment(selectedOrder.id, {
                      ...shipmentForm,
                      weight: shipmentForm.weight ? Number(shipmentForm.weight) : undefined,
                      shipping_fee: shipmentForm.shipping_fee ? Number(shipmentForm.shipping_fee) : undefined,
                    }))}
                  >
                    {busyAction === 'createShipment' ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
                    Tạo shipment cho đơn hàng
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Tracking & status sync</CardTitle>
                  <CardDescription>Nhap ma van don, cap nhat event va dong bo trang thai carrier</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input placeholder="Tracking number" value={trackingForm.tracking_number} onChange={(e) => setTrackingForm((prev) => ({ ...prev, tracking_number: e.target.value }))} />
                    <Input placeholder="Carrier" value={trackingForm.carrier} onChange={(e) => setTrackingForm((prev) => ({ ...prev, carrier: e.target.value }))} />
                    <Input placeholder="Status sync" value={trackingForm.status} onChange={(e) => setTrackingForm((prev) => ({ ...prev, status: e.target.value }))} />
                  </div>
                  <Textarea placeholder="Ghi chu event tracking" value={trackingForm.tracking_note} onChange={(e) => setTrackingForm((prev) => ({ ...prev, tracking_note: e.target.value }))} />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      disabled={busyAction === 'inputTracking'}
                      onClick={() => runAction('inputTracking', () => fulfillmentApi.inputTracking(selectedOrder.id, trackingForm.tracking_number, trackingForm.carrier))}
                    >
                      {busyAction === 'inputTracking' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                      Luu tracking
                    </Button>
                    <Button
                      variant="outline"
                      disabled={busyAction === 'syncCarrier'}
                      onClick={() => runAction('syncCarrier', () => fulfillmentApi.syncCarrierStatus(trackingForm.tracking_number || shipment?.tracking_number || '', {
                        status: trackingForm.status,
                        carrier: trackingForm.carrier,
                        tracking_number: trackingForm.tracking_number || shipment?.tracking_number,
                        note: trackingForm.tracking_note,
                        location: 'seller-portal',
                        timestamp: new Date().toISOString(),
                      }))}
                    >
                      {busyAction === 'syncCarrier' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                      Gia lap webhook carrier
                    </Button>
                    <Button
                      disabled={busyAction === 'updateShipmentStatus'}
                      onClick={() => runAction('updateShipmentStatus', () => fulfillmentApi.updateShipmentStatus(selectedOrder.id, {
                        status: trackingForm.status as Shipment['status'],
                        tracking_number: trackingForm.tracking_number || shipment?.tracking_number,
                        carrier: trackingForm.carrier,
                        tracking_event: {
                          status: trackingForm.status,
                          note: trackingForm.tracking_note,
                          location: 'seller-dashboard',
                        },
                      } as any))}
                    >
                      {busyAction === 'updateShipmentStatus' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Push event trang thai
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="text-sm font-medium text-foreground">Lich su tracking</div>
                    {trackingHistory.length ? trackingHistory.map((event: any, index: number) => (
                      <div key={`${event.timestamp || index}-${index}`} className="rounded-2xl border border-border bg-card p-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="font-medium text-foreground">{shipmentStageLabel[event.status] || event.status || 'Tracking event'}</div>
                          <div className="text-xs text-muted-foreground">{event.timestamp ? new Date(event.timestamp).toLocaleString('vi-VN') : '--'}</div>
                        </div>
                        {(event.note || event.location) && (
                          <div className="mt-1 text-sm text-muted-foreground">{event.note || 'Khong co ghi chu'}{event.location ? ` - ${event.location}` : ''}</div>
                        )}
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                        Chua co tracking history.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
