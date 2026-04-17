'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Header } from '@/components/shop/Header';
import { Footer } from '@/components/shop/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
  };

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
              <span className="text-foreground">Liên hệ</span>
            </nav>
          </div>
        </div>

        {/* Page Header */}
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold uppercase tracking-wide text-center mb-4">
            Liên hệ
          </h1>
          <p className="text-muted-foreground text-center max-w-xl mx-auto">
            Bạn có câu hỏi hoặc cần hỗ trợ? Hãy liên hệ với chúng tôi qua form bên dưới 
            hoặc thông tin liên lạc.
          </p>
        </div>

        <div className="container mx-auto px-4 pb-20">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nhập họ và tên"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Nhập email"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Nhập số điện thoại"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chủ đề</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Chọn chủ đề" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="order">Đơn hàng</SelectItem>
                        <SelectItem value="product">Sản phẩm</SelectItem>
                        <SelectItem value="warranty">Bảo hành</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Nội dung <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Nhập nội dung tin nhắn"
                    className="resize-none"
                  />
                </div>

                <Button type="submit" className="h-12 px-8">
                  <Send className="h-4 w-4 mr-2" />
                  Gửi tin nhắn
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-1">
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium uppercase tracking-widest">
                    Thông tin liên hệ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-4">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Địa chỉ</p>
                      <p className="text-sm">123 Nguyễn Huệ, Quận 1, TP.Hồ Chí Minh</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Hotline</p>
                      <p className="text-sm">1900 1234</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Email</p>
                      <p className="text-sm">support@badmintonpro.vn</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Giờ làm việc</p>
                      <p className="text-sm">8:00 - 21:00 hàng ngày</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
