import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sản phẩm cầu lông chính hãng',
  description: 'Khám phá vợt cầu lông, giày cầu lông, phụ kiện và sản phẩm chính hãng theo danh mục, thương hiệu, giá và bộ sưu tập tại SmashX.',
  alternates: { canonical: '/products' },
  openGraph: {
    title: 'Sản phẩm cầu lông chính hãng | SmashX',
    description: 'Tìm kiếm và lọc sản phẩm cầu lông theo danh mục, thương hiệu, bộ sưu tập và mức giá.',
    url: '/products',
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
