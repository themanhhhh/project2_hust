'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

const categories = [
  {
    id: 'rackets',
    title: 'VỢT CẦU LÔNG',
    subtitle: 'Rackets',
    description: 'Công nghệ hàng đầu',
    href: '/products?category=racket',
    image: '/img/racketcate.jpg',
  },
  {
    id: 'shoes',
    title: 'GIÀY CẦU LÔNG',
    subtitle: 'Footwear',
    description: 'Power Cushion',
    href: '/products?category=shoes',
    image: '/img/footwearercate.jpg',
  },
  {
    id: 'accessories',
    title: 'PHỤ KIỆN',
    subtitle: 'Accessories',
    description: 'Cước, quấn cán, balo',
    href: '/products?category=accessories',
    image: '/img/accessoriescate.png',
  },
];

export function CategoryGrid() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">
            Categories
          </p>
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
            Shop by Category
          </h2>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative aspect-[4/5] overflow-hidden"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image 
                  src={category.image} 
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/70 transition-all duration-300" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between p-8">
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-[0.2em] mb-2">
                    {category.subtitle}
                  </p>
                  <h3 className="text-white text-2xl lg:text-3xl font-bold uppercase tracking-wide">
                    {category.title}
                  </h3>
                </div>

                <div className="flex items-end justify-between">
                  <p className="text-white/60 text-sm">
                    {category.description}
                  </p>
                  <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300">
                    <ArrowUpRight className="h-5 w-5 text-white group-hover:text-black transition-colors" aria-hidden="true" />
                  </div>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
