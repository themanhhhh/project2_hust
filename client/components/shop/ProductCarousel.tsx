'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { type DisplayProduct, formatPrice } from '@/lib/productMapper';

interface ProductCarouselProps {
  products: DisplayProduct[];
  title: string;
  subtitle?: string;
  viewAllHref?: string;
}

export function ProductCarousel({ products, title, subtitle, viewAllHref }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            {subtitle && (
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">
                {subtitle}
              </p>
            )}
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Navigation Arrows */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label="Cuộn sang trái"
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                  canScrollLeft
                    ? 'border-black text-black hover:bg-black hover:text-white'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                aria-label="Cuộn sang phải"
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                  canScrollRight
                    ? 'border-black text-black hover:bg-black hover:text-white'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium hover:opacity-60 transition-opacity"
              >
                View All
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>

        {/* Products Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <ProductCarouselCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile View All */}
        {viewAllHref && (
          <div className="text-center mt-8 sm:hidden">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium"
            >
              View All
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function ProductCarouselCard({ product }: { product: DisplayProduct }) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex-shrink-0 w-[280px]"
    >
      {/* Image */}
      <div className="aspect-[3/4] bg-gray-50 overflow-hidden mb-4 relative">
        {/* Badge */}
        {product.badge && (
          <div className={`absolute top-3 left-3 z-10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${
            product.badge === 'hot' ? 'bg-black text-white' :
            product.badge === 'new' ? 'bg-white text-black border border-black' :
            'bg-red-600 text-white'
          }`}>
            {product.badge === 'hot' ? 'Best Seller' :
             product.badge === 'new' ? 'New' :
             `-${discount}%`}
          </div>
        )}
        
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50 group-hover:scale-105 transition-transform duration-500">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-2xl font-light">
                {product.brand.charAt(0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide line-clamp-1 group-hover:underline">
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 uppercase tracking-wider">
          {product.brand}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
