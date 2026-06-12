import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yonex Collection - Công nghệ vợt cầu lông',
  description: 'Khám phá landing page Yonex tại SmashX với các dòng vợt nổi bật, công nghệ cầu lông và gợi ý sản phẩm cho từng phong cách chơi.',
  alternates: { canonical: '/yonex' },
  openGraph: {
    title: 'Yonex Collection | SmashX',
    description: 'Trải nghiệm bộ sưu tập Yonex, công nghệ vợt cầu lông và sản phẩm nổi bật dành cho người chơi hiện đại.',
    url: '/yonex',
  },
};

export default function YonexLayout({ children }: { children: React.ReactNode }) {
  return children;
}
