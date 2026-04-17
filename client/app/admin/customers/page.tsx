'use client';

import { useState, useMemo, useEffect } from 'react';

import { Search, Filter, Mail, Phone, UserPlus, Loader2, ChevronLeft, ChevronRight, Download, Pencil, Trash2 } from 'lucide-react';
import { useOrders, useUsers } from '@/hooks/useApi';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/productMapper';
import { AdminSelect } from '@/components/admin/AdminSelect';
import { AdminLoading } from '@/components/admin/AdminLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { exportCustomersToExcel } from '@/lib/exportCustomersToExcel';
import { createExcelFileName } from '@/lib/excelExportUtils';
import { api } from '@/lib/api';

export default function AdminCustomersPage() {
  const { data: usersResponse, loading, refetch } = useUsers();
  const { data: orders, loading: ordersLoading } = useOrders();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<any | null>(null);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    is_active: true,
  });
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    is_active: true,
  });
  const itemsPerPage = 10;
  const users = usersResponse?.data || [];
  const apiPagination = usersResponse?.pagination || { total: users.length, totalPages: Math.ceil(users.length / itemsPerPage) };

  // Transform API users to customer format
  const allCustomers = useMemo(() => {
    const ordersByUser = new Map<string, { totalOrders: number; totalSpent: number; lastOrderDate: string }>();

    (orders || []).forEach((order: any) => {
      if (order.status === 'cancelled') return;

      const userId = order.userId || order.user_id || order.user?.id;
      if (!userId) return;

      const createdAt = order.createdAt || order.created_at;
      const current = ordersByUser.get(userId) || {
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: '',
      };

      current.totalOrders += 1;
      current.totalSpent += Number(order.total || 0);

      if (createdAt) {
        const createdAtDate = new Date(createdAt);
        const previousDate = current.lastOrderDate ? new Date(current.lastOrderDate) : null;

        if (!previousDate || createdAtDate > previousDate) {
          current.lastOrderDate = createdAt;
        }
      }

      ordersByUser.set(userId, current);
    });

    return (users || []).map(user => {
      const orderStats = ordersByUser.get(user.id);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'N/A',
        totalOrders: orderStats?.totalOrders || 0,
        totalSpent: orderStats?.totalSpent || 0,
        status: user.is_active === false ? 'inactive' as const : 'active' as const,
        joinedDate: (user.createdAt || (user as any).created_at) ? new Date(user.createdAt || (user as any).created_at).toLocaleDateString('vi-VN') : '',
        lastOrderDate: orderStats?.lastOrderDate ? new Date(orderStats.lastOrderDate).toLocaleDateString('vi-VN') : '',
      };
    });
  }, [orders, users]);
  
  // Filter
  const filteredCustomers = useMemo(() => {
    return allCustomers.filter(customer => {
      const matchesSearch = !searchQuery || 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery);
        
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [allCustomers, searchQuery, statusFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const displayCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage]);
  const filteredCustomerIds = useMemo(
    () => filteredCustomers.map((customer) => customer.id),
    [filteredCustomers]
  );

  const allVisibleSelected = displayCustomers.length > 0 && displayCustomers.every((customer) => selectedUserIds.includes(customer.id));

  useEffect(() => {
    setSelectedUserIds((prev) => {
      const nextSelected = prev.filter((id) => filteredCustomerIds.includes(id));

      if (nextSelected.length === prev.length && nextSelected.every((id, index) => id === prev[index])) {
        return prev;
      }

      return nextSelected;
    });
  }, [filteredCustomerIds]);

  if (loading || ordersLoading) {
    return <AdminLoading fullPage text="Đang tải khách hàng..." />;
  }

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await exportCustomersToExcel(filteredCustomers, createExcelFileName('khach-hang'));
    } finally {
      setExporting(false);
    }
  };

  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !displayCustomers.some((customer) => customer.id === id)));
      return;
    }

    setSelectedUserIds((prev) => Array.from(new Set([...prev, ...displayCustomers.map((customer) => customer.id)])));
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);
  };

  const handleOpenEdit = (customer: any) => {
    setEditingCustomer(customer);
    setEditFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone === 'N/A' ? '' : customer.phone || '',
      is_active: customer.status === 'active',
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenCreate = () => {
    setCreateFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      is_active: true,
    });
    setIsCreateDialogOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      await api.users.create({
        name: createFormData.name,
        email: createFormData.email,
        phone: createFormData.phone || undefined,
        password: createFormData.password,
        role: 'customer',
        is_active: createFormData.is_active,
      } as any);
      toast.success('Tạo khách hàng thành công');
      setIsCreateDialogOpen(false);
      await refetch();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Không thể tạo khách hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    try {
      setIsSubmitting(true);
      await api.users.update(editingCustomer.id, {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone || undefined,
        is_active: editFormData.is_active,
      });
      toast.success('Cập nhật user thành công');
      setIsEditDialogOpen(false);
      setEditingCustomer(null);
      await refetch();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Không thể cập nhật user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingCustomer) return;

    try {
      setIsDeletingCustomer(true);
      await api.users.delete(deletingCustomer.id);
      toast.success('Da xoa user');
      setSelectedUserIds((prev) => prev.filter((id) => id !== deletingCustomer.id));
      setDeletingCustomer(null);
      await refetch();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Khong the xoa user');
    } finally {
      setIsDeletingCustomer(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;

    try {
      setIsBulkDeleting(true);
      await Promise.all(selectedUserIds.map((id) => api.users.delete(id)));
      toast.success(`Da xoa ${selectedUserIds.length} user`);
      setSelectedUserIds([]);
      setIsBulkDeleteDialogOpen(false);
      await refetch();
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      toast.error('Khong the xoa cac user da chon');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
          <p className="text-muted-foreground">
            Tổng cộng {apiPagination.total} khách hàng
          </p>
        </div>
        <div className="flex gap-2">
          {selectedUserIds.length > 0 && (
            <button
              onClick={() => setIsBulkDeleteDialogOpen(true)}
              disabled={isBulkDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 py-2.5 font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {isBulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
              {isBulkDeleting ? 'Dang xoa...' : `Xoa da chon (${selectedUserIds.length})`}
            </button>
          )}
          <button
            onClick={handleExportExcel}
            disabled={exporting || filteredCustomers.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 py-2.5 font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
          <button onClick={handleOpenCreate} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Thêm khách hàng
          </button>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm khách hàng</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-customer-name">Tên</Label>
              <Input id="create-customer-name" value={createFormData.name} onChange={(e) => setCreateFormData((prev) => ({ ...prev, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-customer-email">Email</Label>
              <Input id="create-customer-email" type="email" value={createFormData.email} onChange={(e) => setCreateFormData((prev) => ({ ...prev, email: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-customer-phone">Số điện thoại</Label>
              <Input id="create-customer-phone" value={createFormData.phone} onChange={(e) => setCreateFormData((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-customer-password">Mật khẩu </Label>
              <Input id="create-customer-password" type="password" value={createFormData.password} onChange={(e) => setCreateFormData((prev) => ({ ...prev, password: e.target.value }))} required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-customer-status">Trạng thái</Label>
              <AdminSelect
                value={createFormData.is_active ? 'active' : 'inactive'}
                onValueChange={(value) => setCreateFormData((prev) => ({ ...prev, is_active: value === 'active' }))}
                options={[
                  { value: 'active', label: 'Hoạt động' },
                  { value: 'inactive', label: 'Không hoạt động' },
                ]}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSubmitting}>Huỷ</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Tạo khách hàng
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Tổng khách hàng</p>
          <p className="text-2xl font-bold text-foreground">{apiPagination.total}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Khách hoạt động</p>
          <p className="text-2xl font-bold text-foreground">
            {allCustomers.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Tổng doanh thu</p>
          <p className="text-2xl font-bold text-foreground">
            {formatPrice(allCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0))}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl p-4 border border-border flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <label htmlFor="customer-search" className="sr-only">Tìm kiếm khách hàng</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            id="customer-search"
            type="search"
            name="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại…"
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <AdminSelect
          value={statusFilter}
          onValueChange={setStatusFilter}
          placeholder="Tất cả trạng thái"
          className="w-[180px]"
          options={[
            { value: 'all', label: 'Tất cả trạng thái' },
            { value: 'active', label: 'Hoạt động' },
            { value: 'inactive', label: 'Không hoạt động' },
          ]}
        />
        <button className="h-10 px-4 border border-input rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 text-sm focus-visible:ring-2 focus-visible:ring-ring">
          <Filter className="h-4 w-4" aria-hidden="true" />
          Bộ lọc
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    className="rounded"
                    aria-label="Chọn tất cả khách hàng"
                    checked={allVisibleSelected}
                    onChange={handleSelectAllVisible}
                  />
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Khách hàng</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Liên hệ</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Đơn hàng</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Tổng chi tiêu</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Trạng thái</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    Không tìm thấy khách hàng nào
                  </td>
                </tr>
              ) : (
                displayCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded"
                        aria-label={`Chọn ${customer.name}`}
                        checked={selectedUserIds.includes(customer.id)}
                        onChange={() => handleSelectUser(customer.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white font-medium dark:bg-white dark:text-black">
                            {customer.name.charAt(0)}
                          </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{customer.totalOrders} đơn</p>
                        {customer.lastOrderDate && (
                          <p className="text-xs text-muted-foreground">Lần cuối: {customer.lastOrderDate}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">{formatPrice(customer.totalSpent)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        customer.status === 'active' 
                          ? 'bg-black text-white dark:bg-white dark:text-black' 
                          : 'bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground'
                      }`}>
                        {customer.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(customer)}
                          aria-label={`Chinh sua ${customer.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingCustomer(customer)}
                          aria-label={`Xoa ${customer.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Hiển thị {filteredCustomers.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredCustomers.length)} của {filteredCustomers.length} khách hàng
          </p>
          
          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {totalPages > 0 ? Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )) : (
                <Button
                  variant="default"
                  size="sm"
                  className="w-8 h-8 p-0"
                  disabled
                >
                  1
                </Button>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(Math.max(1, totalPages), prev + 1))}
              disabled={currentPage >= totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cap nhat user</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Ten</Label>
              <Input id="customer-name" value={editFormData.name} onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input id="customer-email" type="email" value={editFormData.email} onChange={(e) => setEditFormData((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-phone">So dien thoai</Label>
              <Input id="customer-phone" value={editFormData.phone} onChange={(e) => setEditFormData((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-status">Trang thai</Label>
              <AdminSelect
                value={editFormData.is_active ? 'active' : 'inactive'}
                onValueChange={(value) => setEditFormData((prev) => ({ ...prev, is_active: value === 'active' }))}
                options={[
                  { value: 'active', label: 'Hoat dong' },
                  { value: 'inactive', label: 'Khong hoat dong' },
                ]}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>Huy</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Luu thay doi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingCustomer} onOpenChange={(open) => !open && !isDeletingCustomer && setDeletingCustomer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xac nhan xoa user</AlertDialogTitle>
            <AlertDialogDescription>
              User da chon se bi xoa vinh vien. Hanh dong nay khong the hoan tac.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCustomer}>Huy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletingCustomer}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
              onClick={handleDeleteUser}
            >
              {isDeletingCustomer ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Dang xoa...
                </>
              ) : 'Xoa user'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xac nhan xoa nhieu user</AlertDialogTitle>
            <AlertDialogDescription>
              {`Ban sap xoa ${selectedUserIds.length} user da chon. Hanh dong nay khong the hoan tac.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>Huy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isBulkDeleting}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
              onClick={handleBulkDelete}
            >
              {isBulkDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Dang xoa...
                </>
              ) : 'Xoá người dùng'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
