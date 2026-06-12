'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ShoppingBag, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/productMapper';

function VnpayReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId') || '';
  const transactionNo = searchParams.get('transactionNo') || '';
  const amount = searchParams.get('amount');
  const message = searchParams.get('message') || '';
  const code = searchParams.get('code') || '';

  const isSuccess = status === 'success';
  const displayAmount = amount ? Number(amount) : 0;

  // Auto-redirect countdown for success
  useEffect(() => {
    if (!isSuccess) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(`/checkout/verify?orderIds=${encodeURIComponent(orderId)}&index=0`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess, orderId, router]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-10 pb-8 px-8">
          {isSuccess ? (
            /* ====== SUCCESS STATE ====== */
            <div className="text-center space-y-6">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Thanh toán thành công!</h1>
                <p className="text-gray-500 mt-2">Đơn hàng của bạn đã được thanh toán qua VNPay</p>
              </div>

              {/* Transaction Info */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-sm">
                {transactionNo && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mã giao dịch</span>
                    <span className="font-mono font-medium">{transactionNo}</span>
                  </div>
                )}
                {displayAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số tiền</span>
                    <span className="font-semibold text-green-600">{formatPrice(displayAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Phương thức</span>
                  <span className="font-medium">VNPay</span>
                </div>
              </div>

              {/* Auto redirect notice */}
              <p className="text-sm text-gray-400">
                Tự động chuyển sang xác nhận đơn hàng sau {countdown} giây...
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() =>
                    router.push(`/checkout/verify?orderIds=${encodeURIComponent(orderId)}&index=0`)
                  }
                  className="w-full h-12"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Xác nhận đơn hàng
                </Button>
                <Link href="/">
                  <Button variant="outline" className="w-full h-11">
                    <Home className="h-4 w-4 mr-2" />
                    Về trang chủ
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* ====== FAILURE STATE ====== */
            <div className="text-center space-y-6">
              {/* Error Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                  <XCircle className="h-12 w-12 text-red-500" />
                </div>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Thanh toán thất bại</h1>
                <p className="text-gray-500 mt-2">
                  {message || 'Giao dịch không thành công. Vui lòng thử lại.'}
                </p>
              </div>

              {/* Error Info */}
              {code && (
                <div className="bg-red-50 rounded-xl p-4 text-sm">
                  <span className="text-red-600">Mã lỗi: {code}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Link href="/cart">
                  <Button className="w-full h-12">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Quay lại giỏ hàng
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full h-11">
                    <Home className="h-4 w-4 mr-2" />
                    Về trang chủ
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default function VnpayReturnPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </main>
      }
    >
      <VnpayReturnContent />
    </Suspense>
  );
}
