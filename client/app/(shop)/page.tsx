'use client';

import Link from 'next/link';
import { ArrowRight, Truck, Shield, Headphones, CreditCard, Flame, CircleDot, Footprints, Feather, Backpack } from 'lucide-react';
import { HeroBanner } from '@/components/shop/HeroBanner';
import { ProductCard } from '@/components/shop/ProductCard';
import { ScrollReveal, StaggeredGrid } from '@/components/shop/ScrollReveal';
import { useProducts, useCategories } from '@/hooks/useApi';
import { mapProductsForDisplay } from '@/lib/productMapper';
import { CampaignSection } from '@/components/shop/CampaignSection';

// Category icon renderer
function CategoryIcon({ iconName, className }: { iconName: string; className?: string }) {
  switch (iconName) {
    case 'circle-dot':
      return <CircleDot className={className} />;
    case 'footprints':
      return <Footprints className={className} />;
    case 'feather':
      return <Feather className={className} />;
    case 'backpack':
      return <Backpack className={className} />;
    default:
      return <CircleDot className={className} />;
  }
}

// Map category slug to icon name
function getCategoryIcon(slug: string): string {
  const iconMap: Record<string, string> = {
    'racket': 'circle-dot',
    'rackets': 'circle-dot',
    'vot-cau-long': 'circle-dot',
    'shoes': 'footprints',
    'giay-cau-long': 'footprints',
    'footwear': 'footprints',
    'shuttlecock': 'feather',
    'cau-long': 'feather',
    'accessories': 'backpack',
    'phu-kien': 'backpack',
    'bags': 'backpack',
    'tui-dung-vot': 'backpack',
    'tui-balo': 'backpack',
    'clothing': 'backpack',
    'quan-ao-cau-long': 'backpack',
  };
  return iconMap[slug] || 'circle-dot';
}

export default function HomePage() {
  const { data: apiProducts } = useProducts();
  const { data: apiCategories } = useCategories();

  const displayProducts = apiProducts ? mapProductsForDisplay(apiProducts) : [];
  const featuredProducts = displayProducts.slice(0, 4);
  const saleProducts = displayProducts.filter(p => p.badge === 'hot' || p.badge === 'sale').slice(0, 4);

  // Use real categories or fallback
  const categories = apiCategories || [];

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Benefits */}
      <section className="py-8 bg-gradient-to-r from-blue-50 to-orange-50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, color: 'blue', title: 'Miễn phí vận chuyển', subtitle: 'Đơn từ 500K' },
              { icon: Shield, color: 'green', title: 'Hàng chính hãng', subtitle: '100% authentic' },
              { icon: Headphones, color: 'orange', title: 'Hỗ trợ 24/7', subtitle: 'Tư vấn nhiệt tình' },
              { icon: CreditCard, color: 'purple', title: 'Thanh toán an toàn', subtitle: 'Đa dạng hình thức' },
            ].map((benefit, index) => (
              <ScrollReveal key={benefit.title} delay={index * 0.1} direction="up">
                <div className="flex items-center gap-3 p-4">
                  <div className={`p-3 bg-${benefit.color}-100 rounded-full`}>
                    <benefit.icon className={`h-6 w-6 text-${benefit.color}-600`} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{benefit.title}</div>
                    <div className="text-xs text-muted-foreground">{benefit.subtitle}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <ScrollReveal delay={0.1}>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3">Danh mục sản phẩm</h2>
                <p className="text-muted-foreground">Khám phá các sản phẩm chất lượng cao</p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category: any, index: number) => (
                <ScrollReveal key={category.id} delay={0.1 + index * 0.05} direction="up">
                  <Link
                    href={`/products?category=${category.slug || category.id}`}
                    className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 rounded-2xl text-center transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="mb-4 group-hover:scale-110 transition-transform flex justify-center">
                      <CategoryIcon iconName={getCategoryIcon(category.slug || '')} className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <ScrollReveal delay={0.2}>
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Sản phẩm nổi bật</h2>
                  <p className="text-muted-foreground">Được yêu thích nhất</p>
                </div>
                <Link
                  href="/products"
                  className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Xem tất cả
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
            <StaggeredGrid
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              delay={0.3}
              stagger={0.1}
            >
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </StaggeredGrid>
            <ScrollReveal delay={0.5}>
              <Link
                href="/products"
                className="mt-8 sm:hidden flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Xem tất cả sản phẩm
                <ArrowRight className="h-4 w-4" />
              </Link>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Hot Deals Banner */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4">
          <ScrollReveal delay={0.3}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-4">
                  <Flame className="h-4 w-4" /> Flash Sale - Kết thúc sau 12:00:00
                </div>
                <h2 className="text-4xl font-bold mb-4">Giảm giá đến 50%</h2>
                <p className="text-orange-100 mb-6 max-w-md">
                  Săn ngay những deal hot nhất trong tháng. Số lượng có hạn!
                </p>
                <Link
                  href="/products?sale=true"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
                >
                  Mua ngay
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              <CircleDot className="h-32 w-32 text-white/80" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Sale Products */}
      {saleProducts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <ScrollReveal delay={0.4}>
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Đang giảm giá</h2>
                  <p className="text-muted-foreground">Tiết kiệm đến 30%</p>
                </div>
                <Link
                  href="/products?sale=true"
                  className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Xem tất cả
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
            <StaggeredGrid
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              delay={0.5}
              stagger={0.1}
            >
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </StaggeredGrid>
          </div>
        </section>
      )}

      {/* Brands */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <ScrollReveal delay={0.6}>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Thương hiệu đối tác</h2>
              <p className="text-muted-foreground">Chỉ bán hàng chính hãng từ các thương hiệu hàng đầu</p>
            </div>
          </ScrollReveal>
          <StaggeredGrid
            className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
            delay={0.7}
            stagger={0.1}
          >
            {['YONEX', 'VICTOR', 'LI-NING', 'MIZUNO', 'KAWASAKI'].map((brand) => (
              <div
                key={brand}
                className="px-8 py-4 bg-white rounded-xl shadow-sm text-2xl font-bold text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {brand}
              </div>
            ))}
          </StaggeredGrid>
        </div>
      </section>
    </div>
  );
}
