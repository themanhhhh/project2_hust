'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSellerAuth } from '@/contexts/SellerAuthContext';

export default function SellerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useSellerAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login({ email, password });
      if (result.success) {
        toast.success('Đăng nhập thành công!');
        router.push('/seller');
      } else {
        toast.error(result.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra khi đăng nhập');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto lg:w-96">
          <div>
            <div className="flex items-center gap-2">
              <Store className="h-8 w-8 text-black" />
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Seller Center</h2>
            </div>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Đăng nhập tài khoản người bán
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Chưa có cửa hàng?{' '}
              <Link href="/seller/register" className="font-semibold text-black hover:text-gray-800">
                Đăng ký mở gian hàng
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <form onSubmit={handleLogin} className="space-y-6">
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
                      Đăng nhập
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="relative flex-1 hidden w-0 lg:block bg-black">
        <div className="absolute inset-0 flex items-center justify-center p-12 text-center text-white">
          <div>
            <h2 className="text-4xl font-bold mb-4">Quản lý cửa hàng dễ dàng</h2>
            <p className="text-lg text-gray-300 max-w-md mx-auto">
              Nền tảng kết nối hàng triệu khách hàng tiềm năng đến với cửa hàng của bạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
