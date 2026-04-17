import Link from 'next/link';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Header } from '@/components/shop/Header';
import { Footer } from '@/components/shop/Footer';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <div className="bg-gray-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-4">
              Về chúng tôi
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold uppercase tracking-tight mb-6">
              BadmintonPro
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Được thành lập từ năm 2015, BadmintonPro là địa chỉ tin cậy của hàng nghìn 
              người chơi cầu lông trên khắp Việt Nam với cam kết mang đến sản phẩm chính hãng 
              và dịch vụ tốt nhất.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="bg-gray-100 aspect-[4/3]" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-4">
                Câu chuyện của chúng tôi
              </p>
              <h2 className="text-2xl font-bold uppercase tracking-wide mb-6">
                Đam mê cầu lông từ trái tim
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Xuất phát từ niềm đam mê với môn cầu lông, chúng tôi hiểu rằng một cây vợt 
                  tốt có thể thay đổi hoàn toàn trải nghiệm chơi của bạn.
                </p>
                <p>
                  Với hơn 9 năm kinh nghiệm, BadmintonPro tự hào là đối tác chính thức của 
                  các thương hiệu hàng đầu như Yonex, Victor, Li-Ning, và Mizuno.
                </p>
                <p>
                  Chúng tôi cam kết mang đến những sản phẩm chính hãng 100% với giá cả cạnh 
                  tranh nhất thị trường.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-4">
                Giá trị cốt lõi
              </p>
              <h2 className="text-2xl font-bold uppercase tracking-wide">
                Cam kết của chúng tôi
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Chính hãng 100%', desc: 'Tất cả sản phẩm đều được nhập khẩu trực tiếp từ hãng với đầy đủ tem nhãn và bảo hành.' },
                { title: 'Giá tốt nhất', desc: 'Cam kết giá cạnh tranh nhất thị trường, hoàn tiền chênh lệch nếu bạn tìm được rẻ hơn.' },
                { title: 'Dịch vụ tận tâm', desc: 'Đội ngũ tư vấn chuyên nghiệp, am hiểu sản phẩm, sẵn sàng hỗ trợ bạn 24/7.' },
              ].map((value) => (
                <div key={value.title} className="text-center">
                  <h3 className="text-sm font-medium uppercase tracking-widest mb-4">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold uppercase tracking-wide">
              Liên hệ với chúng tôi
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: MapPin, title: 'Địa chỉ', content: '123 Nguyễn Huệ, Q.1, TP.HCM' },
              { icon: Phone, title: 'Hotline', content: '1900 1234' },
              { icon: Mail, title: 'Email', content: 'support@badmintonpro.vn' },
              { icon: Clock, title: 'Giờ mở cửa', content: '8:00 - 21:00 hàng ngày' },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <item.icon className="h-6 w-6 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xs font-medium uppercase tracking-widest mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
