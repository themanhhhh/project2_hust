'use client';

import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Calendar,
  Download,
  Loader2
} from 'lucide-react';
import { useSellerOrders, useProducts, useUsers } from '@/hooks/useApi';
import { formatPrice } from '@/lib/productMapper';
import { AdminSelect } from '@/components/admin/AdminSelect';
import { AdminLoading } from '@/components/admin/AdminLoading';

type PeriodType = 'week' | 'month' | 'year';

function getDateRange(period: PeriodType, year: number, month: number): { start: Date; end: Date } {
  const now = new Date();
  
  if (period === 'year') {
    return {
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31, 23, 59, 59),
    };
  }
  
  if (period === 'month') {
    return {
      start: new Date(year, month, 1),
      end: new Date(year, month + 1, 0, 23, 59, 59),
    };
  }
  
  // week - current week (Mon-Sun)
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
}

function getPeriodLabel(period: PeriodType, year: number, month: number): string {
  if (period === 'year') return `Năm ${year}`;
  if (period === 'month') {
    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    return `${monthNames[month]} / ${year}`;
  }
  return 'Tuần này';
}

// Generate chart data based on period
function getChartData(orders: any[], period: PeriodType, year: number, month: number) {
  if (period === 'year') {
    // Monthly breakdown
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthOrders = orders.filter((o: any) => {
        const d = new Date(o.created_at || o.createdAt);
        return d.getMonth() === i;
      });
      const revenue = monthOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total || 0), 0);
      return { label: `T${i + 1}`, revenue, orders: monthOrders.length };
    });
    return months;
  }
  
  if (period === 'month') {
    // Daily breakdown
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const dayOrders = orders.filter((o: any) => {
        const d = new Date(o.created_at || o.createdAt);
        return d.getDate() === i + 1;
      });
      const revenue = dayOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total || 0), 0);
      return { label: `${i + 1}`, revenue, orders: dayOrders.length };
    });
    return days;
  }
  
  // Week - daily breakdown (Mon-Sun)
  const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  
  const days = Array.from({ length: 7 }, (_, i) => {
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + i);
    
    const dayOrders = orders.filter((o: any) => {
      const d = new Date(o.created_at || o.createdAt);
      return d.getFullYear() === targetDate.getFullYear() && 
             d.getMonth() === targetDate.getMonth() && 
             d.getDate() === targetDate.getDate();
    });
    const revenue = dayOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total || 0), 0);
    return { label: dayNames[i], revenue, orders: dayOrders.length };
  });
  return days;
}

export default function AdminReportsPage() {
  const { data: sellerOrdersResult, loading: ordersLoading } = useSellerOrders({ page: 1, limit: 1000 });
  const { data: products, loading: productsLoading } = useProducts();
  const { data: usersResponse, loading: usersLoading } = useUsers();
  const users = usersResponse?.data || [];
  const orders = sellerOrdersResult?.data || [];

  const now = new Date();
  const [period, setPeriod] = useState<PeriodType>('year');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  const loading = ordersLoading || productsLoading || usersLoading;

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const { start, end } = getDateRange(period, selectedYear, selectedMonth);
    return orders.filter((order: any) => {
      const orderDate = new Date(order.created_at || order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  }, [orders, period, selectedYear, selectedMonth]);

  // Calculate stats from filtered orders
  const totalRevenue = filteredOrders.reduce(
    (sum: number, order: any) => sum + parseFloat(order.total || 0), 0
  );

  // Calculate previous period stats to compute growth
  const previousPeriodStats = useMemo(() => {
    let prevStart: Date, prevEnd: Date;
    
    if (period === 'year') {
      prevStart = new Date(selectedYear - 1, 0, 1);
      prevEnd = new Date(selectedYear - 1, 11, 31, 23, 59, 59);
    } else if (period === 'month') {
      const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
      const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
      prevStart = new Date(prevYear, prevMonth, 1);
      prevEnd = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59);
    } else {
      const { start } = getDateRange('week', selectedYear, selectedMonth);
      prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 7);
      prevEnd = new Date(start);
      prevEnd.setMilliseconds(-1);
    }
    
    const prevOrders = orders.filter((order: any) => {
      const orderDate = new Date(order.created_at || order.createdAt);
      return orderDate >= prevStart && orderDate <= prevEnd;
    });
    
    return {
      revenue: prevOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total || 0), 0),
      orders: prevOrders.length,
    };
  }, [orders, period, selectedYear, selectedMonth]);

  const calcGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  };

  const revenueGrowth = calcGrowth(totalRevenue, previousPeriodStats.revenue);
  const ordersGrowth = calcGrowth(filteredOrders.length, previousPeriodStats.orders);

  const stats = {
    totalRevenue,
    totalOrders: filteredOrders.length,
    totalCustomers: users?.length || 0,
    totalProducts: products?.length || 0,
    revenueGrowth,
    ordersGrowth,
    customersGrowth: 0,
    productsGrowth: 0,
  };

  // Chart data
  const chartData = useMemo(
    () => getChartData(filteredOrders, period, selectedYear, selectedMonth),
    [filteredOrders, period, selectedYear, selectedMonth]
  );
  const maxRevenue = Math.max(...chartData.map(m => m.revenue), 1);

  // Category sales (simplified)
  const categorySales = useMemo(() => {
    const catMap = new Map<string, number>();
    (products || []).forEach((p: any) => {
      const catName = p.category?.name || 'Khác';
      catMap.set(catName, (catMap.get(catName) || 0) + 1);
    });
    const total = products?.length || 1;
    const colors = ['bg-black', 'bg-gray-700', 'bg-gray-500', 'bg-gray-400', 'bg-gray-300', 'bg-gray-200 dark:bg-gray-600'];
    return Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count], i) => ({
        name,
        sales: Math.round((count / total) * 100),
        color: colors[i % colors.length],
      }));
  }, [products]);

  // Display data
  const displayProducts = products || [];
  const displayOrders = filteredOrders;

  // Year options
  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  if (loading) {
    return <AdminLoading fullPage text="Đang tải dữ liệu báo cáo..." />;
  }

  const chartTitle = period === 'year' 
    ? 'Doanh thu theo tháng' 
    : period === 'month' 
    ? 'Doanh thu theo ngày' 
    : 'Doanh thu theo ngày trong tuần';

  return (
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Báo cáo & Thống kê</h1>
          <p className="text-muted-foreground">
            {getPeriodLabel(period, selectedYear, selectedMonth)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 py-2.5 font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900">
            <Download className="h-4 w-4" aria-hidden="true" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Period Filters */}
      <div className="rounded-xl border border-border bg-card p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Period Type Toggle */}
          <div className="flex rounded-lg bg-muted p-1 dark:bg-slate-900">
            {([
              { key: 'week' as PeriodType, label: 'Tuần' },
              { key: 'month' as PeriodType, label: 'Tháng' },
              { key: 'year' as PeriodType, label: 'Năm' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  period === key
                    ? 'bg-background shadow-sm text-primary dark:bg-white dark:text-black'
                    : 'text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          
          {/* Year Select */}
          {period !== 'week' && (
            <AdminSelect
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(Number(v))}
              className="w-[140px]"
              icon={<Calendar className="h-4 w-4" />}
              options={yearOptions.map((y) => ({ value: String(y), label: `Năm ${y}` }))}
            />
          )}

          {/* Month Select */}
          {period === 'month' && (
            <AdminSelect
              value={String(selectedMonth)}
              onValueChange={(v) => setSelectedMonth(Number(v))}
              className="w-[150px]"
              options={monthNames.map((name, i) => ({ value: String(i), label: name }))}
            />
          )}

          {/* Period Summary */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
            <Calendar className="h-4 w-4" />
            <span>{getPeriodLabel(period, selectedYear, selectedMonth)}</span>
            <span className="text-xs">• {filteredOrders.length} đơn hàng</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
         <div className="rounded-xl border border-border bg-card p-5 dark:border-slate-800 dark:bg-slate-950">
           <div className="flex items-center justify-between mb-3">
             <div className="rounded-lg bg-gray-100 p-2 dark:bg-slate-800">
               <DollarSign className="h-5 w-5 text-black dark:text-white" aria-hidden="true" />
             </div>
             <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-slate-300">
               {stats.revenueGrowth >= 0 ? <TrendingUp className="h-4 w-4" aria-hidden="true" /> : <TrendingDown className="h-4 w-4" aria-hidden="true" />}
               {stats.revenueGrowth}%
             </div>
          </div>
          <p className="text-sm text-muted-foreground">Doanh thu</p>
          <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
        </div>

         <div className="rounded-xl border border-border bg-card p-5 dark:border-slate-800 dark:bg-slate-950">
           <div className="flex items-center justify-between mb-3">
             <div className="rounded-lg bg-gray-100 p-2 dark:bg-slate-800">
               <ShoppingCart className="h-5 w-5 text-black dark:text-white" aria-hidden="true" />
             </div>
             <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-slate-300">
               {stats.ordersGrowth >= 0 ? <TrendingUp className="h-4 w-4" aria-hidden="true" /> : <TrendingDown className="h-4 w-4" aria-hidden="true" />}
               {stats.ordersGrowth}%
             </div>
          </div>
          <p className="text-sm text-muted-foreground">Đơn hàng</p>
          <p className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</p>
        </div>

         <div className="rounded-xl border border-border bg-card p-5 dark:border-slate-800 dark:bg-slate-950">
           <div className="flex items-center justify-between mb-3">
             <div className="rounded-lg bg-gray-100 p-2 dark:bg-slate-800">
               <Users className="h-5 w-5 text-black dark:text-white" aria-hidden="true" />
             </div>
          </div>
          <p className="text-sm text-muted-foreground">Khách hàng</p>
          <p className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</p>
        </div>

         <div className="rounded-xl border border-border bg-card p-5 dark:border-slate-800 dark:bg-slate-950">
           <div className="flex items-center justify-between mb-3">
             <div className="rounded-lg bg-gray-100 p-2 dark:bg-slate-800">
               <Package className="h-5 w-5 text-black dark:text-white" aria-hidden="true" />
             </div>
          </div>
          <p className="text-sm text-muted-foreground">Sản phẩm</p>
          <p className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Row */}
       <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
         <div className="rounded-2xl border border-border bg-card p-6 dark:border-slate-800 dark:bg-slate-950 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">{chartTitle}</h2>
              <p className="text-sm text-muted-foreground">
                {getPeriodLabel(period, selectedYear, selectedMonth)}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                 <div className="h-3 w-3 rounded-sm bg-black dark:bg-white" />
                <span>Doanh thu</span>
              </div>
            </div>
          </div>
          
          {/* Bar Chart */}
          <div className="h-64 flex items-end gap-[2px]">
            {chartData.map((item) => (
              <div key={item.label} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                <div 
                   className="w-full cursor-pointer rounded-t-md bg-gradient-to-t from-black to-gray-600 transition-all hover:from-gray-900 hover:to-gray-500 dark:from-white dark:to-slate-400 dark:hover:from-slate-200 dark:hover:to-slate-500"
                  style={{ 
                    height: `${(item.revenue / maxRevenue) * 100}%`,
                    minHeight: item.revenue > 0 ? '20px' : '4px'
                  }}
                  title={`${item.label}: ${formatPrice(item.revenue)} (${item.orders} đơn)`}
                />
                <span className={`text-muted-foreground ${chartData.length > 15 ? 'text-[10px]' : 'text-xs'}`}>
                  {chartData.length > 20 && parseInt(item.label) % 5 !== 1 ? '' : item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Sales */}
         <div className="rounded-2xl border border-border bg-card p-6 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold mb-6">Sản phẩm theo danh mục</h2>
          <div className="space-y-4">
            {categorySales.map((category) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">{category.sales}%</span>
                </div>
                 <div className="h-2 overflow-hidden rounded-full bg-muted dark:bg-slate-800">
                  <div 
                    className={`h-full ${category.color} rounded-full transition-all`}
                    style={{ width: `${category.sales}%` }}
                  />
                </div>
              </div>
            ))}
            {categorySales.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
         <div className="rounded-2xl border border-border bg-card p-6 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm bán chạy</h2>
          <div className="space-y-4">
            {displayProducts.slice(0, 5).map((product: any, i: number) => (
              <div key={product.id} className="flex items-center gap-4">
                 <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                   i === 0 ? 'bg-black text-white dark:bg-white dark:text-black' :
                   i === 1 ? 'bg-gray-200 text-gray-800 dark:bg-slate-800 dark:text-white' :
                   i === 2 ? 'bg-gray-300 text-gray-800 dark:bg-slate-700 dark:text-white' :
                   'bg-gray-100 text-gray-700 dark:bg-slate-900 dark:text-slate-300'
                 }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.brand?.name || product.brand || ''}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(product.price)}</p>
                  <p className="text-xs text-muted-foreground">{product.rating || 0} ⭐</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders in Period */}
         <div className="rounded-2xl border border-border bg-card p-6 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold mb-4">
            Đơn hàng gần đây
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({displayOrders.length} đơn)
            </span>
          </h2>
          <div className="space-y-4">
            {displayOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Không có đơn hàng trong khoảng thời gian này
              </p>
            ) : (
              displayOrders.slice(0, 5).map((order: any) => (
                 <div key={order.id || order.order_number} className="flex items-start gap-4">
                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
                     <ShoppingCart className="h-4 w-4 text-black dark:text-white" aria-hidden="true" />
                   </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{order.user?.name || 'Khách hàng'}</span>
                      {' '}đã đặt hàng{' '}
                      <span className="font-medium">{order.order_number || order.id}</span>
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {(order.created_at || order.createdAt) ? new Date(order.created_at || order.createdAt).toLocaleDateString('vi-VN') : ''}
                    </p>
                  </div>
                  <span className="font-medium text-sm">{formatPrice(order.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
