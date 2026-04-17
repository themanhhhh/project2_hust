'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2, Package, Truck } from 'lucide-react';
import { Footer } from '@/components/shop/Footer';
import { Header } from '@/components/shop/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUserOrders } from '@/hooks/useApi';
import { formatPrice } from '@/lib/productMapper';

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending_payment: { label: 'Chờ thanh toán', variant: 'secondary' },
  paid: { label: 'Đã thanh toán', variant: 'default' },
  awaiting_shipment: { label: 'Chuẩn bị giao', variant: 'default' },
  awaiting_collection: { label: 'Chờ lấy hàng', variant: 'default' },
  in_transit: { label: 'Đang vận chuyển', variant: 'default' },
  delivered: { label: 'Hoàn tất', variant: 'outline' },
  completed: { label: 'Hoàn tất', variant: 'outline' },
  cancelled: { label: 'Đã hủy', variant: 'destructive' },
  confirmed: { label: 'Đã xác nhận', variant: 'default' },
  shipping: { label: 'Đang giao', variant: 'default' },
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { data: orders, loading } = useUserOrders(user?.id || '');

  if (!authLoading && !isAuthenticated) {
    router.replace('/login');
    return null;
  }

  const displayOrders = Array.isArray(orders) ? orders : [];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_30%,_#f9fafb_100%)]">
        <div className="border-b bg-white/90 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link>
              <span>/</span>
              <Link href="/account" className="hover:text-foreground transition-colors">Tài khoản</Link>
              <span>/</span>
              <span className="text-foreground">Đơn hàng</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto max-w-5xl px-4 py-10">
          <div className="mb-8 rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_34%),linear-gradient(135deg,_#ffffff,_#eff6ff_60%,_#f8fafc)] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-700">
                  Đơn hàng của tôi
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Theo dõi đơn hàng và giao nhận</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Xem tiến độ fulfillment, mã vận đơn và truy cập trang tracking chi tiết cho từng đơn.
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 px-5 py-4 text-sm text-slate-600 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Tổng đơn</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">{displayOrders.length}</div>
              </div>
            </div>
          </div>

          {(loading || authLoading) && (
            <div className="flex min-h-[240px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" /> Đang tải đơn hàng...
              </div>
            </div>
          )}

          {!loading && !authLoading && (displayOrders.length > 0 ? (
            <div className="space-y-4">
              {displayOrders.map((order: any) => {
                const orderNumber = order.orderNumber || order.order_number || order.id;
                const items = order.items || order.order_items || [];
                const status = statusMap[order.status] || { label: order.status, variant: 'outline' as const };
                const trackingNumber = order.shipments?.[0]?.tracking_number;

                return (
                  <Card key={order.id} className="border-slate-200 bg-white/95 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="font-mono text-sm font-semibold text-slate-900">{orderNumber}</div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : order.created_at ? new Date(order.created_at).toLocaleString('vi-VN') : ''}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          <Badge variant="outline">{formatPrice(order.total || 0)}</Badge>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                            <Package className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-2">
                            <p className="text-sm text-slate-700">
                              {items.length > 0
                                ? items.map((item: any, i: number) => (
                                    <span key={item.id || i}>
                                      {item.product?.name || 'Sản phẩm'} x{item.quantity || 1}
                                      {i < items.length - 1 && ', '}
                                    </span>
                                  ))
                                : 'Đơn hàng đang được đồng bộ sản phẩm'}
                            </p>
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span>{items.length} sản phẩm</span>
                              {trackingNumber && (
                                <span className="inline-flex items-center gap-1">
                                  <Truck className="h-3.5 w-3.5" /> {trackingNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2">
                          {trackingNumber && (
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/tracking/${trackingNumber}`}>Tracking</Link>
                            </Button>
                          )}
                          <Button asChild size="sm">
                            <Link href={`/account/orders/${order.id}`}>
                              Xem chi tiết
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
              <Package className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-600">Bạn chưa có đơn hàng nào</p>
              <Button asChild className="mt-6">
                <Link href="/products">Mua sắm ngay</Link>
              </Button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
