'use client';

import { SellerSidebar } from '@/components/seller/SellerSidebar';
import { SellerHeader } from '@/components/seller/SellerHeader';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SellerAuthProvider } from '@/contexts/SellerAuthContext';

import { usePathname } from 'next/navigation';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register');

  return (
    <ThemeProvider>
      <SellerAuthProvider>
        {isAuthPage ? (
          <main className="min-h-screen bg-background">{children}</main>
        ) : (
          <SidebarProvider>
            <SellerSidebar />
            <SidebarInset className="bg-background">
              <SellerHeader />
              <main className="flex-1 p-6">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        )}
      </SellerAuthProvider>
    </ThemeProvider>
  );
}
