'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { Header } from '@/components/shop/Header';
import { Footer } from '@/components/shop/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';

// Format price in VND
function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

export default function CartPage() {
  const { items, loading, subtotal, updateQuantity, removeFromCart } = useCart();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const shipping = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  const handleRemove = async (itemId: string) => {
    setRemovingId(itemId);
    await removeFromCart(itemId);
    setRemovingId(null);
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    await updateQuantity(itemId, newQuantity);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-20">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3 text-muted-foreground">Đang tải giỏ hàng...</span>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

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
              <span className="text-foreground">Giỏ hàng</span>
            </nav>
          </div>
        </div>

        {/* Page Header */}
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold uppercase tracking-wide text-center">
            Giỏ hàng
          </h1>
        </div>

        <div className="container mx-auto px-4 pb-16">
          {items.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="border-b hidden md:grid grid-cols-12 gap-4 pb-4 text-xs uppercase tracking-widest text-muted-foreground">
                  <div className="col-span-6">Sản phẩm</div>
                  <div className="col-span-2 text-center">Giá</div>
                  <div className="col-span-2 text-center">Số lượng</div>
                  <div className="col-span-2 text-right">Tổng</div>
                </div>

                {items.map((item) => (
                  <div key={item.id} className="border-b py-6">
                    <div className="grid md:grid-cols-12 gap-4 items-center">
                      {/* Product */}
                      <div className="md:col-span-6 flex gap-4">
                        <div className="w-24 h-24 bg-muted shrink-0 flex items-center justify-center rounded overflow-hidden">
                          {item.image && item.image !== '/products/placeholder.jpg' ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                            {item.brand}
                          </p>
                          <Link href={`/products/${item.productId}`} className="text-sm font-medium hover:underline">
                            {item.name}
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 h-auto p-0 text-xs text-muted-foreground hover:text-foreground md:hidden"
                            onClick={() => handleRemove(item.id)}
                            disabled={removingId === item.id}
                          >
                            <X className="h-3 w-3 mr-1" /> Xóa
                          </Button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="md:col-span-2 text-center">
                        <span className="text-sm">{formatPrice(item.price)}</span>
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2 flex justify-center">
                        <div className="flex items-center border rounded">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center text-sm">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4">
                        <span className="text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemove(item.id)}
                          disabled={removingId === item.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="bg-muted/50 sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium uppercase tracking-widest">
                      Tóm tắt đơn hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phí vận chuyển</span>
                      <span>{shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}</span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Miễn phí vận chuyển cho đơn hàng từ {formatPrice(500000)}
                      </p>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Tổng cộng</span>
                      <span>{formatPrice(total)}</span>
                    </div>

                    <Button asChild className="w-full h-12 mt-4">
                      <Link href="/checkout">
                        Thanh toán
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>

                    <Link 
                      href="/products" 
                      className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Tiếp tục mua sắm
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-6">Giỏ hàng của bạn đang trống</p>
              <Button asChild className="h-12">
                <Link href="/products">
                  Mua sắm ngay
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
