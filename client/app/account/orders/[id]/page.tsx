'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, MapPin, CreditCard, Loader2, AlertCircle, Truck, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Header } from '@/components/shop/Header';
import { Footer } from '@/components/shop/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { orderApi } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { useShipmentByOrder } from '@/hooks/useApi';
import { formatPrice } from '@/lib/productMapper';
import type { Order } from '@/lib/types';

// Status config
const statusConfig: Record<string, { label: string; color: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Package }> = {
  pending: { label: 'Chờ xác nhận', color: 'secondary', icon: Clock },
  pending_payment: { label: 'Chờ thanh toán', color: 'secondary', icon: Clock },
  paid: { label: 'Đã thanh toán', color: 'default', icon: CheckCircle2 },
  awaiting_shipment: { label: 'Đang chuẩn bị hàng', color: 'default', icon: Package },
  awaiting_collection: { label: 'Chờ lấy hàng', color: 'default', icon: Truck },
  in_transit: { label: 'Đang vận chuyển', color: 'default', icon: Truck },
  completed: { label: 'Hoàn tất', color: 'outline', icon: CheckCircle2 },
  confirmed: { label: 'Đã xác nhận', color: 'default', icon: CheckCircle2 },
  shipping: { label: 'Đang giao hàng', color: 'default', icon: Truck },
  delivered: { label: 'Hoàn tất', color: 'outline', icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy', color: 'destructive', icon: XCircle },
};

const paymentMethodLabels: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  banking: 'Chuyển khoản ngân hàng',
  momo: 'Ví MoMo',
  vnpay: 'VNPay',
};

const paymentStatusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chưa thanh toán', color: 'text-yellow-600 bg-yellow-50' },
  paid: { label: 'Đã thanh toán', color: 'text-green-600 bg-green-50' },
  failed: { label: 'Thanh toán thất bại', color: 'text-red-600 bg-red-50' },
  refunded: { label: 'Đã hoàn tiền', color: 'text-blue-600 bg-blue-50' },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseTrackingHistory(trackingHistory: any) {
  if (!trackingHistory) return [];
  if (Array.isArray(trackingHistory)) return trackingHistory;

  try {
    const parsed = JSON.parse(trackingHistory);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderIdentifier } = use(params);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Fetch order - try by order number first (ORD-xxx format), fallback to ID
  const { data: order, loading, error } = useApi(
    () => {
      if (orderIdentifier.startsWith('ORD-')) {
        return orderApi.getByOrderNumber(orderIdentifier);
      }
      return orderApi.getById(orderIdentifier);
    },
    [orderIdentifier]
  );
  const { data: shipment } = useShipmentByOrder(order?.id || orderIdentifier);

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    router.replace('/login');
    return null;
  }

  if (loading || authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </main>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-20 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Không tìm thấy đơn hàng</h1>
            <p className="text-muted-foreground mb-6">Đơn hàng {orderIdentifier} không tồn tại hoặc bạn không có quyền xem.</p>
            <Button asChild variant="outline">
              <Link href="/account">Về tài khoản</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Handle snake_case from API
  const orderNumber = order.orderNumber || (order as any).order_number || orderIdentifier;
  const orderItems = order.items || (order as any).order_items || [];
  const createdAt = order.createdAt || (order as any).created_at;
  const shippingFee = order.shippingFee ?? (order as any).shipping_fee ?? 0;
  const paymentMethod = order.paymentMethod || (order as any).payment_method || 'cod';
  const paymentStatus = order.paymentStatus || (order as any).payment_status || 'pending';
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const trackingHistory = parseTrackingHistory((shipment as any)?.tracking_history);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link>
              <span>/</span>
              <Link href="/account" className="hover:text-foreground transition-colors">Tài khoản</Link>
              <span>/</span>
              <span className="text-foreground">{orderNumber}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back button + Title */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Đơn hàng {orderNumber}</h1>
              {createdAt && (
                <p className="text-sm text-muted-foreground mt-1">
                  Đặt ngày {formatDate(createdAt)}
                </p>
              )}
            </div>
            <Badge variant={status.color} className="text-sm px-3 py-1.5 gap-1.5">
              <StatusIcon className="h-4 w-4" />
              {status.label}
            </Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Sản phẩm ({orderItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderItems.map((item: any, index: number) => {
                      const productName = item.product?.name || item.name || 'Sản phẩm';
                      const itemPrice = item.price || 0;
                      const itemQuantity = item.quantity || 1;
                      const itemImage = item.product?.product_images?.[0]?.image_url || 
                                       item.product?.images?.[0]?.url || '';

                      return (
                        <div key={item.id || index}>
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                              {itemImage && itemImage.startsWith('http') ? (
                                <img src={itemImage} alt={productName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-8 w-8 text-gray-300" />
                                </div>
                              )}
                            </div>
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-2">{productName}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Số lượng: {itemQuantity}
                              </p>
                            </div>
                            {/* Price */}
                            <div className="text-right shrink-0">
                              <p className="font-medium text-sm">{formatPrice(itemPrice * itemQuantity)}</p>
                              {itemQuantity > 1 && (
                                <p className="text-xs text-muted-foreground">{formatPrice(itemPrice)}/sp</p>
                              )}
                            </div>
                          </div>
                          {index < orderItems.length - 1 && <Separator className="mt-4" />}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {order.address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Địa chỉ giao hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {order.address.fullName || (order.address as any).full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.address.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.address.street}
                        {order.address.ward && `, ${order.address.ward}`}
                        {order.address.district && `, ${order.address.district}`}
                        {order.address.province && `, ${order.address.province}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {shipment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Theo dõi giao hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Carrier</p>
                        <p className="mt-2 font-medium">{(shipment as any).carrier || 'Đang cập nhật'}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Tracking</p>
                        <p className="mt-2 font-medium break-all">{(shipment as any).tracking_number || 'Chưa có'}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Shipment</p>
                        <p className="mt-2 font-medium">{(shipment as any).status || 'pending'}</p>
                      </div>
                    </div>

                    {(shipment as any).tracking_number && (
                      <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link href={`/tracking/${(shipment as any).tracking_number}`}>
                          Xem trang tracking chi tiết
                        </Link>
                      </Button>
                    )}

                    <div className="space-y-3">
                      {trackingHistory.length > 0 ? trackingHistory.map((event: any, index: number) => (
                        <div key={`${event.timestamp || index}-${index}`} className="flex gap-3 rounded-xl border p-3">
                          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <p className="font-medium">{event.status || 'Cập nhật vận chuyển'}</p>
                              <p className="text-xs text-muted-foreground">
                                {event.timestamp ? new Date(event.timestamp).toLocaleString('vi-VN') : '--'}
                              </p>
                            </div>
                            {(event.note || event.location) && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {event.note || 'Đang cập nhật'}{event.location ? ` - ${event.location}` : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                          Shipment đã được tạo nhưng chưa có timeline tracking.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span>{formatPrice(order.subtotal || order.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span>{shippingFee > 0 ? formatPrice(shippingFee) : 'Miễn phí'}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giảm giá</span>
                      <span className="text-green-600">-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Phương thức</p>
                    <p className="text-sm font-medium">{paymentMethodLabels[paymentMethod] || paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trạng thái</p>
                    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mt-1 ${
                      paymentStatusLabels[paymentStatus]?.color || 'text-gray-600 bg-gray-50'
                    }`}>
                      {paymentStatusLabels[paymentStatus]?.label || paymentStatus}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Note */}
              {order.note && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ghi chú</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{order.note}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
