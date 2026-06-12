'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useOrder } from '@/hooks/useApi';
import { formatPrice } from '@/lib/productMapper';
import { AdminLoading } from '@/components/admin/AdminLoading';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Package, 
  User, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Truck,
  AlertCircle
} from 'lucide-react';
import type { LegacyOrder } from '@/lib/types';

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300',
  pending_payment: 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300',
  paid: 'bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-white',
  awaiting_shipment: 'bg-gray-300 text-gray-800 dark:bg-slate-600 dark:text-white',
  awaiting_collection: 'bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-white',
  in_transit: 'bg-gray-300 text-gray-800 dark:bg-slate-600 dark:text-white',
  delivered: 'bg-black text-white dark:bg-white dark:text-black',
  completed: 'bg-black text-white dark:bg-white dark:text-black',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-slate-900 dark:text-slate-400',
  confirmed: 'bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-white',
  shipping: 'bg-gray-300 text-gray-800 dark:bg-slate-600 dark:text-white',
};

const statusLabels: Record<string, string> = {
  pending: 'Chờ xử lý',
  pending_payment: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  awaiting_shipment: 'Chờ tạo shipment',
  awaiting_collection: 'Chờ lấy hàng',
  in_transit: 'Đang trung chuyển',
  delivered: 'Hoàn tất',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang vận chuyển',
};

const paymentMethodLabels: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  banking: 'Chuyển khoản ngân hàng',
};

const paymentStatusLabels: Record<string, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
  refunded: 'Đã hoàn tiền',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300',
  paid: 'bg-black text-white dark:bg-white dark:text-black',
  failed: 'bg-gray-100 text-gray-500 dark:bg-slate-900 dark:text-slate-400',
  refunded: 'bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-white',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const { data: order, loading, error } = useOrder(id);

  if (loading) {
    return <AdminLoading fullPage text="Đang tải thông tin đơn hàng..." />;
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-foreground" />
        <h2 className="text-xl font-bold mb-2">Không tìm thấy đơn hàng</h2>
        <p className="text-muted-foreground mb-6">
          Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Button onClick={() => router.push('/seller/orders')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // The backend might return order_items or items
  const displayOrder = order as LegacyOrder;
  const orderItems = displayOrder.order_items || displayOrder.items || [];
  const totalProducts = orderItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const createdAt = displayOrder.createdAt || displayOrder.created_at;
  const shippingFee = displayOrder.shippingFee || displayOrder.shipping_fee || 0;
  const paymentMethod = displayOrder.paymentMethod || displayOrder.payment_method || 'cod';
  const paymentStatus = displayOrder.paymentStatus || displayOrder.payment_status || 'pending';
  const shippingAddress = displayOrder.address || displayOrder;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/seller/orders')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Đơn hàng #{displayOrder.orderNumber || displayOrder.order_number || order.id?.substring(0, 8)}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                {statusLabels[order.status] || order.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="h-4 w-4" />
              {createdAt ? new Date(createdAt).toLocaleString('vi-VN') : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {order.status === 'pending' && (
            <Button variant="default" className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-slate-200">
              Xác nhận đơn
            </Button>
          )}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <Button variant="destructive">
              Hủy đơn
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Sản phẩm đã đặt ({totalProducts})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {orderItems.map((item) => {
                const product = item.product;
                const price = item.price || product?.price || 0;
                const productImage = product?.images?.[0]?.url || product?.product_images?.[0]?.url || product?.product_images?.[0]?.image_url;
                
                return (
                  <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      {productImage ? (
                        <Image
                          src={productImage}
                          alt={product?.name || 'Sản phẩm'}
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between gap-4">
                        <div>
                          <h3 className="font-medium line-clamp-2">{product?.name || item.name || 'Sản phẩm không xác định'}</h3>
                          <p className="text-sm text-muted-foreground mt-1">Mã SP: {product?.sku || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(price)}</p>
                          <p className="text-sm text-muted-foreground mt-1">x {item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <p className="font-semibold text-foreground">{formatPrice(price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-card border border-border rounded-xl overflow-hidden p-4 sm:p-6 space-y-4">
            <h2 className="text-lg font-semibold">Tổng quan đơn hàng</h2>
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatPrice(order.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-foreground">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="border-t border-border pt-3 mt-3 flex justify-between items-center">
                <span className="font-semibold text-lg">Tổng cộng</span>
                <span className="font-bold text-xl text-foreground">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info, Shipping, Payment */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-card border border-border rounded-xl overflow-hidden p-4 sm:p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <User className="h-5 w-5" />
              Khách hàng
            </h2>
            {order.user ? (
              <div className="space-y-3 text-sm">
                <p className="font-medium text-base">{order.user.name}</p>
                <p className="text-muted-foreground">{order.user.email}</p>
                <p className="text-muted-foreground">{order.user.phone || 'Chưa cung cấp SĐT'}</p>
                
                <div className="pt-3 border-t border-border mt-3">
                  <Link href={`/admin/customers/${order.user.id}`} className="font-medium text-foreground hover:text-muted-foreground hover:underline">
                    Xem hồ sơ khách hàng
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Khách vãng lai</p>
            )}
          </div>

          {/* Shipping Info */}
          <div className="bg-card border border-border rounded-xl overflow-hidden p-4 sm:p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5" />
              Thông tin giao hàng
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Người nhận:</span>
                <p className="font-medium">{shippingAddress.fullName || shippingAddress.full_name || order.user?.name}</p>
                <p>{shippingAddress.phone || order.user?.phone}</p>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Địa chỉ giao hàng:</span>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="leading-relaxed">
                    {shippingAddress.street}, {shippingAddress.ward}, {shippingAddress.district}, {shippingAddress.province}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-card border border-border rounded-xl overflow-hidden p-4 sm:p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5" />
              Thanh toán
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Phương thức thanh toán:</span>
                <p className="font-medium">{paymentMethodLabels[paymentMethod] || paymentMethod}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trạng thái:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${paymentStatusColors[paymentStatus] || 'bg-gray-100 text-gray-700'}`}>
                  {paymentStatusLabels[paymentStatus] || paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Internal Note */}
          {(order.note || displayOrder.customer_note) && (
            <div className="overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-6">
              <h2 className="mb-2 text-lg font-semibold">Ghi chú của khách</h2>
              <p className="text-sm text-muted-foreground">
                {order.note || displayOrder.customer_note}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
