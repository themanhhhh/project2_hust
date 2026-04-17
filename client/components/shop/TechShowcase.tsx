'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const technologies = [
  {
    id: 'power',
    name: 'POWER SERIES',
    tagline: 'Maximum Power',
    description: 'Công nghệ tối ưu hóa lực đánh, mang đến cú smash mạnh mẽ và chính xác.',
    href: '/products?tech=power',
  },
  {
    id: 'control',
    name: 'CONTROL SERIES',
    tagline: 'Precision Control',
    description: 'Thiết kế cân bằng, kiểm soát tuyệt vời cho những pha cầu kỹ thuật.',
    href: '/products?tech=control',
  },
];

export function TechShowcase() {
  return (
    <section className="py-0">
      {technologies.map((tech, index) => (
        <div
          key={tech.id}
          className={`relative min-h-[400px] flex items-center overflow-hidden ${
            index % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800'
          }`}
        >
          {/* Large Background Text */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
            <span className="text-[120px] md:text-[200px] lg:text-[280px] font-black uppercase tracking-tighter text-white/[0.03] whitespace-nowrap select-none">
              {tech.name.split(' ')[0]}
            </span>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 relative z-10">
            <div className={`grid lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'lg:direction-rtl' : ''}`}>
              <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <p className="text-xs uppercase tracking-[0.4em] text-white/40 mb-4">
                  {tech.tagline}
                </p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white mb-6">
                  {tech.name}
                </h2>
                <p className="text-white/60 text-sm md:text-base leading-relaxed mb-8 max-w-md">
                  {tech.description}
                </p>
                <Link
                  href={tech.href}
                  className="inline-flex items-center gap-3 px-8 py-4 border border-white/30 text-white text-xs uppercase tracking-widest font-medium hover:bg-white hover:text-black transition-all duration-300"
                >
                  Explore
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              {/* Product Preview Placeholder */}
              <div className={`aspect-square max-w-md mx-auto ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="w-full h-full rounded-full border border-white/10 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 rounded-full border border-white/5 flex items-center justify-center">
                   
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
