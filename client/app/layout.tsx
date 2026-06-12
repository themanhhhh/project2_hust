import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "sonner";
import "./globals.css";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
const siteUrlString = siteUrl.toString().replace(/\/$/, '');

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SmashX',
  url: siteUrlString,
  description: 'Sàn thương mại điện tử cầu lông cung cấp vợt, giày, phụ kiện và nội dung tư vấn thiết bị cho người chơi tại Việt Nam.',
  areaServed: 'VN',
  sameAs: [],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SmashX',
  url: siteUrlString,
  inLanguage: 'vi-VN',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrlString}/products?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

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
  metadataBase: siteUrl,
  title: {
    default: "SmashX - Sàn thương mại điện tử cầu lông",
    template: "%s | SmashX",
  },
  description: "Mua sắm vợt, giày, phụ kiện cầu lông chính hãng; đọc tư vấn chọn sản phẩm và theo dõi đơn hàng tại SmashX.",
  keywords: ["cầu lông", "vợt cầu lông", "giày cầu lông", "phụ kiện cầu lông", "SmashX"],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: 'SmashX',
    title: 'SmashX - Sàn thương mại điện tử cầu lông',
    description: 'Nền tảng mua sắm và tư vấn thiết bị cầu lông chính hãng cho người chơi mọi cấp độ.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SmashX - Sàn thương mại điện tử cầu lông',
    description: 'Mua sắm vợt, giày, phụ kiện cầu lông chính hãng và đọc nội dung tư vấn chuyên sâu.',
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <AuthProvider>
          <Suspense fallback={null}>
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
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
