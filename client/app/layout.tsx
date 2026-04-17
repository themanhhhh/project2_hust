import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BadmintonPro - Cửa hàng cầu lông chính hãng",
  description: "Mua sắm vợt cầu lông, giày, phụ kiện cầu lông chính hãng từ các thương hiệu hàng đầu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster
              position="top-right"
              closeButton
              toastOptions={{
                unstyled: false,
                classNames: {
                  toast:
                    'group border border-black/10 bg-white text-black shadow-lg',
                  title: 'text-sm font-medium text-black',
                  description: 'text-sm text-black/70',
                  actionButton:
                    'bg-black text-white hover:bg-gray-800',
                  cancelButton:
                    'border border-black/10 bg-white text-black hover:bg-gray-100',
                  closeButton:
                    'border border-black/10 bg-white text-black hover:bg-gray-100',
                  success: '!border-black/10 !bg-white !text-black',
                  error: '!border-black/10 !bg-white !text-black',
                  warning: '!border-black/10 !bg-white !text-black',
                  info: '!border-black/10 !bg-white !text-black',
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
