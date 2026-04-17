'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { orderApi } from '@/lib/api';
import { formatPrice } from '@/lib/productMapper';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: {
    name?: string;
    slug?: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  order_items?: OrderItem[];
}

const paymentLabels: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  banking: 'Chuyển khoản ngân hàng',
  momo: 'Ví MoMo',
  vnpay: 'VNPay',
};

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderNumber);

  useEffect(() => {
    if (!orderNumber) return;

    const fetchOrder = async () => {
      try {
        const data = await orderApi.getByOrderNumber(orderNumber);
        setOrder(data as any);
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center">
            <Link href="/" className="text-xl font-bold tracking-[0.2em] uppercase">
              BadmintonPro
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
          <p className="text-muted-foreground">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
            <span className="text-muted-foreground">Đang tải thông tin đơn hàng...</span>
          </div>
        ) : order ? (
          <>
            {/* Order Info */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                      Mã đơn hàng
                    </p>
                    <p className="font-mono font-medium">{order.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                      Ngày đặt
                    </p>
                    <p className="font-medium">{formatDate(order.created_at)}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Items */}
                {order.order_items && order.order_items.length > 0 && (
                  <div className="space-y-3">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.product?.name || 'Sản phẩm'}{' '}
                          <span className="text-muted-foreground">x{item.quantity}</span>
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Separator className="my-4" />

                <div className="flex justify-between font-medium text-lg">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Fallback when no order number in URL */
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                Đơn hàng của bạn đã được ghi nhận. Bạn có thể xem chi tiết trong phần{' '}
                <Link href="/account" className="text-primary underline">tài khoản</Link>.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tracking Info */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Đơn hàng đang được xử lý</p>
                <p className="text-sm text-muted-foreground">
                  Chúng tôi sẽ thông báo khi đơn hàng được giao cho đơn vị vận chuyển
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild variant="outline" className="flex-1 h-12">
            <Link href="/account">
              Xem đơn hàng của tôi
            </Link>
          </Button>
          <Button asChild className="flex-1 h-12">
            <Link href="/products">
              Tiếp tục mua sắm
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50">
          <div className="flex min-h-screen items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Dang tai don hang...
            </div>
          </div>
        </main>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
