'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DollarSign, ShoppingCart, Users, Package, MoreHorizontal, Eye } from 'lucide-react';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { StatsCard } from '@/components/admin/StatsCard';
import { useOrders, useProducts, useDashboardStats } from '@/hooks/useApi';
import { formatPrice } from '@/lib/productMapper';
import { AdminLoading } from '@/components/admin/AdminLoading';
import { AdminSelect } from '@/components/admin/AdminSelect';

export default function AdminDashboardPage() {
  const monthOptions = [
    { value: '0', label: 'Tháng 1' },
    { value: '1', label: 'Tháng 2' },
    { value: '2', label: 'Tháng 3' },
    { value: '3', label: 'Tháng 4' },
    { value: '4', label: 'Tháng 5' },
    { value: '5', label: 'Tháng 6' },
    { value: '6', label: 'Tháng 7' },
    { value: '7', label: 'Tháng 8' },
    { value: '8', label: 'Tháng 9' },
    { value: '9', label: 'Tháng 10' },
    { value: '10', label: 'Tháng 11' },
    { value: '11', label: 'Tháng 12' },
  ];

  const [chartView, setChartView] = useState<'year' | 'month' | 'week'>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const { data: stats, loading: statsLoading } = useDashboardStats();
  const { data: orders, loading: ordersLoading } = useOrders();
  const { data: products, loading: productsLoading } = useProducts();
  
  // Use API data only - no mock fallback
  const recentOrders = orders?.slice(0, 5) || [];
  const loading = statsLoading || ordersLoading || productsLoading; // Keep others for lists for now

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    (orders || []).forEach((order: any) => {
      const rawDate = order.created_at || order.createdAt;
      if (!rawDate) return;
      const date = new Date(rawDate);
      if (!Number.isNaN(date.getTime())) {
        years.add(date.getFullYear());
      }
    });

    if (years.size === 0) {
      years.add(new Date().getFullYear());
    }

    return Array.from(years).sort((a, b) => b - a);
  }, [orders]);

  const revenueChartData = useMemo(() => {
    if (chartView === 'year') {
      const initial = availableYears
        .slice()
        .sort((a, b) => a - b)
        .map((year) => ({ label: `${year}`, revenue: 0, orders: 0 }));

      (orders || []).forEach((order: any) => {
        if (order.status === 'cancelled') return;

        const rawDate = order.created_at || order.createdAt;
        if (!rawDate) return;

        const date = new Date(rawDate);
        if (Number.isNaN(date.getTime())) return;

        const bucket = initial.find((item) => item.label === `${date.getFullYear()}`);
        if (!bucket) return;
        bucket.revenue += Number(order.total || 0);
        bucket.orders += 1;
      });

      return initial;
    }

    if (chartView === 'week') {
      const initial = [
        { label: 'W1', revenue: 0, orders: 0 },
        { label: 'W2', revenue: 0, orders: 0 },
        { label: 'W3', revenue: 0, orders: 0 },
        { label: 'W4', revenue: 0, orders: 0 },
        { label: 'W5', revenue: 0, orders: 0 },
      ];

      (orders || []).forEach((order: any) => {
        if (order.status === 'cancelled') return;

        const rawDate = order.created_at || order.createdAt;
        if (!rawDate) return;

        const date = new Date(rawDate);
        if (
          Number.isNaN(date.getTime()) ||
          date.getFullYear().toString() !== selectedYear ||
          date.getMonth().toString() !== selectedMonth
        ) {
          return;
        }

        const weekIndex = Math.min(4, Math.floor((date.getDate() - 1) / 7));
        initial[weekIndex].revenue += Number(order.total || 0);
        initial[weekIndex].orders += 1;
      });

      return initial;
    }

    const monthLabels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const initial = monthLabels.map((label) => ({ label, revenue: 0, orders: 0 }));

    (orders || []).forEach((order: any) => {
      if (order.status === 'cancelled') return;

      const rawDate = order.created_at || order.createdAt;
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime()) || date.getFullYear().toString() !== selectedYear) return;

      const monthIndex = date.getMonth();
      initial[monthIndex].revenue += Number(order.total || 0);
      initial[monthIndex].orders += 1;
    });

    return initial;
  }, [availableYears, chartView, orders, selectedMonth, selectedYear]);

  const selectedScopeRevenue = useMemo(
    () => revenueChartData.reduce((sum, item) => sum + item.revenue, 0),
    [revenueChartData]
  );

  const chartTitle = useMemo(() => {
    if (chartView === 'year') return 'Doanh thu theo năm';
    if (chartView === 'week') return 'Doanh thu theo tuần';
    return 'Doanh thu theo tháng';
  }, [chartView]);

  const chartDescription = useMemo(() => {
    if (chartView === 'year') return `${formatPrice(selectedScopeRevenue)} trên toàn bộ các năm hiện có`;
    if (chartView === 'week') {
      const monthLabel = monthOptions.find((item) => item.value === selectedMonth)?.label || '';
      return `${formatPrice(selectedScopeRevenue)} trong ${monthLabel.toLowerCase()} năm ${selectedYear}`;
    }
    return `${formatPrice(selectedScopeRevenue)} trong năm ${selectedYear}`;
  }, [chartView, monthOptions, selectedMonth, selectedScopeRevenue, selectedYear]);

  const dynamicStats = {
    totalRevenue: stats?.totalRevenue || 0,
    totalOrders: stats?.totalOrders || 0,
    totalCustomers: stats?.totalCustomers || 0,
    totalProducts: stats?.totalProducts || 0,
    revenueGrowth: stats?.revenueGrowth || 0,
    ordersGrowth: stats?.ordersGrowth || 0,
    customersGrowth: stats?.customersGrowth || 0,
    productsGrowth: stats?.productsGrowth || 0,
  };

  const topSellingProducts = useMemo(() => {
    const productSales = new Map<string, { id: string; name: string; orders: number; quantity: number }>();

    (orders || []).forEach((order: any) => {
      if (order.status === 'cancelled') return;

      const items = order.order_items || order.items || [];
      items.forEach((item: any) => {
        const productId = item.product?.id || item.product_id || item.productId;
        if (!productId) return;

        const existing = productSales.get(productId) || {
          id: productId,
          name: item.product?.name || 'San pham',
          orders: 0,
          quantity: 0,
        };

        existing.name = item.product?.name || existing.name;
        existing.orders += 1;
        existing.quantity += Number(item.quantity || 0);

        productSales.set(productId, existing);
      });
    });

    return Array.from(productSales.values())
      .sort((a, b) => {
        if (b.quantity !== a.quantity) return b.quantity - a.quantity;
        return b.orders - a.orders;
      })
      .slice(0, 3);
  }, [orders]);

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

  if (loading) {
    return <AdminLoading fullPage text="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng doanh thu"
          value={formatPrice(dynamicStats.totalRevenue)}
          change={dynamicStats.revenueGrowth}
          icon={DollarSign}
          iconColor="text-foreground"
          iconBg="bg-muted"
        />
        <StatsCard
          title="Đơn hàng"
          value={dynamicStats.totalOrders.toLocaleString()}
          change={dynamicStats.ordersGrowth}
          icon={ShoppingCart}
          iconColor="text-foreground"
          iconBg="bg-muted"
        />
        <StatsCard
          title="Khách hàng"
          value={dynamicStats.totalCustomers.toLocaleString()}
          change={dynamicStats.customersGrowth}
          icon={Users}
          iconColor="text-foreground"
          iconBg="bg-muted"
        />
        <StatsCard
          title="Sản phẩm"
          value={dynamicStats.totalProducts.toLocaleString()}
          change={dynamicStats.productsGrowth}
          icon={Package}
          iconColor="text-foreground"
          iconBg="bg-muted"
        />
      </div>

      {/* Charts and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="rounded-2xl border border-border bg-sidebar p-6 dark:border-slate-800 dark:bg-slate-950 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">{chartTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{chartDescription}</p>
            </div>
            <div className="flex items-center gap-2">
              <AdminSelect
                value={chartView}
                onValueChange={(value) => setChartView(value as 'year' | 'month' | 'week')}
                className="w-[130px]"
                options={[
                  { value: 'year', label: 'Theo năm' },
                  { value: 'month', label: 'Theo tháng' },
                  { value: 'week', label: 'Theo tuần' },
                ]}
              />
              {chartView !== 'year' && (
                <AdminSelect
                  value={selectedYear}
                  onValueChange={setSelectedYear}
                  className="w-[130px]"
                  options={availableYears.map((year) => ({ value: year.toString(), label: `Nam ${year}` }))}
                />
              )}
              {chartView === 'week' && (
                <AdminSelect
                  value={selectedMonth}
                  onValueChange={setSelectedMonth}
                  className="w-[130px]"
                  options={monthOptions}
                />
              )}
            </div>
          </div>
          <RevenueChart data={revenueChartData} />
        </div>

        {/* Top Products */}
        <div className="rounded-2xl border border-border bg-sidebar p-6 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm bán chạy</h2>
          <div className="space-y-4">
            {topSellingProducts.length > 0 ? topSellingProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${
                  i === 0 ? 'bg-black text-white dark:bg-white dark:text-black' :
                  i === 1 ? 'bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-white' :
                  'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{product.quantity} sản phẩm / {product.orders} đơn</p>
                </div>
              </div>
            )) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Chưa có dữ liệu bán hàng để xếp hạng sản phẩm.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="overflow-hidden rounded-2xl border border-border bg-sidebar dark:border-slate-800 dark:bg-slate-950">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Đơn hàng gần đây</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-foreground hover:text-muted-foreground">
            Xem tất cả
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Mã đơn</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Khách hàng</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Sản phẩm</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Tổng tiền</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Trạng thái</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.map((order: any) => (
                <tr key={order.id || order.orderNumber} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium">{order.id || order.orderNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{order.customer || order.user?.name || 'Khách hàng'}</p>
                      <p className="text-sm text-muted-foreground">{order.email || order.user?.email || ''}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm truncate max-w-[200px]">
                      {order.products?.join(', ') || order.items?.map((i: any) => i.product?.name).join(', ') || 'Sản phẩm'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{formatPrice(order.total)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-2 hover:bg-accent rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Xem chi tiết đơn hàng ${order.id || order.orderNumber}`}
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </button>
                      <button 
                        className="p-2 hover:bg-accent rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Tùy chọn khác cho đơn hàng ${order.id || order.orderNumber}`}
                      >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
