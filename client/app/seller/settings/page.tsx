'use client';

import { useState } from 'react';
import { Loader2, Store, FileText, CheckCircle, Clock, XCircle, AlertCircle, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useSellerAuth } from '@/contexts/SellerAuthContext';
import { useSellerKyb } from '@/hooks/useApi';
import { sellerApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdminLoading } from '@/components/admin/AdminLoading';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function KybStatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: LucideIcon; label: string; className: string }> = {
    pending:  { icon: Clock,        label: 'Đang chờ duyệt',   className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    approved: { icon: CheckCircle,  label: 'Đã được duyệt',   className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    rejected: { icon: XCircle,      label: 'Bị từ chối',       className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  };
  const c = config[status] || { icon: AlertCircle, label: status, className: 'bg-gray-100 text-gray-700' };
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${c.className}`}>
      <Icon className="h-4 w-4" />
      {c.label}
    </span>
  );
}

export default function SellerSettingsPage() {
  const { seller, refreshSeller } = useSellerAuth();
  const { data: kyb, loading: kybLoading, refetch: refetchKyb } = useSellerKyb();

  // Store profile state
  const [storeName, setStoreName]       = useState(seller?.store_name || '');
  const [description, setDescription]  = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // KYB form state
  const [businessName, setBusinessName]   = useState('');
  const [taxId, setTaxId]                 = useState('');
  const [docUrl, setDocUrl]               = useState('');
  const [submittingKyb, setSubmittingKyb] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await sellerApi.updateProfile({ store_name: storeName, description });
      await refreshSeller();
      toast.success('Cập nhật thông tin gian hàng thành công!');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Cập nhật thất bại.'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSubmitKyb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !taxId) {
      toast.error('Vui lòng điền đầy đủ tên doanh nghiệp và mã số thuế.');
      return;
    }
    setSubmittingKyb(true);
    try {
      await sellerApi.submitKyb({
        business_name: businessName,
        business_registration_number: taxId,
        document_url: docUrl,
      });
      toast.success('Nộp hồ sơ KYB thành công! Hồ sơ đang chờ Admin xét duyệt.');
      refetchKyb();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Nộp hồ sơ thất bại.'));
    } finally {
      setSubmittingKyb(false);
    }
  };

  if (kybLoading) return <AdminLoading fullPage text="Đang tải thông tin..." />;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Cài đặt gian hàng</h1>
        <p className="text-muted-foreground mt-1">Quản lý thông tin gian hàng và xác thực doanh nghiệp (KYB).</p>
      </div>

      {/* Store Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Store className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Thông tin gian hàng</CardTitle>
              <CardDescription>Cập nhật tên và mô tả gian hàng của bạn.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Tên gian hàng</label>
              <Input value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Cửa hàng thể thao ABC" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Mô tả gian hàng</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về cửa hàng..."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email gian hàng</label>
              <Input value={seller?.email || ''} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground mt-1">Email không thể thay đổi.</p>
            </div>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang lưu...</> : 'Lưu thay đổi'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* KYB Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Xác thực doanh nghiệp (KYB)</CardTitle>
              <CardDescription>Nộp hồ sơ để được Admin duyệt và kích hoạt gian hàng.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Current KYB status */}
          {kyb ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trạng thái hồ sơ</span>
                <KybStatusBadge status={kyb.status || 'pending'} />
              </div>

              <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tên doanh nghiệp</span>
                  <span className="font-medium">{kyb.business_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã số doanh nghiệp</span>
                  <span className="font-medium">{kyb.business_registration_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày nộp</span>
                  <span className="font-medium">{kyb.created_at ? new Date(kyb.created_at).toLocaleDateString('vi-VN') : 'Chưa có'}</span>
                </div>
              </div>

              {kyb.status === 'rejected' && kyb.admin_notes && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">Lý do từ chối:</p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">{kyb.admin_notes}</p>
                </div>
              )}

              {/* Allow resubmit if rejected */}
              {kyb.status === 'rejected' && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">Bạn có thể nộp lại hồ sơ sau khi chỉnh sửa thông tin.</p>
                  <KybForm
                    businessName={businessName}
                    taxId={taxId}
                    docUrl={docUrl}
                    setBusinessName={setBusinessName}
                    setTaxId={setTaxId}
                    setDocUrl={setDocUrl}
                    onSubmit={handleSubmitKyb}
                    loading={submittingKyb}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Gian hàng cần được xác thực trước khi có thể bán hàng. Vui lòng cung cấp thông tin doanh nghiệp của bạn.
                </p>
              </div>
              <KybForm
                businessName={businessName}
                taxId={taxId}
                docUrl={docUrl}
                setBusinessName={setBusinessName}
                setTaxId={setTaxId}
                setDocUrl={setDocUrl}
                onSubmit={handleSubmitKyb}
                loading={submittingKyb}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface KybFormProps {
  businessName: string;
  taxId: string;
  docUrl: string;
  setBusinessName: (value: string) => void;
  setTaxId: (value: string) => void;
  setDocUrl: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  loading: boolean;
}

function KybForm({ businessName, taxId, docUrl, setBusinessName, setTaxId, setDocUrl, onSubmit, loading }: KybFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5">Tên doanh nghiệp / Hộ kinh doanh <span className="text-red-500">*</span></label>
        <Input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Công ty TNHH ABC" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Mã số thuế / Số đăng ký kinh doanh <span className="text-red-500">*</span></label>
        <Input value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="0123456789" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Link tài liệu xác thực (hình ảnh, PDF)</label>
        <Input value={docUrl} onChange={e => setDocUrl(e.target.value)} placeholder="https://drive.google.com/..." />
        <p className="text-xs text-muted-foreground mt-1">Link đến giấy đăng ký kinh doanh hoặc CMND/CCCD.</p>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang nộp hồ sơ...</> : 'Nộp hồ sơ KYB'}
      </Button>
    </form>
  );
}
