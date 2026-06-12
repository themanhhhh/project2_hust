import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liên hệ SmashX',
  description: 'Liên hệ SmashX để được hỗ trợ tư vấn sản phẩm cầu lông, đơn hàng, bảo hành, đổi trả và hợp tác bán hàng.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Liên hệ SmashX',
    description: 'Gửi yêu cầu hỗ trợ hoặc liên hệ đội ngũ SmashX về sản phẩm, đơn hàng và dịch vụ.',
    url: '/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
