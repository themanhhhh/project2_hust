import type { MetadataRoute } from 'next';
import type { Post, Product } from './types';

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  pagination?: unknown;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

async function fetchPublicApi<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return null;

    const json = (await response.json()) as ApiEnvelope<T> | T;
    if (json && typeof json === 'object' && 'data' in json) {
      return (json as ApiEnvelope<T>).data ?? null;
    }

    return json as T;
  } catch {
    return null;
  }
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function stripHtml(value?: string) {
  return (value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateDescription(value: string, length = 160) {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 1).trim()}…`;
}

export function getProductImage(product: Product) {
  return product.product_images?.[0]?.image_url || product.images?.[0]?.url || product.images?.[0]?.image_url;
}

export async function getProductForSeo(idOrSlug: string) {
  return fetchPublicApi<Product>(`/products/${encodeURIComponent(idOrSlug)}`);
}

export async function getPostForSeo(slug: string) {
  return fetchPublicApi<Post>(`/posts/slug/${encodeURIComponent(slug)}`);
}

export async function getProductsForSitemap(): Promise<Product[]> {
  return (await fetchPublicApi<Product[]>('/products?limit=1000')) || [];
}

export async function getPostsForSitemap(): Promise<Post[]> {
  const response = await fetchPublicApi<{ data?: Post[] } | Post[]>('/posts/published?page=1&limit=1000');
  if (Array.isArray(response)) return response;
  return response?.data || [];
}

export function sitemapEntry(url: string, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'], priority: number) {
  return {
    url: absoluteUrl(url),
    lastModified: new Date(),
    changeFrequency,
    priority,
  };
}
