import type { MetadataRoute } from 'next';
import { getPostsForSitemap, getProductsForSitemap, sitemapEntry, SITE_URL } from '@/lib/server-seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    getProductsForSitemap(),
    getPostsForSitemap(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    sitemapEntry('/', 'daily', 1),
    sitemapEntry('/products', 'daily', 0.9),
    sitemapEntry('/blog', 'weekly', 0.8),
    sitemapEntry('/about', 'monthly', 0.5),
    sitemapEntry('/contact', 'monthly', 0.5),
    sitemapEntry('/faq', 'monthly', 0.5),
    sitemapEntry('/policy', 'monthly', 0.4),
    sitemapEntry('/yonex', 'weekly', 0.7),
  ];

  const productRoutes: MetadataRoute.Sitemap = products
    .filter((product) => product.id && (product.is_active ?? product.isActive ?? true))
    .map((product) => ({
      url: `${SITE_URL}/products/${product.id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const postRoutes: MetadataRoute.Sitemap = posts
    .filter((post) => post.slug)
    .map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  return [...staticRoutes, ...productRoutes, ...postRoutes];
}
