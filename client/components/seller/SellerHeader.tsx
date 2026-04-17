'use client';

import { useEffect, useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/shop/ThemeToggle';
import { useSellerAuth } from '@/contexts/SellerAuthContext';

export function SellerHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { seller } = useSellerAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const scrollContainer = document.querySelector('[data-sidebar="inset"]') || window;
    if (scrollContainer !== window) {
      scrollContainer.addEventListener('scroll', (e) => {
        setIsScrolled((e.target as HTMLElement).scrollTop > 0);
      }, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollContainer !== window) {
        scrollContainer.removeEventListener('scroll', () => {});
      }
    };
  }, []);

  return (
    <header className={`sticky z-30 flex h-16 flex-shrink-0 items-center gap-4 px-6 transition-all duration-200 rounded-[0.5rem] ${
      isScrolled ? 'top-2 mx-4 bg-background/80 backdrop-blur-md border border-border shadow-sm' : 'top-0 bg-background'
    }`}>
      <SidebarTrigger className="-ml-2" />
      <Separator orientation="vertical" className="h-6" />

      <div className="hidden sm:block flex-1">
        <h1 className="text-lg font-semibold text-foreground">Xin chào, {seller?.store_name || 'Seller'}! </h1>
        <p className="text-sm text-muted-foreground">Đây là tổng quan cửa hàng của bạn</p>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <ThemeToggle />
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium">{seller?.store_name || 'Store'}</div>
            <div className="text-xs text-muted-foreground">Seller Account</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black font-bold text-white dark:bg-white dark:text-black uppercase">
            {seller?.store_name?.charAt(0) || 'S'}
          </div>
        </div>
      </div>
    </header>
  );
}
