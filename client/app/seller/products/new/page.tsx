'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBrands, useCategories } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { uploadFileToPinata } from '@/lib/pinata';

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    original_price: '',
    stock: '',
    sku: '',
    brand_id: '',
    category_id: '',
    badge: 'new',
  });

  const syncBadgeWithPricing = (nextPrice: string, nextOriginalPrice: string, currentBadge: string) => {
    const price = Number(nextPrice || 0);
    const originalPrice = Number(nextOriginalPrice || 0);
    const hasDiscount = originalPrice > 0 && price > 0 && originalPrice > price;

    if (hasDiscount) {
      return 'sale';
    }

    return currentBadge === 'sale' ? 'none' : currentBadge;
  };

  const discountPercentage = (() => {
    const price = Number(formData.price || 0);
    const originalPrice = Number(formData.original_price || 0);

    if (price <= 0 || originalPrice <= 0 || originalPrice <= price) {
      return null;
    }

    return Math.round(((originalPrice - price) / originalPrice) * 100);
  })();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError('');

    try {
      const uploadPromises = Array.from(files).slice(0, 5 - images.length).map(file => 
        uploadFileToPinata(file)
      );
      
      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls].slice(0, 5));
    } catch (err: any) {
      setError('Không thể tải ảnh lên. Vui lòng thử lại.');
      console.error('Upload error:', err);
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
      await api.products.create({
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || undefined,
        price: Number(formData.price),
        original_price: formData.original_price ? Number(formData.original_price) : undefined,
        stock_quantity: formData.stock ? Number(formData.stock) : 0,
        sku: formData.sku || undefined,
        brand_id: formData.brand_id || undefined,
        category_id: formData.category_id || undefined,
        badge: formData.badge,
        images: images.map((url, index) => ({ url, display_order: index })) as any,
      });
      
      router.push('/seller/products');
    } catch (err: any) {
      setError(err.message || 'Không thể tạo sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/seller/products"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Thêm sản phẩm mới</h1>
            <p className="text-muted-foreground">Điền thông tin sản phẩm</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/seller/products">
            <Button variant="outline">Hủy</Button>
          </Link>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lưu sản phẩm
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-gray-100 p-4 text-gray-700 dark:bg-slate-900 dark:text-slate-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên sản phẩm *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="VD: Yonex Astrox 99 Pro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="yonex-astrox-99-pro"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thương hiệu</Label>
                  <Select
                    value={formData.brand_id}
                    onValueChange={(value) => setFormData({ ...formData, brand_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thương hiệu" />
                    </SelectTrigger>
                    <SelectContent>
                      {(brands || []).map((brand: any) => (
                        <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Danh mục</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories || []).map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">Mã SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="VD: YNX-AX99PRO"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả sản phẩm</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Nhập mô tả chi tiết về sản phẩm..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hình ảnh sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 rounded-full bg-black p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white dark:text-black"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 rounded bg-black px-2 py-0.5 text-xs text-white dark:bg-white dark:text-black">
                        Ảnh chính
                      </span>
                    )}
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 transition-colors hover:border-black hover:bg-gray-50 disabled:opacity-50 dark:hover:border-white dark:hover:bg-slate-900"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
                        <span className="text-xs text-gray-500">Đang tải...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="text-xs text-gray-500">Tải ảnh lên</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Tối đa 5 ảnh. Ảnh đầu tiên sẽ là ảnh đại diện. Hỗ trợ JPG, PNG, WebP.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Giá bán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Giá bán *</Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => {
                      const nextPrice = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        price: nextPrice,
                        badge: syncBadgeWithPricing(nextPrice, prev.original_price, prev.badge),
                      }));
                    }}
                    placeholder="0"
                    className="pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    VNĐ
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_price">Giá gốc (nếu giảm giá)</Label>
                <div className="relative">
                  <Input
                    id="original_price"
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => {
                      const nextOriginalPrice = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        original_price: nextOriginalPrice,
                        badge: syncBadgeWithPricing(prev.price, nextOriginalPrice, prev.badge),
                      }));
                    }}
                    placeholder="0"
                    className="pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    VNĐ
                  </span>
                </div>
                {discountPercentage !== null && (
                  <p className="text-xs text-muted-foreground">
                    Đang giảm <span className="font-medium text-foreground">{discountPercentage}%</span> so với giá gốc.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kho hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="stock">Số lượng tồn kho</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Badge */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nhãn sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Badge</Label>
                <Select
                  value={formData.badge}
                  onValueChange={(value) => setFormData({ ...formData, badge: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhãn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New (Mới)</SelectItem>
                    <SelectItem value="bestseller">Best Seller (Bán chạy)</SelectItem>
                    <SelectItem value="none">Không có</SelectItem>
                  </SelectContent>
                </Select>
                {formData.badge === 'sale' && (
                  <p className="text-xs text-muted-foreground">Badge đang được tự động gán vì giá gốc lớn hơn giá bán.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
