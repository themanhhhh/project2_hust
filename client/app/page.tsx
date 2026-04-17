'use client';

import { Header } from '@/components/shop/Header';
import { Footer } from '@/components/shop/Footer';
import { HeroBanner } from '@/components/shop/HeroBanner';
import { CategoryGrid } from '@/components/shop/CategoryGrid';
import { AthleteSpotlight } from '@/components/shop/AthleteSpotlight';
import { TechShowcase } from '@/components/shop/TechShowcase';
import { ProductCarousel } from '@/components/shop/ProductCarousel';
import { CampaignSection } from '@/components/shop/CampaignSection';
import { useProducts, useHomepageCampaigns } from '@/hooks/useApi';
import { mapProductsForDisplay } from '@/lib/productMapper';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { data: apiProducts, loading, error } = useProducts(100);
  const { data: campaigns } = useHomepageCampaigns();
  
  // Map API products to display format
  const products = apiProducts ? mapProductsForDisplay(apiProducts) : [];
  
  const newProducts = products.filter(p => p.badge === 'new').slice(0, 8);
  const bestProducts = products.filter(p => p.badge === 'hot').slice(0, 8);
  const saleProducts = products.filter(p => p.badge === 'sale' || p.originalPrice).slice(0, 8);

  // Active campaigns for homepage
  const activeCampaigns = campaigns || [];

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
            <p className="text-gray-500 text-sm">Đang tải sản phẩm...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero Banner - Full screen video/image style */}
        <HeroBanner />

        {/* Shop by Category - 3 column grid */}
        <CategoryGrid />

        {/* New Arrivals Carousel */}
        {newProducts.length > 0 && (
          <ProductCarousel 
            products={newProducts}
            title="New Arrivals"
            subtitle="Mới nhất"
            viewAllHref="/products"
          />
        )}

        {/* Campaign Collections from API */}
        {activeCampaigns.map((campaign: any) => (
          <CampaignSection key={campaign.id} campaign={campaign} />
        ))}

        {/* Pro Player / Athlete Spotlight */}
        <AthleteSpotlight />

        {/* Best Sellers Carousel */}
        {bestProducts.length > 0 && (
          <ProductCarousel 
            products={bestProducts}
            title="Best Sellers"
            subtitle="Bán chạy nhất"
            viewAllHref="/products?sort=bestselling"
          />
        )}

        {/* Sale Section */}
        {saleProducts.length > 0 && (
          <section className="py-20 bg-white border-t border-gray-100">
            <div className="container mx-auto px-4">
              <div className="text-center mb-4">
                <span className="inline-block px-4 py-1 bg-black text-white text-xs uppercase tracking-widest font-medium mb-4">
                  Limited Time
                </span>
              </div>
              <ProductCarousel 
                products={saleProducts}
                title="Sale Off"
                subtitle="Đang giảm giá"
                viewAllHref="/products?sale=true"
              />
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}