'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, Menu, User, LogIn } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCart();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  const navLinks = [
    { href: '/products', label: 'ALL PRODUCT' },
    { href: '/products?category=racket', label: 'VỢT CẦU LÔNG' },
    { href: '/products?category=grip', label: 'QUẤN CÁN' },
    { href: '/products?category=string', label: 'CƯỚC' },
    { href: '/products?category=backpack', label: 'BALO' },
    { href: '/products?category=bag', label: 'TÚI' },
    { href: '/products?sale=true', label: 'SALE OFF' },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    if (url.pathname === '/products') {
      setSearchQuery(url.searchParams.get('q') || '');
    } else {
      setSearchQuery('');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUrl = typeof window !== 'undefined' ? new URL(window.location.href) : null;
    const isProductsPage = currentUrl?.pathname === '/products';
    const params = new URLSearchParams(isProductsPage ? currentUrl?.searchParams.toString() : '');
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    } else {
      params.delete('q');
    }
    params.delete('page');
    const queryString = params.toString();
    router.push(queryString ? `/products?${queryString}` : '/products');
    setIsSearchOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white">
        {/* Announcement Bar */}
        <div className="bg-black text-white text-xs py-2.5 text-center tracking-widest uppercase">
          Miễn phí vận chuyển cho đơn hàng từ 500.000đ | Hotline: 1900 1234
        </div>

        {/* Main Header */}
        <div className="border-b border-gray-100 relative">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Left - Menu */}
              <div className="flex items-center gap-4">
                <button
                  className="p-2 hover:opacity-60 transition-opacity focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  onClick={() => setIsSidebarOpen(true)}
                  aria-label="Mở menu"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
                <button 
                  className="p-2 hover:opacity-60 transition-opacity hidden sm:block focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  aria-label="Tìm kiếm"
                  onClick={() => setIsSearchOpen((prev) => !prev)}
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Center - Logo */}
              <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase truncate max-w-[160px] sm:max-w-none">
                  BadmintonPro
                </h1>
              </Link>

              {/* Right - Actions */}
              <div className="flex items-center gap-1">
                <button
                  className="p-2 hover:opacity-60 transition-opacity sm:hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  aria-label="Tìm kiếm"
                  onClick={() => setIsSearchOpen((prev) => !prev)}
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {!loading && (
                  <>
                    {isAuthenticated ? (
                      <>
                        {/* User Icon - only when logged in */}
                        <Link 
                          href="/account" 
                          className="p-2 hover:opacity-60 transition-opacity hidden sm:block focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                          aria-label="Tài khoản"
                        >
                          <User className="h-5 w-5" aria-hidden="true" />
                        </Link>
                        {/* Cart - only when logged in */}
                        <Link 
                          href="/cart" 
                          className="relative p-2 sm:p-2.5 hover:opacity-60 transition-opacity focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center -m-2"
                          aria-label={`Giỏ hàng${itemCount > 0 ? `, ${itemCount} sản phẩm` : ''}`}
                        >
                          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                          {itemCount > 0 && (
                            <span className="absolute top-0 right-0 h-4 w-4 bg-black text-white text-[10px] rounded-full flex items-center justify-center" aria-hidden="true">
                              {itemCount}
                            </span>
                          )}
                        </Link>
                      </>
                    ) : (
                      /* Login Button - only when not logged in */
                      <Link 
                        href="/account" 
                        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-black text-white text-[10px] sm:text-xs font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors"
                      >
                        <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden xs:inline">Đăng nhập</span>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {isSearchOpen && (
            <div ref={searchContainerRef} className="absolute inset-x-0 top-full z-50 border-t border-gray-100 bg-white shadow-[0_22px_40px_-28px_rgba(15,23,42,0.35)]">
              <div className="container mx-auto px-4 py-4">
                <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm sản phẩm, thương hiệu..."
                      className="h-12 w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchOpen(false);
                        if (typeof window !== 'undefined') {
                          const url = new URL(window.location.href);
                          if (url.pathname === '/products' && url.searchParams.get('q')) {
                            const params = new URLSearchParams(url.searchParams.toString());
                            params.delete('q');
                            params.delete('page');
                            const queryString = params.toString();
                            router.push(queryString ? `/products?${queryString}` : '/products');
                          }
                        }
                      }}
                      className="h-12 rounded-full border border-gray-200 px-5 text-xs font-medium uppercase tracking-widest text-gray-600 transition hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="h-12 rounded-full bg-black px-6 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-gray-800"
                    >
                      Tìm kiếm
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex justify-center gap-10 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-medium tracking-widest uppercase text-gray-800 hover:text-black transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
