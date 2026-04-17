'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  ChevronLeft, 
  Zap, 
  Ticket, 
  Calendar, 
  Package,
  Save,
  Search,
  X,
  Check,
  Loader2,
  Trash2,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProducts, useCampaign } from '@/hooks/useApi';
import { uploadApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface Product {
  id: string;
  name: string;
  price: number;
  images?: { url: string }[];
  product_images?: { image_url?: string; url?: string; is_primary?: boolean; is_delete?: boolean }[];
  brand?: { name: string };
}

function getProductThumbnail(product: Product): string {
  const rawImages = (product.product_images || product.images || []) as Array<{ image_url?: string; url?: string; is_primary?: boolean; is_delete?: boolean }>;
  const images = rawImages.filter((image: any) => !image.is_delete);
  const primaryImage = images.find((image: any) => image.is_primary) || images[0];

  return primaryImage?.image_url || primaryImage?.url || '/products/placeholder.jpg';
}

const campaignTypes = [
  { id: 'collection', name: 'Bộ sưu tập', icon: Package, description: 'Bộ sưu tập sản phẩm' },
  { id: 'flash_sale', name: 'Flash Sale', icon: Zap, description: 'Giảm giá trong thời gian ngắn' },
  { id: 'promotion', name: 'Khuyến mãi', icon: Ticket, description: 'Chương trình khuyến mãi' },
  { id: 'seasonal', name: 'Theo mùa', icon: Calendar, description: 'Chiến dịch theo mùa/dịp lễ' },
];

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: campaign, loading: campaignLoading } = useCampaign(id);
  const { data: allProducts, loading: productsLoading } = useProducts();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingCampaign, setIsDeletingCampaign] = useState(false);
  const [selectedType, setSelectedType] = useState('collection');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    code: '',
    description: '',
    type: 'collection',
    startDate: '',
    endDate: '',
    discount_type: 'percentage',
    discount_value: 0,
    image_url: '',
    display_order: 0,
    show_on_homepage: true,
    status: 'draft',
  });

  // Load campaign data
  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        title: campaign.title || '',
        code: campaign.code,
        description: campaign.description || '',
        type: campaign.type || 'collection',
        startDate: campaign.start_date ? new Date(campaign.start_date).toISOString().slice(0, 16) : '',
        endDate: campaign.end_date ? new Date(campaign.end_date).toISOString().slice(0, 16) : '',
        discount_type: campaign.discount_type || 'percentage',
        discount_value: campaign.discount_value || 0,
        image_url: campaign.image_url || '',
        display_order: campaign.display_order || 0,
        show_on_homepage: campaign.show_on_homepage,
        status: campaign.status || 'draft',
      });
      setSelectedType(campaign.type || 'collection');
      
      if ((campaign as any).products) {
         setSelectedProducts((campaign as any).products.map((p: any) => p.id));
      }
    }
  }, [campaign]);

  // Filter products by search
  const filteredProducts = useMemo(() => {
    return (allProducts || []).filter((p: Product) => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand?.name?.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [allProducts, productSearch]);

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setFormData({ ...formData, type: typeId });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      const result = await uploadApi.uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: result.url }));
    } catch (err: any) {
      setError('Không thể tải ảnh banner. Vui lòng thử lại.');
      toast.error(err.message || 'Lỗi tải ảnh');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const token = getToken();
      
      // Update basic info
      const response = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          title: formData.title || formData.name,
          code: formData.code,
          description: formData.description,
          type: formData.type,
          status: formData.status,
          discount_type: formData.discount_type,
          discount_value: Number(formData.discount_value),
          start_date: new Date(formData.startDate).toISOString(),
          end_date: new Date(formData.endDate).toISOString(),
          image_url: formData.image_url,
          display_order: Number(formData.display_order),
          show_on_homepage: formData.show_on_homepage,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Không thể cập nhật chiến dịch');
      }

      // Sync products logic
       if ((campaign as any)?.products || selectedProducts.length > 0) {
        // Since we don't have a sync endpoint, we will just try to add all selected.
        // It might fail if already exists depending on API, or we can clear and add if we had clear endpoint.
        // A safer way without sync endpoint is to just use 'POST /products' which usually handles "add if not exists" or similar, 
        // OR we should be explicit. 
        // Given earlier analysis: API has addProducts and removeProducts.
        // Let's TRY to compute diff if we have initial products.
        const currentIds = (campaign as any)?.products?.map((p: any) => p.id) || [];
        const toAdd = selectedProducts.filter(id => !currentIds.includes(id));
        const toRemove = currentIds.filter((id: string) => !selectedProducts.includes(id));

        if (toAdd.length > 0) {
            await fetch(`${API_BASE_URL}/campaigns/${id}/products`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ productIds: toAdd }),
            });
        }
        if (toRemove.length > 0) {
            await fetch(`${API_BASE_URL}/campaigns/${id}/products`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ productIds: toRemove }),
            });
        }
      }

      toast.success('Cập nhật chiến dịch thành công');
      router.push('/admin/campaigns');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
      try {
          setIsDeletingCampaign(true);
          const token = getToken();
          const response = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Không thể xóa chiến dịch');
          toast.success('Đã xóa chiến dịch');
          setIsDeleteDialogOpen(false);
          router.push('/admin/campaigns');
      } catch (err: any) {
          toast.error(err.message);
      } finally {
          setIsDeletingCampaign(false);
      }
  }

  if (campaignLoading) {
      return (
          <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
      )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link 
            href="/admin/campaigns" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
            <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
            <h1 className="text-2xl font-bold">Chỉnh sửa chiến dịch</h1>
            <p className="text-muted-foreground">{formData.name}</p>
            </div>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa chiến dịch
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa chiến dịch</AlertDialogTitle>
            <AlertDialogDescription>
              Chiến dịch hiện tại sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCampaign}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletingCampaign}
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
              onClick={handleDelete}
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

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Loại chiến dịch</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {campaignTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleTypeSelect(type.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all hover:border-blue-300 ${
                        selectedType === type.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-border'
                      }`}
                    >
                      <type.icon className={`h-6 w-6 mx-auto mb-2 ${
                        selectedType === type.id ? 'text-blue-600' : 'text-muted-foreground'
                      }`} />
                      <p className={`text-sm font-medium ${
                        selectedType === type.id ? 'text-blue-600' : ''
                      }`}>{type.name}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên chiến dịch *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="VD: Bộ sưu tập Lee Zii Jia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Mã chiến dịch *</Label>
                    <Input
                      id="code"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="VD: LEEZJ2024"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề hiển thị (trên trang chủ)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Tiêu đề hiển thị trên trang chủ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả chi tiết về chiến dịch..."
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Ngày kết thúc *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discount Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cài đặt giảm giá</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount_type">Loại giảm giá</Label>
                    <Select
                      value={formData.discount_type}
                      onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Giảm theo %</SelectItem>
                        <SelectItem value="fixed">Giảm tiền cố định</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount_value">
                      {formData.discount_type === 'percentage' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VNĐ)'}
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      min="0"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                      placeholder={formData.discount_type === 'percentage' ? "VD: 20" : "VD: 100000"}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Chọn sản phẩm cho chiến dịch</CardTitle>
                  <span className="text-sm text-blue-600 font-medium">
                    Đã chọn: {selectedProducts.length} sản phẩm
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm sản phẩm theo tên hoặc thương hiệu..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Selected Products Tags */}
                {selectedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
                    {selectedProducts.map(id => {
                      const product = (allProducts || []).find((p: Product) => p.id === id);
                      // If product is not in allProducts (maybe not loaded yet or pagination issue), try to find in initial campaign products if available
                      const productDisplay = product || ((campaign as any)?.products || []).find((p: any) => p.id === id);
                      
                      if (!productDisplay) return null;
                      return (
                        <div key={id} className="flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded-full text-sm">
                          <span className="max-w-40 truncate">{productDisplay.name}</span>
                          <button type="button" onClick={() => toggleProduct(id)} className="text-gray-400 hover:text-red-600">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Product List */}
                <div className="max-h-96 overflow-y-auto border rounded-lg divide-y">
                  {productsLoading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-muted-foreground mt-2">Đang tải sản phẩm...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Không tìm thấy sản phẩm
                    </div>
                  ) : (
                    filteredProducts.slice(0, 100).map((product: Product) => (
                      <div
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedProducts.includes(product.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedProducts.includes(product.id) 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'border-gray-300'
                        }`}>
                          {selectedProducts.includes(product.id) && <Check className="h-3 w-3" />}
                        </div>
                        <img
                          src={getProductThumbnail(product)}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.brand?.name || 'Không có thương hiệu'}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status & Display */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trạng thái & Hiển thị</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Nháp</SelectItem>
                      <SelectItem value="scheduled">Lên lịch</SelectItem>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="paused">Tạm dừng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show_on_homepage"
                    checked={formData.show_on_homepage}
                    onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                    className="h-4 w-4 rounded"
                  />
                  <Label htmlFor="show_on_homepage" className="font-normal">
                    Hiển thị trên trang chủ
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_order">Thứ tự hiển thị</Label>
                  <Input
                    id="display_order"
                    type="number"
                    min="0"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hình ảnh banner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  
                  {formData.image_url ? (
                    <div className="relative rounded-lg overflow-hidden border">
                      <img
                        src={formData.image_url}
                        alt="Banner Preview"
                        className="w-full h-48 object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                          <p className="text-sm text-muted-foreground">Đang tải lên...</p>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-blue-100/50 rounded-full">
                            <ImageIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-700">Tải ảnh banner</p>
                            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP (Max 5MB)</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                     <span className="text-xs text-muted-foreground">Hoặc nhập URL:</span>
                     <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://..."
                        className="h-8 text-xs"
                      />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/admin/campaigns')}
                >
                  Hủy bỏ
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
