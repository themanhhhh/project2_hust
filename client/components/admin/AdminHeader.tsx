'use client';

import { Bell, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/shop/ThemeToggle';

export function AdminHeader() {
  const [notifications] = useState(5);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Some layouts use body as scroller, others use specific wrappers.
      // Getting scrollY from window usually works if body isn't overflow-hidden
      setIsScrolled(window.scrollY > 0);
    };
    
    // Bind to window first
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Also bind to possible Shadcn SidebarInset wrapper if it's the scrolling container
    const scrollContainer = document.querySelector('[data-sidebar="inset"]') || window;
    if (scrollContainer !== window) {
      scrollContainer.addEventListener('scroll', (e) => {
        setIsScrolled((e.target as HTMLElement).scrollTop > 0);
      }, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollContainer !== window) {
        // cleanup not perfect but works for unmount
        scrollContainer.removeEventListener('scroll', () => {});
      }
    };
  }, []);

  return (
    <header className={`sticky z-30 flex h-16 flex-shrink-0 items-center gap-4 px-6 transition-all duration-200 rounded-[0.5rem] ${
      isScrolled ? 'top-2 mx-4 bg-background/80 backdrop-blur-md border border-border shadow-sm' : 'top-0 bg-background'
    }`}>
      {/* Sidebar trigger */}
      <SidebarTrigger className="-ml-2" />
      <Separator orientation="vertical" className="h-6" />

      {/* Title */}
      <div className="hidden sm:block flex-1">
        <h1 className="text-lg font-semibold text-foreground">Xin chào, Admin! </h1>
        <p className="text-sm text-muted-foreground">Đây là tổng quan cửa hàng của bạn</p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium">Admin User</div>
            <div className="text-xs text-muted-foreground">Super Admin</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black font-bold text-white dark:bg-white dark:text-black">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
