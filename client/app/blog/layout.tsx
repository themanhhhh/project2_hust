import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog cầu lông và tư vấn thiết bị',
  description: 'Bài viết tư vấn chọn vợt, giày, phụ kiện cầu lông, xu hướng sản phẩm và kiến thức chơi cầu lông từ SmashX.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog cầu lông và tư vấn thiết bị | SmashX',
    description: 'Nội dung tư vấn chuyên sâu giúp người chơi chọn sản phẩm cầu lông phù hợp với trình độ, ngân sách và phong cách chơi.',
    url: '/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
