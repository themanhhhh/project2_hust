'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CreditCard, Truck, Wallet, Building2, Loader2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { orderApi } from '@/lib/api';
import { formatPrice } from '@/lib/productMapper';

// Vietnamese Address API
const PROVINCES_API = 'https://provinces.open-api.vn/api';

interface Province {
  code: number;
  name: string;
}

interface District {
  code: number;
  name: string;
}

interface Ward {
  code: number;
  name: string;
}

const paymentMethods = [
  { id: 'cod', name: 'Thanh toán khi nhận hàng (COD)', icon: Truck },
  { id: 'banking', name: 'Chuyển khoản ngân hàng', icon: Building2 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    note: '',
  });

  // Vietnamese address state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const shipping = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  // Pre-fill user info
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || (user as any).phone || '',
      }));
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!authLoading && !orderPlaced && items.length === 0) {
      router.replace('/cart');
    }
  }, [authLoading, items, router, orderPlaced]);

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch(`${PROVINCES_API}/p/`);
        const data = await res.json();
        setProvinces(data);
      } catch (err) {
        console.error('Failed to fetch provinces:', err);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (!selectedProvinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }
    
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      setDistricts([]);
      setWards([]);
      setFormData(prev => ({ ...prev, district: '', ward: '' }));
      setSelectedDistrictCode(null);
      try {
        const res = await fetch(`${PROVINCES_API}/p/${selectedProvinceCode}?depth=2`);
        const data = await res.json();
        setDistricts(data.districts || []);
      } catch (err) {
        console.error('Failed to fetch districts:', err);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [selectedProvinceCode]);

  // Fetch wards when district changes
  useEffect(() => {
    if (!selectedDistrictCode) {
      setWards([]);
      return;
    }
    
    const fetchWards = async () => {
      setLoadingWards(true);
      setWards([]);
      setFormData(prev => ({ ...prev, ward: '' }));
      try {
        const res = await fetch(`${PROVINCES_API}/d/${selectedDistrictCode}?depth=2`);
        const data = await res.json();
        setWards(data.wards || []);
      } catch (err) {
        console.error('Failed to fetch wards:', err);
      } finally {
        setLoadingWards(false);
      }
    };
    fetchWards();
  }, [selectedDistrictCode]);

  const handleProvinceChange = (value: string) => {
    const province = provinces.find(p => p.code.toString() === value);
    if (province) {
      setFormData(prev => ({ ...prev, province: province.name }));
      setSelectedProvinceCode(province.code);
    }
  };

  const handleDistrictChange = (value: string) => {
    const district = districts.find(d => d.code.toString() === value);
    if (district) {
      setFormData(prev => ({ ...prev, district: district.name }));
      setSelectedDistrictCode(district.code);
    }
  };

  const handleWardChange = (value: string) => {
    const ward = wards.find(w => w.code.toString() === value);
    if (ward) {
      setFormData(prev => ({ ...prev, ward: ward.name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate user is logged in
    if (!user || !user.id) {
      router.push('/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create order via API - only send fields that Order entity supports
      const orderData = {
        user_id: user.id,
        total,
        status: 'pending',
        payment_status: 'pending',
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      console.log('Creating order with data:', orderData);
      const createdOrder = await orderApi.create(orderData as any);
      setOrderPlaced(true);
      await clearCart();
      const orderNumber = (createdOrder as any)?.order_number || '';
      const createdOrderId = (createdOrder as any)?.id || '';
      router.push(`/checkout/verify?orderId=${createdOrderId}&order=${orderNumber}`);
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/cart" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Quay lại giỏ hàng
            </Link>
            <Link href="/" className="text-xl font-bold tracking-[0.2em] uppercase">
              BadmintonPro
            </Link>
            <div className="w-[120px]" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium uppercase tracking-widest">
                    Thông tin giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nhập họ tên"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Nhập số điện thoại"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Nhập email (tùy chọn)"
                      className="h-11"
                    />
                  </div>

                  {/* Address: Province → District → Ward */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Tỉnh/Thành phố <span className="text-red-500">*</span></Label>
                      <Select
                        value={selectedProvinceCode?.toString() || ''}
                        onValueChange={handleProvinceChange}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={loadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành'} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {provinces.map((p) => (
                            <SelectItem key={p.code} value={p.code.toString()}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Quận/Huyện <span className="text-red-500">*</span></Label>
                      <Select
                        value={selectedDistrictCode?.toString() || ''}
                        onValueChange={handleDistrictChange}
                        disabled={!selectedProvinceCode}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={loadingDistricts ? 'Đang tải...' : 'Chọn quận/huyện'} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {districts.map((d) => (
                            <SelectItem key={d.code} value={d.code.toString()}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Phường/Xã <span className="text-red-500">*</span></Label>
                      <Select
                        value={formData.ward ? wards.find(w => w.name === formData.ward)?.code.toString() || '' : ''}
                        onValueChange={handleWardChange}
                        disabled={!selectedDistrictCode}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={loadingWards ? 'Đang tải...' : 'Chọn phường/xã'} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {wards.map((w) => (
                            <SelectItem key={w.code} value={w.code.toString()}>
                              {w.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ cụ thể <span className="text-red-500">*</span></Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Số nhà, tên đường..."
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú</Label>
                    <Textarea
                      id="note"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium uppercase tracking-widest">
                    Phương thức thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === method.id ? 'border-primary' : 'border-muted-foreground'
                      }`}>
                        {paymentMethod === method.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <method.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">{method.name}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-base font-medium uppercase tracking-widest">
                    Đơn hàng của bạn ({items.length} sản phẩm)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center shrink-0 overflow-hidden">
                          {item.image && item.image.startsWith('http') ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">SL: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-medium shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phí vận chuyển</span>
                      <span>{shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-medium">
                    <span>Tổng cộng</span>
                    <span className="text-lg">{formatPrice(total)}</span>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 mt-4"
                    disabled={isSubmitting || items.length === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Đặt hàng'
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Bằng việc đặt hàng, bạn đồng ý với{' '}
                    <Link href="/policy" className="underline hover:text-foreground">
                      điều khoản
                    </Link>{' '}
                    của chúng tôi
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
