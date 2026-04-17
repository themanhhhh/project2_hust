'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Zap,
  Ticket,
  Image,
  Calendar,
  Package,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  Target,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useCampaigns } from '@/hooks/useApi';
import { formatPrice } from '@/lib/productMapper';
import { AdminSelect } from '@/components/admin/AdminSelect';
import { AdminLoading } from '@/components/admin/AdminLoading';
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

export default function AdminCampaignsPage() {
  const { data: campaigns, loading } = useCampaigns();
  const [typeFilter, setTypeFilter] = useState('all');
  const [deletingCampaign, setDeletingCampaign] = useState<any | null>(null);
  const [isDeletingCampaign, setIsDeletingCampaign] = useState(false);

  // Use API data directly
  const displayCampaigns = campaigns || [];

  // Calculate dynamic stats
  const dynamicStats = {
    totalCampaigns: displayCampaigns.length,
    activeCampaigns: displayCampaigns.filter((c: any) => c.status === 'active' || c.isActive).length,
    totalBudget: (displayCampaigns as any[]).reduce((sum, c) => sum + (c.budget || 0), 0),
    totalRevenue: (displayCampaigns as any[]).reduce((sum, c) => sum + (c.revenue || 0), 0),
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground',
    scheduled: 'bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-white',
    active: 'bg-black text-white dark:bg-white dark:text-black',
    paused: 'bg-gray-300 text-gray-800 dark:bg-slate-600 dark:text-white',
    ended: 'bg-gray-100 text-gray-500 dark:bg-slate-900 dark:text-slate-400',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Nháp',
    scheduled: 'Đã lên lịch',
    active: 'Đang chạy',
    paused: 'Tạm dừng',
    ended: 'Đã kết thúc',
  };

  const typeIcons: Record<string, typeof Zap> = {
    flash_sale: Zap,
    voucher: Ticket,
    banner: Image,
    seasonal: Calendar,
    combo: Package,
    percentage: Ticket,
    fixed: DollarSign,
    free_shipping: Package,
  };

  const typeLabels: Record<string, string> = {
    flash_sale: 'Flash Sale',
    voucher: 'Voucher',
    banner: 'Banner Ads',
    seasonal: 'Theo mùa',
    combo: 'Combo',
    percentage: 'Giảm %',
    fixed: 'Giảm tiền',
    free_shipping: 'Free Ship',
  };

  const typeColors: Record<string, string> = {
    flash_sale: 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300',
    voucher: 'bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-white',
    banner: 'bg-gray-300 text-gray-800 dark:bg-slate-600 dark:text-white',
    seasonal: 'bg-black text-white dark:bg-white dark:text-black',
    combo: 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300',
    percentage: 'bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-white',
    fixed: 'bg-gray-300 text-gray-800 dark:bg-slate-600 dark:text-white',
    free_shipping: 'bg-black text-white dark:bg-white dark:text-black',
  };

  if (loading) {
    return <AdminLoading fullPage text="Đang tải chiến dịch..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý chiến dịch</h1>
          <p className="text-muted-foreground">
            Quản lý các chiến dịch marketing và khuyến mãi
          </p>
        </div>
        <Link
          href="/admin/campaigns/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 font-medium text-white transition-colors hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-slate-200"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tạo chiến dịch
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2 dark:bg-slate-800">
              <Target className="h-5 w-5 text-black dark:text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng chiến dịch</p>
              <p className="text-2xl font-bold">{dynamicStats.totalCampaigns}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2 dark:bg-slate-800">
              <Play className="h-5 w-5 text-black dark:text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đang hoạt động</p>
              <p className="text-2xl font-bold">{dynamicStats.activeCampaigns}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2 dark:bg-slate-800">
              <DollarSign className="h-5 w-5 text-black dark:text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng ngân sách</p>
              <p className="text-xl font-bold">{formatPrice(dynamicStats.totalBudget)}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2 dark:bg-slate-800">
              <TrendingUp className="h-5 w-5 text-black dark:text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Doanh thu từ chiến dịch</p>
              <p className="text-xl font-bold">{formatPrice(dynamicStats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['Tất cả', 'Đang chạy', 'Đã lên lịch', 'Tạm dừng', 'Nháp', 'Đã kết thúc'].map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
               i === 0 ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-card border border-input hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl p-4 border border-border flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <label htmlFor="campaign-search" className="sr-only">Tìm kiếm chiến dịch</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            id="campaign-search"
            type="search"
            name="search"
            placeholder="Tìm kiếm chiến dịch…"
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <AdminSelect
          value={typeFilter}
          onValueChange={setTypeFilter}
          placeholder="Loại chiến dịch"
          className="w-[180px]"
          options={[
            { value: 'all', label: 'Tất cả loại' },
            { value: 'flash_sale', label: 'Flash Sale' },
            { value: 'voucher', label: 'Voucher' },
            { value: 'banner', label: 'Banner Ads' },
            { value: 'seasonal', label: 'Theo mùa' },
            { value: 'combo', label: 'Combo' },
          ]}
        />
        <div>
          <label htmlFor="campaign-date" className="sr-only">Lọc theo ngày</label>
          <input
            id="campaign-date"
            type="date"
            className="h-10 px-4 border border-input rounded-lg bg-background text-sm focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <button className="h-10 px-4 border border-input rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 text-sm focus-visible:ring-2 focus-visible:ring-ring">
          <Filter className="h-4 w-4" aria-hidden="true" />
          Bộ lọc
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" aria-label="Chọn tất cả chiến dịch" />
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Chiến dịch</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Loại</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Thời gian</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Ngân sách</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Hiệu suất</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Trạng thái</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayCampaigns.map((campaign: any) => {
                const TypeIcon = typeIcons[campaign.type] || Ticket;
                
                // Fields might be undefined or different based on type usage
                const budget = campaign.budget || 0;
                const spent = campaign.spent || 0;
                const budgetPercent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
                
                const clicks = campaign.clicks || 0;
                const conversions = campaign.conversions || 0;
                const conversionRate = clicks > 0 
                  ? ((conversions / clicks) * 100).toFixed(1) 
                  : 0;
                
                const status = campaign.status; // Now using status field directly
                
                return (
                  <tr key={campaign.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" aria-label={`Chọn ${campaign.name}`} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[campaign.type] || 'bg-muted text-muted-foreground'}`}>
                          <TypeIcon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">{campaign.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[campaign.type] || 'bg-muted text-muted-foreground'}`}>
                        {typeLabels[campaign.type] || campaign.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {campaign.start_date && (
                            <p className="text-sm">{new Date(campaign.start_date).toLocaleDateString('vi-VN')}</p>
                        )}
                        {campaign.end_date && (
                             <p className="text-xs text-muted-foreground">→ {new Date(campaign.end_date).toLocaleDateString('vi-VN')}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{formatPrice(spent)}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${budgetPercent > 80 ? 'bg-destructive' : budgetPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{budgetPercent}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <Eye className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                          <span>{(campaign.impressions || 0).toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MousePointerClick className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                          <span>{(clicks).toLocaleString()} clicks ({conversionRate}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" aria-hidden="true" />
                          <span className="text-green-600 dark:text-green-400 font-medium">{formatPrice(campaign.revenue || 0)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-muted text-muted-foreground'}`}>
                        {statusLabels[status] || status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/campaigns/${campaign.id}/edit`} 
                          className="p-2 hover:bg-accent hover:text-accent-foreground text-primary rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-ring" 
                          aria-label={`Sửa ${campaign.name}`}
                        >
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <button 
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-ring group" 
                          aria-label={`Xóa ${campaign.name}`}
                          onClick={() => setDeletingCampaign(campaign)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị 1-{displayCampaigns.length} / {displayCampaigns.length} chiến dịch
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 border border-input rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50" disabled>
              Trước
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
              1
            </button>
            <button className="px-3 py-2 border border-input rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50" disabled>
              Sau
            </button>
          </div>
        </div>
      </div>

      <AlertDialog open={!!deletingCampaign} onOpenChange={(open) => !open && setDeletingCampaign(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa chiến dịch</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingCampaign?.name ? `Chiến dịch "${deletingCampaign.name}" sẽ bị xóa vĩnh viễn.` : 'Chiến dịch này sẽ bị xóa vĩnh viễn.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCampaign}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletingCampaign}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
              onClick={async () => {
                if (!deletingCampaign) return;
                try {
                  setIsDeletingCampaign(true);
                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/campaigns/${deletingCampaign.id}`, {
                    method: 'DELETE',
                  });
                  if (response.ok) {
                    toast.success('Đã xóa chiến dịch');
                    setDeletingCampaign(null);
                    window.location.reload();
                  } else {
                    toast.error('Không thể xóa chiến dịch');
                  }
                } catch {
                  toast.error('Có lỗi xảy ra');
                } finally {
                  setIsDeletingCampaign(false);
                }
              }}
            >
              {isDeletingCampaign ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa chiến dịch'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
