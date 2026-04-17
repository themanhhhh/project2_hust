'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, Calendar, Tag, Package } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { mapProductsForDisplay } from '@/lib/productMapper';

interface CampaignProduct {
  id: string;
  name: string;
  slug?: string;
  price: number;
  images?: { url: string }[];
  brand?: { name: string };
  category?: { name: string };
}

interface Campaign {
  id: string;
  name: string;
  title?: string;
  description?: string;
  image_url?: string;
  type: 'collection' | 'flash_sale' | 'promotion' | 'seasonal';
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  products?: CampaignProduct[];
}

interface CampaignSectionProps {
  campaign: Campaign;
}

const typeIcons = {
  collection: Package,
  flash_sale: Zap,
  promotion: Tag,
  seasonal: Calendar,
};

const typeLabels = {
  collection: 'Bộ sưu tập',
  flash_sale: 'Flash Sale',
  promotion: 'Khuyến mãi',
  seasonal: 'Theo mùa',
};

const typeColors = {
  collection: 'bg-purple-600',
  flash_sale: 'bg-red-600',
  promotion: 'bg-green-600',
  seasonal: 'bg-blue-600',
};

export function CampaignSection({ campaign }: CampaignSectionProps) {
  const Icon = typeIcons[campaign.type] || Tag;
  const label = typeLabels[campaign.type] || 'Chiến dịch';
  const bgColor = typeColors[campaign.type] || 'bg-black';

  // Map products for display
  const displayProducts = campaign.products 
    ? mapProductsForDisplay(campaign.products as any) 
    : [];

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white rounded-full ${bgColor}`}>
                <Icon className="h-3.5 w-3.5" />
                {label}
              </span>
              {campaign.discount_value > 0 && (
                <span className="px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">
                  -{campaign.discount_type === 'percentage' ? `${campaign.discount_value}%` : `${campaign.discount_value.toLocaleString()}đ`}
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {campaign.title || campaign.name}
            </h2>
            {campaign.description && (
              <p className="mt-2 text-muted-foreground max-w-xl">
                {campaign.description}
              </p>
            )}
          </div>
          <Link 
            href={`/campaigns/${campaign.id}`}
            className="group inline-flex items-center gap-2 text-sm font-medium hover:underline underline-offset-4"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Banner Image (optional) */}
        {campaign.image_url && (
          <div className="mb-8 overflow-hidden rounded-xl relative h-48 md:h-64">
            <Image 
              src={campaign.image_url} 
              alt={campaign.title || campaign.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
