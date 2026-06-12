import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Câu hỏi thường gặp về mua sắm cầu lông',
  description: 'Giải đáp câu hỏi thường gặp về đặt hàng, giao hàng, bảo hành, đổi trả, thanh toán và chọn sản phẩm cầu lông tại SmashX.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Câu hỏi thường gặp | SmashX',
    description: 'Thông tin hỗ trợ khách hàng về đặt hàng, thanh toán, giao hàng, đổi trả và tư vấn chọn vợt cầu lông.',
    url: '/faq',
  },
};

const faqItems = [
  {
    question: 'Làm thế nào để đặt hàng?',
    answer: 'Bạn có thể đặt hàng trực tiếp trên website bằng cách thêm sản phẩm vào giỏ hàng và tiến hành thanh toán. Hoặc liên hệ hotline 1900 1234 để được hỗ trợ đặt hàng.',
  },
  {
    question: 'Thời gian giao hàng là bao lâu?',
    answer: 'Đơn hàng nội thành TP.HCM và Hà Nội sẽ được giao trong 1-2 ngày. Các tỉnh thành khác từ 3-5 ngày làm việc.',
  },
  {
    question: 'Sản phẩm có bảo hành không?',
    answer: 'Tất cả sản phẩm chính hãng tại SmashX đều được bảo hành theo chính sách của nhà sản xuất, thường từ 6-12 tháng tùy sản phẩm.',
  },
  {
    question: 'Tôi có thể thanh toán bằng hình thức nào?',
    answer: 'Chúng tôi chấp nhận thanh toán COD, chuyển khoản ngân hàng và VNPay.',
  },
  {
    question: 'Làm sao để chọn đúng loại vợt phù hợp?',
    answer: 'Việc chọn vợt phụ thuộc vào trình độ, lối chơi và sở thích cá nhân. Bạn có thể liên hệ đội ngũ tư vấn của SmashX qua hotline 1900 1234 để được hỗ trợ.',
  },
  {
    question: 'Có được đổi trả sản phẩm không?',
    answer: 'Có, SmashX chấp nhận đổi trả trong vòng 30 ngày với điều kiện sản phẩm còn nguyên tem, nhãn mác và chưa qua sử dụng.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
