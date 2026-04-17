'use client';

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled to prevent hydration issues with Framer Motion
const YonexScroll = dynamic(
  () => import('@/components/scrollytelling/YonexScroll'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-[#1a1a1a] flex flex-col items-center justify-center z-50">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
        </div>
        <div className="text-white/60 text-sm font-light tracking-widest uppercase">Loading Experience</div>
      </div>
    )
  }
);

export default function YonexLandingPage() {
  return (
    <main className="bg-[#1a1a1a] text-white">
      <YonexScroll />
      
      {/* Additional sections after scrollytelling */}
      <section className="relative bg-[#1a1a1a] py-24">
        <div className="container mx-auto px-8 md:px-16">
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white/90 mb-2">40+</div>
              <div className="text-sm text-white/60 uppercase tracking-widest">Years of Innovation</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white/90 mb-2">32%</div>
              <div className="text-sm text-white/60 uppercase tracking-widest">Larger Sweet Spot</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white/90 mb-2">#1</div>
              <div className="text-sm text-white/60 uppercase tracking-widest">Pro Choice</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white/90 mb-2">100+</div>
              <div className="text-sm text-white/60 uppercase tracking-widest">Champion Titles</div>
            </div>
          </div>

          {/* Product Grid Teaser */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white/90 mb-4">
              Featured Collection
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              From the legendary Astrox series to the precision-focused Nanoflare, 
              find the perfect racket for your playing style.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Product Card 1 */}
            <article className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 
                              hover:border-white/20 transition-all duration-500">
              <div className="aspect-square bg-gradient-to-br from-white/10 to-transparent p-8 
                            flex items-center justify-center">
                <div className="text-6xl font-bold text-white/20 group-hover:text-white/30 transition-colors">
                  01
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white/90 mb-2">Astrox 100 ZZ</h3>
                <p className="text-sm text-white/60 mb-4">Maximum power for aggressive attackers</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white/90">$299</span>
                  <a href="/products" className="text-sm text-white/60 hover:text-white transition-colors">
                    View Details →
                  </a>
                </div>
              </div>
            </article>

            {/* Product Card 2 */}
            <article className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 
                              hover:border-white/20 transition-all duration-500">
              <div className="aspect-square bg-gradient-to-br from-white/10 to-transparent p-8 
                            flex items-center justify-center">
                <div className="text-6xl font-bold text-white/20 group-hover:text-white/30 transition-colors">
                  02
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white/90 mb-2">Nanoflare 800 Pro</h3>
                <p className="text-sm text-white/60 mb-4">Lightning speed for quick exchanges</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white/90">$279</span>
                  <a href="/products" className="text-sm text-white/60 hover:text-white transition-colors">
                    View Details →
                  </a>
                </div>
              </div>
            </article>

            {/* Product Card 3 */}
            <article className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 
                              hover:border-white/20 transition-all duration-500">
              <div className="aspect-square bg-gradient-to-br from-white/10 to-transparent p-8 
                            flex items-center justify-center">
                <div className="text-6xl font-bold text-white/20 group-hover:text-white/30 transition-colors">
                  03
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white/90 mb-2">Arcsaber 11 Pro</h3>
                <p className="text-sm text-white/60 mb-4">Perfect balance of power and control</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white/90">$259</span>
                  <a href="/products" className="text-sm text-white/60 hover:text-white transition-colors">
                    View Details →
                  </a>
                </div>
              </div>
            </article>
          </div>

          <div className="text-center">
            <a 
              href="/products" 
              className="inline-flex items-center px-8 py-4 border border-white/20 text-white/90 
                       hover:bg-white hover:text-black transition-all duration-300 rounded-full"
            >
              View All Products
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-white/10 py-16">
        <div className="container mx-auto px-8 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-2xl font-bold tracking-tighter text-white/90">YONEX</div>
            <div className="flex gap-8 text-sm text-white/60">
              <a href="/products" className="hover:text-white transition-colors">Products</a>
              <a href="/about" className="hover:text-white transition-colors">About</a>
              <a href="/contact" className="hover:text-white transition-colors">Contact</a>
              <a href="/faq" className="hover:text-white transition-colors">FAQ</a>
            </div>
            <div className="text-sm text-white/40">© 2026 Yonex. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
