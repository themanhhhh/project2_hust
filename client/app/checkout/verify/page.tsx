'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Loader2, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { orderApi } from '@/lib/api';

function VerifyOTPContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId') || '';
  const orderNumber = searchParams.get('order') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Handle input change
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only last char
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  // Submit OTP
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đủ 6 số');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await orderApi.verifyOTP(orderId, otpCode);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/checkout/success?order=${orderNumber}`);
        }, 1500);
      } else {
        setError(result.message || 'Mã OTP không đúng');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (otp.every(d => d !== '') && !loading && !success) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // Resend OTP
  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const result = await orderApi.resendOTP(orderId);
      if (result.success) {
        setCooldown(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(result.message || 'Không thể gửi lại mã');
      }
    } catch {
      setError('Không thể gửi lại mã. Vui lòng thử lại.');
    } finally {
      setResending(false);
    }
  };

  if (!orderId) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Không tìm thấy thông tin đơn hàng.</p>
            <Button asChild>
              <Link href="/products">Tiếp tục mua sắm</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center">
            <Link href="/" className="text-xl font-bold tracking-[0.2em] uppercase">
              BadmintonPro
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card>
          <CardContent className="pt-8 pb-8 px-8">
            {success ? (
              /* Success state */
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold mb-2">Xác nhận thành công!</h2>
                <p className="text-sm text-muted-foreground">
                  Đang chuyển đến trang chi tiết đơn hàng...
                </p>
              </div>
            ) : (
              /* OTP input state */
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Xác nhận đơn hàng</h2>
                  <p className="text-sm text-muted-foreground">
                    Chúng tôi đã gửi mã OTP 6 số đến email của bạn.
                    <br />
                    Vui lòng nhập mã để xác nhận đơn hàng{' '}
                    <span className="font-mono font-medium text-foreground">{orderNumber}</span>
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* OTP Inputs */}
                  <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 text-center text-xl font-bold bg-gray-50 focus:bg-white"
                        disabled={loading}
                      />
                    ))}
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="text-center mb-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Submit button */}
                  <Button type="submit" className="w-full h-12 mb-4" disabled={loading || otp.some(d => d === '')}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Đang xác nhận...
                      </>
                    ) : (
                      'Xác nhận đơn hàng'
                    )}
                  </Button>

                  {/* Resend OTP */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Không nhận được mã?
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleResend}
                      disabled={resending || cooldown > 0}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      {cooldown > 0
                        ? `Gửi lại sau ${cooldown}s`
                        : resending
                          ? 'Đang gửi...'
                          : 'Gửi lại mã'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Dang tai xac nhan don hang...
          </div>
        </main>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}
