import type { Metadata } from 'next';
import { ProductDetailClient } from './ProductDetailClient';
import {
  absoluteUrl,
  getProductForSeo,
  getProductImage,
  stripHtml,
  truncateDescription,
} from '@/lib/server-seo';

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductForSeo(id);

  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm | SmashX',
      robots: { index: false, follow: false },
    };
  }

  const description = truncateDescription(
    stripHtml(product.description) || `${product.name} chính hãng tại SmashX. Xem giá, thương hiệu, tồn kho và đặt mua thiết bị cầu lông phù hợp.`
  );
  const image = getProductImage(product);

  return {
    title: `${product.name} | SmashX`,
    description,
    alternates: { canonical: absoluteUrl(`/products/${product.id}`) },
    openGraph: {
      title: product.name,
      description,
      url: absoluteUrl(`/products/${product.id}`),
      type: 'website',
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductForSeo(id);
  const image = product ? getProductImage(product) : undefined;

  const productJsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: stripHtml(product.description) || product.name,
        image: image ? [image] : undefined,
        sku: product.sku,
        brand: product.brand?.name
          ? {
              '@type': 'Brand',
              name: product.brand.name,
            }
          : undefined,
        category: product.category?.name,
        offers: {
          '@type': 'Offer',
          url: absoluteUrl(`/products/${product.id}`),
          priceCurrency: 'VND',
          price: Number(product.price || 0),
          availability: (product.stock_quantity ?? product.stock ?? 0) > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
        aggregateRating: product.rating
          ? {
              '@type': 'AggregateRating',
              ratingValue: Number(product.rating),
              reviewCount: 1,
            }
          : undefined,
      }
    : null;
  const breadcrumbJsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Trang chủ',
            item: absoluteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Sản phẩm',
            item: absoluteUrl('/products'),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: absoluteUrl(`/products/${product.id}`),
          },
        ],
      }
    : null;

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <ProductDetailClient params={Promise.resolve({ id })} />
    </>
  );
}
