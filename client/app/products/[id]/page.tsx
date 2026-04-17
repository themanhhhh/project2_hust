'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Heart, Truck, Shield, RotateCcw, Loader2, Zap } from 'lucide-react';
import { Header } from '@/components/shop/Header';
import { Footer } from '@/components/shop/Footer';
import { ProductCard } from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProduct, useProducts } from '@/hooks/useApi';
import { mapProductForDisplay, mapProductsForDisplay, formatPrice } from '@/lib/productMapper';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: product, loading, error } = useProduct(id);
  const { data: allProducts } = useProducts();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Không tìm thấy sản phẩm</h1>
            <p className="text-muted-foreground mb-4">Sản phẩm bạn tìm không tồn tại hoặc đã bị xóa.</p>
            <Button asChild>
              <Link href="/products">Xem tất cả sản phẩm</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const displayProduct = mapProductForDisplay(product);
  const images = product.product_images || product.images || [];
  const discount = displayProduct.originalPrice
    ? Math.round((1 - displayProduct.price / displayProduct.originalPrice) * 100)
    : 0;

  // Related products: same category, exclude current
  const relatedProducts = allProducts
    ? mapProductsForDisplay(
        allProducts
          .filter(p => p.id !== product.id && p.category?.id === product.category?.id)
          .slice(0, 4)
      )
    : [];

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setIsAdding(true);
    await addToCart({
      productId: product.id,
      name: product.name,
      brand: displayProduct.brand,
      price: displayProduct.price,
      image: displayProduct.image || '/products/placeholder.jpg',
      quantity,
    });
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setIsBuying(true);
    await addToCart({
      productId: product.id,
      name: product.name,
      brand: displayProduct.brand,
      price: displayProduct.price,
      image: displayProduct.image || '/products/placeholder.jpg',
      quantity,
    });
    setIsBuying(false);
    router.push('/checkout');
  };

  // Get current main image URL
  const mainImageUrl = images.length > 0
    ? (images[selectedImageIndex]?.image_url || images[selectedImageIndex]?.url)
    : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="border-b border-gray-100">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto whitespace-nowrap">
              <Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-foreground transition-colors">Sản phẩm</Link>
              <span>/</span>
              <span className="text-foreground font-medium truncate max-w-[150px] sm:max-w-none">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Detail */}
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16">
            {/* Product Images */}
            <div className="space-y-3 sm:space-y-4">
              <div className="aspect-square bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden relative">
                {displayProduct.badge && (
                  <Badge 
                    variant={displayProduct.badge === 'sale' ? 'destructive' : 'default'}
                    className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1"
                  >
                    {displayProduct.badge === 'hot' ? 'Best Seller' :
                     displayProduct.badge === 'new' ? 'New' :
                     `-${discount}%`}
                  </Badge>
                )}
                {mainImageUrl ? (
                  <img
                    src={mainImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-32 h-32 bg-muted-foreground/10 rounded-full flex items-center justify-center">
                      <span className="text-muted-foreground text-5xl font-light">
                        {displayProduct.brand.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {/* Thumbnail gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {images.map((img, i) => {
                    const thumbUrl = img.image_url || img.url;
                    return (
                      <button
                        key={img.id || i}
                        onClick={() => setSelectedImageIndex(i)}
                        className={`aspect-square bg-gray-50 rounded-md overflow-hidden cursor-pointer transition-all ${
                          selectedImageIndex === i
                            ? 'ring-2 ring-black ring-offset-2'
                            : 'hover:opacity-80 active:opacity-60'
                        }`}
                      >
                        <img
                          src={thumbUrl}
                          alt={`${product.name} - ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-5 sm:space-y-6">
              <div>
                <p className="text-xs sm:text-sm uppercase tracking-widest text-muted-foreground mb-2">
                  {displayProduct.brand}
                </p>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-wide mb-3 sm:mb-4 line-clamp-2">
                  {product.name}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <span className="text-xl sm:text-2xl font-bold">
                    {formatPrice(displayProduct.price)}
                  </span>
                  {displayProduct.originalPrice && (
                    <span className="text-base sm:text-lg text-muted-foreground line-through">
                      {formatPrice(displayProduct.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description || `Sản phẩm chính hãng ${displayProduct.brand} với chất lượng cao cấp. Thiết kế hiện đại, phù hợp cho mọi cấp độ chơi từ nghiệp dư đến chuyên nghiệp.`}
              </p>

              {/* Stock status */}
              <div className="flex items-center gap-2 py-2">
                {displayProduct.inStock ? (
                  <span className="text-sm text-green-600 font-medium">● Còn hàng</span>
                ) : (
                  <span className="text-sm text-red-600 font-medium">● Hết hàng</span>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-xs uppercase tracking-widest font-medium whitespace-nowrap">Số lượng</span>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button 
                    className="h-12 w-12 sm:h-10 sm:w-10 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Giảm số lượng"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 sm:w-12 text-center text-base font-semibold select-none">{quantity}</span>
                  <button 
                    className="h-12 w-12 sm:h-10 sm:w-10 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Tăng số lượng"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  className="flex-1 h-12 text-sm sm:text-base bg-black hover:bg-gray-800 text-white" 
                  onClick={handleAddToCart}
                  disabled={isAdding || !displayProduct.inStock}
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang thêm...
                    </>
                  ) : (
                    'Thêm vào giỏ'
                  )}
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 h-12 text-sm sm:text-base border-black text-black bg-white hover:bg-gray-100"
                  onClick={handleBuyNow}
                  disabled={isBuying || !displayProduct.inStock}
                >
                  {isBuying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      
                      Mua ngay
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-12 w-12 shrink-0"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              <Separator />

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-4">
                <div className="flex sm:flex-col items-center gap-2 sm:gap-3 text-center p-3 sm:p-0">
                  <Truck className="h-6 w-6 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Miễn phí giao hàng</p>
                </div>
                <div className="flex sm:flex-col items-center gap-2 sm:gap-3 text-center p-3 sm:p-0">
                  <Shield className="h-6 w-6 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Bảo hành 12 tháng</p>
                </div>
                <div className="flex sm:flex-col items-center gap-2 sm:gap-3 text-center p-3 sm:p-0">
                  <RotateCcw className="h-6 w-6 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-muted-foreground">Đổi trả 30 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="border-t">
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-lg font-bold uppercase tracking-wide mb-6">Mô tả sản phẩm</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>
                {product.description || `${product.name} là sản phẩm cao cấp đến từ thương hiệu ${displayProduct.brand}. Được thiết kế với công nghệ tiên tiến, sản phẩm mang đến trải nghiệm tuyệt vời cho người chơi cầu lông.`}
              </p>
              <p className="mt-4">
                Đặc điểm nổi bật:
              </p>
              <ul className="mt-2 space-y-1">
                <li>Chất liệu cao cấp, độ bền cao</li>
                <li>Thiết kế công thái học, cầm nắm thoải mái</li>
                <li>Phù hợp cho mọi cấp độ chơi</li>
                <li>Bảo hành chính hãng 12 tháng</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t">
            <div className="container mx-auto px-4 py-10 sm:py-12">
              <h2 className="text-lg font-bold uppercase tracking-wide mb-6 sm:mb-8 text-center">
                Sản phẩm liên quan
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
