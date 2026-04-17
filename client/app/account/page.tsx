'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, MapPin, LogOut, ChevronRight, Clock, ShoppingBag, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Header } from '@/components/shop/Header';
import { Footer } from '@/components/shop/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { getToken } from '@/lib/auth';

// Format price in VND
function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Status labels for order display
const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-gray-100 text-gray-800' },
  pending_payment: { label: 'Chờ thanh toán', color: 'bg-gray-100 text-gray-800' },
  paid: { label: 'Đã thanh toán', color: 'bg-gray-200 text-gray-800' },
  awaiting_shipment: { label: 'Chờ tạo shipment', color: 'bg-gray-200 text-gray-800' },
  awaiting_collection: { label: 'Chờ lấy hàng', color: 'bg-gray-200 text-gray-800' },
  in_transit: { label: 'Đang vận chuyển', color: 'bg-gray-300 text-gray-800' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-gray-200 text-gray-800' },
  shipping: { label: 'Đang giao', color: 'bg-gray-300 text-gray-800' },
  delivered: { label: 'Hoàn tất', color: 'bg-black text-white' },
  completed: { label: 'Hoàn tất', color: 'bg-black text-white' },
  cancelled: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-500' },
};

// Change Password Section Component
function ChangePasswordSection() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu mới không khớp');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    try {
      const token = getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Đổi mật khẩu thành công!');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setOpen(false);
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message || 'Đổi mật khẩu thất bại');
      }
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h4 className="font-medium">Đổi mật khẩu</h4>
        <p className="text-sm text-muted-foreground">Cập nhật mật khẩu đăng nhập</p>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <KeyRound className="h-4 w-4 mr-2" /> Đổi mật khẩu
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu</DialogTitle>
            <DialogDescription>
              Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                {success}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                type="password"
                required
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Nhập mật khẩu hiện tại"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                required
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Nhập lại mật khẩu mới"
                disabled={loading}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Login Form Component
function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData);
      
      if (result.success) {
        // Redirect based on user role
        if (result.user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/account');
        }
      } else {
        setError(result.message || 'Đăng nhập thất bại');
      }
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <div className="py-6 border-b border-gray-100">
        <Link href="/" className="block text-center">
          <h1 className="text-xl font-bold tracking-[0.3em] uppercase">
            BadmintonPro
          </h1>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md border-0 shadow-none">
          <CardHeader className="text-center space-y-1 pb-8">
            <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
            <CardDescription>
              Đăng nhập để mua sắm và theo dõi đơn hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

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
                  placeholder="email@example.com"
                  className="h-12 bg-gray-50"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mật khẩu"
                  className="h-12 bg-gray-50"
                  disabled={loading}
                />
              </div>

              <div className="text-left">
                <Link 
                  href="/account/forgot-password" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Quên thông tin tài khoản
                </Link>
              </div>

              <Button type="submit" className="w-full h-12" disabled={loading}>
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Bạn chưa có tài khoản?{' '}
                <Link 
                  href="/account/register" 
                  className="text-foreground font-medium hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

// Order type from API
interface OrderItem {
  id: string;
  productId?: string;
  product_id?: string;
  quantity: number;
  price: number;
  product?: {
    name?: string;
  };
}

interface Order {
  id: string;
  orderNumber?: string;
  order_number?: string;
  status: string;
  total: number;
  createdAt?: string;
  created_at?: string;
  items?: OrderItem[];
  order_items?: OrderItem[];
}

// Address type from API
interface Address {
  id: string;
  fullName?: string;
  full_name?: string;
  phone?: string;
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  province?: string;
  isDefault?: boolean;
  is_default?: boolean;
}

// Account Dashboard Component
function AccountDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);

  // Fetch user orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        setOrdersLoading(false);
        return;
      }

      try {
        const token = getToken();
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
        const response = await fetch(`${API_BASE_URL}/orders/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          setOrders(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

  // Fetch user addresses from API
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.id) {
        setAddressesLoading(false);
        return;
      }

      try {
        const token = getToken();
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
        const response = await fetch(`${API_BASE_URL}/addresses/user/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          setAddresses(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      } finally {
        setAddressesLoading(false);
      }
    };

    fetchAddresses();
  }, [user?.id]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link>
              <span>/</span>
              <span className="text-foreground">Tài khoản</span>
            </nav>
          </div>
        </div>

        {/* Page Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-black text-white rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.name || 'Người dùng'}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-white border gap-1">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                Thông tin
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <Package className="h-4 w-4" />
                Đơn hàng
              </TabsTrigger>
              <TabsTrigger value="addresses" className="gap-2">
                <MapPin className="h-4 w-4" />
                Địa chỉ
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin tài khoản</CardTitle>
                  <CardDescription>Quản lý thông tin cá nhân của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Họ và tên</Label>
                      <Input value={user?.name || ''} disabled className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user?.email || ''} disabled className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Số điện thoại</Label>
                      <Input value={user?.phone || 'Chưa cập nhật'} disabled className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Vai trò</Label>
                      <Input 
                        value={user?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'} 
                        disabled 
                        className="bg-gray-50" 
                      />
                    </div>
                  </div>

                  <Separator />

                  <ChangePasswordSection />

                  <Separator />

                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-red-600">Đăng xuất</h4>
                      <p className="text-sm text-muted-foreground">Thoát khỏi tài khoản hiện tại</p>
                    </div>
                    <Button variant="destructive" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" /> Đăng xuất
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lịch sử đơn hàng</CardTitle>
                  <CardDescription>Xem và theo dõi các đơn hàng của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Bạn chưa có đơn hàng nào</p>
                      <Button asChild className="mt-4">
                        <Link href="/products">Mua sắm ngay</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <span className="font-mono font-medium">{order.orderNumber || order.order_number || order.id.slice(0, 8)}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${statusLabels[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                                {statusLabels[order.status]?.label || order.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {formatDate(order.createdAt || order.created_at || new Date().toISOString())}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {(order.order_items || order.items)?.map((item: OrderItem, idx: number) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{item.product?.name || 'Sản phẩm'} x{item.quantity}</span>
                                <span>{formatPrice(item.price)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Tổng cộng: {formatPrice(order.total)}</span>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/account/orders/${order.id}`}>
                                Xem chi tiết <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Địa chỉ giao hàng</CardTitle>
                    <CardDescription>Quản lý các địa chỉ giao hàng của bạn</CardDescription>
                  </div>
                  <Button>Thêm địa chỉ mới</Button>
                </CardHeader>
                <CardContent>
                  {addressesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Đang tải địa chỉ...</p>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Bạn chưa có địa chỉ nào</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{address.fullName || address.full_name}</span>
                                {(address.isDefault || address.is_default) && (
                                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{address.phone}</p>
                              <p className="text-sm mt-2">
                                {address.street}
                                {address.ward && `, ${address.ward}`}
                                {address.district && `, ${address.district}`}
                                {(address.city || address.province) && `, ${address.city || address.province}`}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">Sửa</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
}

// Main Account Page
export default function AccountPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
    if (!loading && isAuthenticated && user?.role === 'admin') {
      router.replace('/admin');
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <AccountDashboard />;
}

