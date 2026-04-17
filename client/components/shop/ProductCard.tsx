'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Check, CircleAlert } from 'lucide-react';
import { type DisplayProduct, formatPrice } from '@/lib/productMapper';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

interface ProductCardProps {
  product: DisplayProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [showOutOfStockDialog, setShowOutOfStockDialog] = useState(false);
  const isOutOfStock = !product.inStock;

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      setShowOutOfStockDialog(true);
      return;
    }
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    setIsAdding(true);
    
    await addToCart({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image || '/products/placeholder.jpg',
      quantity: 1,
    });
    
    setIsAdding(false);
    setAdded(true);
    
    // Reset after 2 seconds
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <Dialog open={showOutOfStockDialog} onOpenChange={setShowOutOfStockDialog}>
        <DialogContent className="max-w-md rounded-[28px] border border-slate-200/80 bg-slate-50 p-0 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.22)]">
          <div className="bg-[linear-gradient(135deg,_#f8fafc,_#f1f5f9_55%,_#e5e7eb)] p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-slate-700">
              <CircleAlert className="h-5 w-5" />
            </div>
            <DialogHeader className="mt-4">
              <DialogTitle className="text-xl font-semibold text-slate-950">Sản phẩm hết hàng</DialogTitle>
              <DialogDescription className="text-sm leading-6 text-slate-600">
                <span className="font-medium text-slate-900">{product.name}</span> hiện không còn tồn kho. Vui lòng chọn sản phẩm khác hoặc quay lại sau khi cửa hàng cập nhật hàng mới.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="border-t border-slate-200/80 bg-white/70 px-6 py-5 sm:justify-between">
            <Button variant="outline" className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100" onClick={() => setShowOutOfStockDialog(false)}>
              Đóng
            </Button>
            <Button asChild className="bg-slate-700 text-white hover:bg-slate-600">
              <Link href={`/products/${product.id}`}>Xem chi tiết</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div
        className={`group relative p-3 transition-all ${isOutOfStock ? 'shadow-inner opacity-75' : 'bg-white'}`}
        style={isOutOfStock ? { backgroundColor: '#EAEFEF' } : undefined}
      >
      {/* Badge */}
      {isOutOfStock ? (
        <div className="absolute top-6 left-6 z-10  bg-slate-950 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
          Out of Stock
        </div>
      ) : product.badge && (
        <div className={`absolute top-3 left-3 z-10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${
          product.badge === 'hot' ? 'bg-black text-white' :
          product.badge === 'new' ? 'bg-white text-black border border-black' :
          'bg-red-600 text-white'
        }`}>
          {product.badge === 'hot' ? 'Best Seller' :
           product.badge === 'new' ? 'New' :
           `-${discount}%`}
        </div>
      )}

      {/* Add to Cart Button - appears on hover */}
      <Button
        size="icon"
        variant={added ? "default" : "secondary"}
        className={`absolute top-6 right-6 z-10 h-10 w-10 transition-opacity duration-200 ${
          isOutOfStock
            ? 'bg-white text-slate-500 opacity-100 shadow-sm hover:bg-white'
            : `opacity-0 group-hover:opacity-100 ${added ? 'bg-green-600 hover:bg-green-700' : ''}`
        }`}
        onClick={handleAddToCart}
        disabled={isAdding}
      >
        {isOutOfStock ? (
          <CircleAlert className="h-4 w-4" />
        ) : added ? (
          <Check className="h-4 w-4" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
      </Button>

      {/* Image */}
      <Link href={`/products/${product.id}`} className="block">
        <div
          className={`aspect-[3/4] overflow-hidden mb-4 relative rounded-[24px] ${isOutOfStock ? '' : 'bg-gray-50'}`}
          style={isOutOfStock ? { backgroundColor: '#EAEFEF' } : undefined}
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              unoptimized
              className={`object-cover transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-35' : 'group-hover:scale-105'}`}
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center ${isOutOfStock ? '' : 'bg-gradient-to-br from-gray-100 to-gray-50'}`}
              style={isOutOfStock ? { backgroundColor: '#EAEFEF' } : undefined}
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isOutOfStock ? 'bg-[#d9e0e0]' : 'bg-gray-200'}`}>
                <span className={`${isOutOfStock ? 'text-slate-500' : 'text-gray-400'} text-3xl font-light`}>
                  {product.brand.charAt(0)}
                </span>
              </div>
            </div>
          )}
          
        </div>
      </Link>

      {/* Content */}
      <div className="space-y-2">
        <Link href={`/products/${product.id}`} className="block">
          <h3 className={`text-sm font-medium uppercase tracking-wide line-clamp-1 ${isOutOfStock ? 'text-slate-500' : 'text-gray-900 group-hover:underline'}`}>
            {product.name}
          </h3>
        </Link>
        <p className={`text-xs uppercase tracking-wider ${isOutOfStock ? 'text-slate-400' : 'text-gray-400'}`}>
          {product.brand}
        </p>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isOutOfStock ? 'text-slate-500' : ''}`}>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className={`text-sm line-through ${isOutOfStock ? 'text-slate-400' : 'text-gray-400'}`}>
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
