'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Logo Header */}
      <div className="py-6 border-b border-gray-100">
        <Link href="/" className="block text-center">
          <h1 className="text-xl font-bold tracking-[0.3em] uppercase">
            BadmintonPro
          </h1>
        </Link>
      </div>

      {/* Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md border-0 shadow-none">
          <CardHeader className="text-center space-y-1 pb-8">
            <CardTitle className="text-2xl font-bold">Quên mật khẩu</CardTitle>
            <CardDescription>
              Nhập số điện thoại để nhận mã xác thực
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Số điện thoại"
                    className="h-12 bg-gray-50"
                  />
                </div>

                <Button type="submit" className="w-full h-12">
                  Gửi mã xác thực
                </Button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Mã xác thực đã được gửi đến số điện thoại của bạn. 
                  Vui lòng kiểm tra tin nhắn.
                </p>
                <Button
                  variant="ghost"
                  onClick={() => setSubmitted(false)}
                  className="text-sm"
                >
                  Gửi lại mã xác thực
                </Button>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link 
                href="/account" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Quay lại đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
