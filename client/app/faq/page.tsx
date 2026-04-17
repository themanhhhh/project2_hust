'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Header } from '@/components/shop/Header';
import { Footer } from '@/components/shop/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const faqItems = [
  {
    question: 'Làm thế nào để đặt hàng?',
    answer: 'Bạn có thể đặt hàng trực tiếp trên website bằng cách thêm sản phẩm vào giỏ hàng và tiến hành thanh toán. Hoặc liên hệ hotline 1900 1234 để được hỗ trợ đặt hàng.'
  },
  {
    question: 'Thời gian giao hàng là bao lâu?',
    answer: 'Đơn hàng nội thành TP.HCM và Hà Nội sẽ được giao trong 1-2 ngày. Các tỉnh thành khác từ 3-5 ngày làm việc.'
  },
  {
    question: 'Sản phẩm có bảo hành không?',
    answer: 'Tất cả sản phẩm chính hãng tại BadmintonPro đều được bảo hành theo chính sách của nhà sản xuất, thường từ 6-12 tháng tùy sản phẩm.'
  },
  {
    question: 'Tôi có thể thanh toán bằng hình thức nào?',
    answer: 'Chúng tôi chấp nhận thanh toán COD (thanh toán khi nhận hàng), chuyển khoản ngân hàng, và các ví điện tử phổ biến như Momo, ZaloPay, VNPay.'
  },
  {
    question: 'Làm sao để chọn đúng loại vợt phù hợp?',
    answer: 'Việc chọn vợt phụ thuộc vào nhiều yếu tố như trình độ, lối chơi, và sở thích cá nhân. Bạn có thể liên hệ đội ngũ tư vấn của chúng tôi qua hotline 1900 1234 để được hỗ trợ.'
  },
  {
    question: 'Có được đổi trả sản phẩm không?',
    answer: 'Có, chúng tôi chấp nhận đổi trả trong vòng 30 ngày với điều kiện sản phẩm còn nguyên tem, nhãn mác và chưa qua sử dụng. Chi tiết xem tại trang Chính sách đổi trả.'
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="border-b border-gray-100">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link>
              <span>/</span>
              <span className="text-foreground">Câu hỏi thường gặp</span>
            </nav>
          </div>
        </div>

        {/* Page Header */}
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold uppercase tracking-wide text-center mb-4">
            Câu hỏi thường gặp
          </h1>
          <p className="text-muted-foreground text-center max-w-xl mx-auto">
            Tìm câu trả lời cho các thắc mắc phổ biến. Nếu không tìm thấy, vui lòng liên hệ chúng tôi.
          </p>
        </div>

        <div className="container mx-auto px-4 pb-20 max-w-3xl">
          <div className="space-y-2">
            {faqItems.map((item, index) => (
              <Collapsible
                key={index}
                open={openIndex === index}
                onOpenChange={(isOpen) => setOpenIndex(isOpen ? index : null)}
              >
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between text-left p-4 hover:bg-muted/50 transition-colors rounded-lg group">
                    <span className="text-sm font-medium pr-4">
                      {item.question}
                    </span>
                    <ChevronDown 
                      className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        openIndex === index ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

          {/* Contact CTA */}
          <Card className="mt-12 bg-muted/50">
            <CardContent className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                Không tìm thấy câu trả lời bạn cần?
              </p>
              <Button asChild className="h-12">
                <Link href="/contact">
                  Liên hệ chúng tôi
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
