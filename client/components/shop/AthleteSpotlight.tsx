'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useCollections } from '@/hooks/useApi';
import type { Collection } from '@/lib/types';

export function AthleteSpotlight() {
  const { data: collections, loading } = useCollections();
  
  // Lọc chỉ lấy những collection đang active
  const activeCollections = collections?.filter((c: Collection) => c.is_active) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 bg-white">
         <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (activeCollections.length === 0) {
    return null;
  }

  // Placeholder images for aesthetic completeness if no products have images
  const FALLBACK_1 = 'https://images.unsplash.com/photo-1544253164-8392131804f3?q=80&w=600&auto=format&fit=crop';
  const FALLBACK_2 = 'https://images.unsplash.com/photo-1554068865-c3ce14e7a8de?q=80&w=600&auto=format&fit=crop';

  return (
    <section className="bg-white flex flex-col space-y-24 md:space-y-32 py-16 md:py-24">
      {activeCollections.map((collection: Collection, index: number) => {
        // Hàm trợ giúp để đọc hình ảnh từ API do relation trả về snake_case
        const getImages = (p: any) => p?.images || p?.product_images || [];
        const getUrl = (img: any) => img?.url || img?.image_url;

        // Lấy 2 sản phẩm đầu tiên có hình ảnh để làm hai ảnh nhỏ bên phải
        const showcaseProducts = (collection.products || [])
          .filter(p => getImages(p).length > 0)
          .slice(0, 2);

        // Đảm bảo đủ 2 hình nhỏ để tạo cấu trúc Diptych
        const img1 = getUrl(getImages(showcaseProducts[0])[0]) || FALLBACK_1;
        const img2 = getUrl(getImages(showcaseProducts[1])[0]) || getUrl(getImages(showcaseProducts[0])[1]) || FALLBACK_2;

        const isReversed = index % 2 !== 0;

        return (
          <div key={collection.id} className="w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 flex flex-col md:flex-row gap-6 md:gap-12">
            
            {/* Left Column - Main Hero Image */}
            <div className={`w-full md:w-1/2 flex flex-col order-first ${isReversed ? 'md:order-last' : ''}`}>
              <Link href={`/products?collection=${collection.slug}`} className="w-full group block overflow-hidden">
                <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
                  <picture>
                    <img 
                      src={collection.thumbnail || FALLBACK_1} 
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[800ms] ease-out"
                    />
                  </picture>
                </div>
              </Link>
            </div>

            {/* Right Column - Secondary Images & Content */}
            <div className={`w-full md:w-1/2 flex flex-col pt-4 md:pt-10 ${isReversed ? 'md:order-first' : ''}`}>
              
               {/* Top: 2 Small Images */}
              <div className="flex gap-4 md:gap-[20px] mb-10 md:mb-16">
                <Link href={`/products?collection=${collection.slug}`} className="w-1/2 group block overflow-hidden">
                  <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
                    <picture>
                      <img 
                        src={img1} 
                        alt="Collection Details 1"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[800ms] ease-out"
                      />
                    </picture>
                  </div>
                </Link>
                <Link href={`/products?collection=${collection.slug}`} className="w-1/2 group block overflow-hidden">
                  <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
                    <picture>
                      <img 
                        src={img2} 
                        alt="Collection Details 2"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[800ms] ease-out"
                      />
                    </picture>
                  </div>
                </Link>
              </div>

              {/* Bottom: Content Typography */}
              <div className="flex flex-col flex-1 justify-end max-w-[85%]">
                <h2 className="text-3xl md:text-[34px] font-bold uppercase tracking-tight text-gray-900 mb-4 leading-none">
                  {collection.name}
                </h2>
                
                <div className="text-[13px] md:text-[14px] uppercase text-gray-800 space-y-4 mb-8 leading-relaxed font-medium">
                  {collection.description ? (
                    collection.description.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))
                  ) : (
                    <>
                      <p>KHÁM PHÁ BỘ SƯU TẬP ĐỘC QUYỀN MANG PHONG CÁCH QUÁN QUÂN.</p>
                      <p>SỰ LỰA CHỌN CỦA NHỮNG VẬN ĐỘNG VIÊN HÀNG ĐẦU, THIẾT KẾ ĐỂ VƯỢT QUA MỌI GIỚI HẠN VÀ ĐẠT ĐẾN ĐỈNH CAO.</p>
                    </>
                  )}
                </div>

                <Link
                  href={`/products?collection=${collection.slug}`}
                  className="font-bold text-[13px] md:text-[14px] uppercase tracking-widest text-black underline underline-offset-[6px] decoration-2 hover:text-gray-500 transition-colors w-fit"
                >
                  SHOP
                </Link>
              </div>
            </div>

          </div>
        );
      })}
    </section>
  );
}
