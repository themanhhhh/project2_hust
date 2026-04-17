'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Mail, Lock, ArrowRight, Loader2, Text } from 'lucide-react';
import { toast } from 'sonner';
import { useSellerAuth } from '@/contexts/SellerAuthContext';

export default function SellerRegisterPage() {
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { register } = useSellerAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !storeName) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register({ email, password, store_name: storeName });
      if (result.success) {
        toast.success('Đăng ký chi nhánh thành công! Vui lòng đăng nhập.');
        router.push('/seller/login');
      } else {
        toast.error(result.message || 'Đăng ký thất bại.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <div className="relative flex-1 hidden w-0 lg:block bg-black">
        <div className="absolute inset-0 flex items-center justify-center p-12 text-center text-white">
          <div>
            <h2 className="text-4xl font-bold mb-4">Mở gian hàng ngay hôm nay</h2>
            <p className="text-lg text-gray-300 max-w-md mx-auto">
              Tiếp cận nguồn khách hàng đa dạng và quản lý kinh doanh chuyên nghiệp.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto lg:w-96">
          <div>
            <div className="flex items-center gap-2">
              <Store className="h-8 w-8 text-black" />
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Seller Center</h2>
            </div>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Đăng ký mở gian hàng mới
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Đã có cửa hàng?{' '}
              <Link href="/seller/login" className="font-semibold text-black hover:text-gray-800">
                Đăng nhập
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Tên cửa hàng
                </label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Text className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                    placeholder="Cửa hàng thể thao ABC"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Địa chỉ Email
                </label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                    placeholder="seller@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Mật khẩu
                </label>
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-black px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Tạo tài khoản
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
