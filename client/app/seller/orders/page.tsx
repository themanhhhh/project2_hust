'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Eye, Loader2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSellerOrders } from '@/hooks/useApi';
import { useSellerAuth } from '@/contexts/SellerAuthContext';
import { sellerApi } from '@/lib/api';
import { formatPrice } from '@/lib/productMapper';
import { AdminLoading } from '@/components/admin/AdminLoading';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LegacyOrder, Order } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({ value, label }));

export default function SellerOrdersPage() {
  const { seller } = useSellerAuth();
  const [searchInput, setSearchInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [filters, setFilters] = useState({ search: '', status: 'all', date: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  const [statusState, setStatusState] = useState<Record<string, string>>({});
  const itemsPerPage = 10;

  // Dùng useSellerOrders — sẽ gắn Seller JWT token vào request
  const { data, loading, refetch } = useSellerOrders({
    page: currentPage,
    limit: itemsPerPage,
    search: filters.search,
    status: filters.status,
    date: filters.date,
  });

  const displayOrders = useMemo(
    () => (data?.data || []) as LegacyOrder[],
    [data?.data]
  );
  const pagination = data?.pagination || { total: 0, totalPages: 1 };
  const filteredOrdersCount = pagination.total;
  const totalPages = pagination.totalPages;

  useEffect(() => {
    const nextState: Record<string, string> = {};
    displayOrders.forEach((order) => {
      nextState[order.id] = order.status;
    });
    setStatusState(prev => {
      const allSame = Object.keys(nextState).every(k => prev[k] === nextState[k]);
      return allSame ? prev : nextState;
    });
  }, [displayOrders]);

  const handleApplyFilters = () => {
    setFilters(prev => ({ ...prev, search: searchInput, date: dateInput }));
    setCurrentPage(1);
  };

  const handleStatusTabClick = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
    setCurrentPage(1);
  };

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    const previousStatus = statusState[orderId];
    setStatusState(prev => ({ ...prev, [orderId]: nextStatus }));
    setUpdatingOrderId(orderId);
    try {
      await sellerApi.updateMyOrder(orderId, { status: nextStatus as Order['status'] });
      await refetch();
    } catch {
      setStatusState(prev => ({ ...prev, [orderId]: previousStatus }));
      toast.error('Không thể cập nhật trạng thái đơn hàng.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deletingOrderId) return;
    setIsDeletingOrder(true);
    try {
      await sellerApi.deleteMyOrder(deletingOrderId);
      toast.success('Đã xóa đơn hàng.');
      setDeletingOrderId(null);
      await refetch();
    } catch {
      toast.error('Không thể xóa đơn hàng.');
    } finally {
      setIsDeletingOrder(false);
    }
  };

  if (!seller) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Vui lòng đăng nhập để xem đơn hàng.</p>
      </div>
    );
  }

  if (loading) return <AdminLoading fullPage text="Đang tải đơn hàng..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Đơn hàng của gian hàng</h1>
          <p className="text-muted-foreground">{seller.store_name} — {filteredOrdersCount} đơn hàng</p>
        </div>
      </div>

      <AlertDialog open={!!deletingOrderId} onOpenChange={(open) => !open && !isDeletingOrder && setDeletingOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đơn hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Đơn hàng đã chọn sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingOrder}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletingOrder}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
              onClick={handleDeleteOrder}
            >
              {isDeletingOrder ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xóa...</> : 'Xóa đơn hàng'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'pending_payment', 'paid', 'awaiting_shipment', 'in_transit', 'completed', 'cancelled'].map((statusKey) => (
          <button
            key={statusKey}
            onClick={() => handleStatusTabClick(statusKey)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filters.status === statusKey ? 'bg-foreground text-background' : 'bg-card border border-input hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {statusKey === 'all' ? 'Tất cả' : statusLabels[statusKey] || statusKey}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl p-4 border border-border flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Tìm theo mã đơn, tên khách hàng…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
          />
        </div>
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="h-10 px-4 border border-input rounded-lg bg-background text-sm"
        />
        <button onClick={handleApplyFilters} className="h-10 px-4 border border-input rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 text-sm">
          <Filter className="h-4 w-4" />
          Bộ lọc
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Mã đơn</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Khách hàng</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Sản phẩm</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Tổng tiền</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Ngày đặt</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Trạng thái</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Gian hàng chưa có đơn hàng nào.
                  </td>
                </tr>
              ) : displayOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium">{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{order.customer || order.user?.name || 'Khách hàng'}</p>
                      <p className="text-sm text-muted-foreground">{order.email || order.user?.email || ''}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">
                      {(order.order_items || order.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0)} sản phẩm
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold">{formatPrice(order.total)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">
                      {new Date(order.created_at || order.createdAt || new Date()).toLocaleDateString('vi-VN')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {updatingOrderId === order.id ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Đang cập nhật
                      </div>
                    ) : (
                      <Select
                        value={statusState[order.id] || order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className={`h-9 min-w-[170px] rounded-full border-0 px-3 text-xs font-medium shadow-none focus-visible:ring-2 focus-visible:ring-ring ${statusColors[statusState[order.id] || order.status] || 'bg-gray-100 text-gray-700'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border border-slate-200 bg-white p-1 shadow-xl">
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="rounded-xl px-3 py-2 text-sm">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Link href={`/seller/orders/${order.id}`} className="p-2 hover:bg-accent rounded-lg transition-colors">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Link>
                      <button className="p-2 hover:bg-accent rounded-lg transition-colors" onClick={() => setDeletingOrderId(order.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Hiển thị {filteredOrdersCount > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredOrdersCount)} của {filteredOrdersCount} đơn hàng
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {totalPages > 0 ? Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
              <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" className="w-8 h-8 p-0" onClick={() => setCurrentPage(page)}>
                {page}
              </Button>
            )) : (
              <Button variant="default" size="sm" className="w-8 h-8 p-0" disabled>1</Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(Math.max(1, totalPages), prev + 1))} disabled={currentPage >= totalPages || totalPages === 0}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
