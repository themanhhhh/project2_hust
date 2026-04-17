import Link from 'next/link';
import { Header } from '@/components/shop/Header';
import { Footer } from '@/components/shop/Footer';

export default function PolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="border-b border-gray-100">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-xs text-gray-500">
              <Link href="/" className="hover:text-black transition-colors">Trang chủ</Link>
              <span>/</span>
              <span className="text-black">Chính sách đổi trả</span>
            </nav>
          </div>
        </div>

        {/* Page Header */}
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold uppercase tracking-wide text-center">
            Chính sách đổi trả
          </h1>
        </div>

        <div className="container mx-auto px-4 pb-20 max-w-3xl">
          <div className="prose prose-sm max-w-none text-gray-600">
            <h2 className="text-lg font-bold uppercase tracking-wide text-black">1. Điều kiện đổi trả</h2>
            <p>
              BadmintonPro chấp nhận đổi/trả sản phẩm trong vòng 30 ngày kể từ ngày nhận hàng với các điều kiện sau:
            </p>
            <ul>
              <li>Sản phẩm còn nguyên tem, nhãn mác và bao bì</li>
              <li>Sản phẩm chưa qua sử dụng, không có dấu hiệu hư hỏng</li>
              <li>Có hóa đơn mua hàng hoặc biên nhận</li>
            </ul>

            <h2 className="text-lg font-bold uppercase tracking-wide text-black mt-8">2. Quy trình đổi trả</h2>
            <p>Để đổi/trả sản phẩm, quý khách vui lòng:</p>
            <ol>
              <li>Liên hệ hotline 1900 1234 hoặc email support@badmintonpro.vn</li>
              <li>Cung cấp mã đơn hàng và lý do đổi/trả</li>
              <li>Gửi sản phẩm về địa chỉ cửa hàng</li>
              <li>Nhận sản phẩm mới hoặc hoàn tiền trong 3-5 ngày làm việc</li>
            </ol>

            <h2 className="text-lg font-bold uppercase tracking-wide text-black mt-8">3. Phí đổi trả</h2>
            <p>
              Miễn phí đổi trả trong các trường hợp sau:
            </p>
            <ul>
              <li>Sản phẩm bị lỗi từ nhà sản xuất</li>
              <li>Giao sai sản phẩm</li>
              <li>Sản phẩm không đúng mô tả</li>
            </ul>
            <p>
              Với các trường hợp đổi ý hoặc chọn sai size, quý khách vui lòng chịu phí vận chuyển 2 chiều.
            </p>

            <h2 className="text-lg font-bold uppercase tracking-wide text-black mt-8">4. Hoàn tiền</h2>
            <p>
              Tiền hoàn trả sẽ được chuyển khoản về tài khoản ngân hàng của quý khách trong vòng 
              3-5 ngày làm việc sau khi chúng tôi nhận và kiểm tra sản phẩm.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
