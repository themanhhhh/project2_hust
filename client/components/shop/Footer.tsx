import Link from 'next/link';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  const supportLinks = [
    { label: 'Hướng dẫn mua hàng', href: '/faq' },
    { label: 'Chính sách đổi trả', href: '/policy' },
    { label: 'Chính sách vận chuyển', href: '/policy' },
    { label: 'Chính sách bảo hành', href: '/policy' },
    { label: 'Câu hỏi thường gặp', href: '/faq' },
  ];

  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Newsletter Section */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-lg font-medium uppercase tracking-widest mb-4">
              Đăng ký nhận tin
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Nhận thông tin mới nhất về sản phẩm và khuyến mãi
            </p>
            <form className="flex gap-0">
              <label htmlFor="newsletter-email" className="sr-only">Email</label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email của bạn…"
                className="flex-1 h-12 px-4 border border-gray-200 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-inset transition-colors"
              />
              <button 
                type="submit"
                className="px-8 h-12 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-gray-900 transition-colors focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <h2 className="text-lg font-bold tracking-[0.2em] uppercase">
                BadmintonPro
              </h2>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Cửa hàng chuyên cung cấp các sản phẩm cầu lông chính hãng từ các thương hiệu hàng đầu thế giới.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 hover:opacity-60 transition-opacity" aria-label="Facebook">
                <Facebook className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="#" className="p-2 hover:opacity-60 transition-opacity" aria-label="Instagram">
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="#" className="p-2 hover:opacity-60 transition-opacity" aria-label="Youtube">
                <Youtube className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-widest mb-6">
              Sản phẩm
            </h4>
            <nav className="flex flex-col gap-3">
              {['Vợt cầu lông', 'Giày cầu lông', 'Phụ kiện', 'Cầu lông', 'Sale'].map((link) => (
                <Link
                  key={link}
                  href="#"
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  {link}
                </Link>
              ))}
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-widest mb-6">
              Hỗ trợ
            </h4>
            <nav className="flex flex-col gap-3">
              {supportLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-widest mb-6">
              Liên hệ
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 shrink-0 text-gray-400" aria-hidden="true" />
                <span className="text-sm text-gray-600">
                  123 Nguyễn Huệ, Quận 1, TP.Hồ Chí Minh
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                <span className="text-sm text-gray-600">1900 1234</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                <span className="text-sm text-gray-600">support@badmintonpro.vn</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <p className="text-xs text-gray-500 text-center">
            © 2026 BadmintonPro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
