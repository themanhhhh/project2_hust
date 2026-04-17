import { Product as ApiProduct } from './types';

// Display product interface matching what components expect
export interface DisplayProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  badge?: 'hot' | 'new' | 'sale';
  inStock: boolean;
}

// Map API badge to display badge
function mapBadge(badge?: string): 'hot' | 'new' | 'sale' | undefined {
  if (!badge || badge === 'none') return undefined;
  if (badge === 'bestseller') return 'hot';
  if (badge === 'new') return 'new';
  if (badge === 'sale') return 'sale';
  return undefined;
}

// Transform API Product to display format for components
export function mapProductForDisplay(product: ApiProduct): DisplayProduct {
  // Handle both camelCase and snake_case from API
  const stock = product.stock ?? product.stock_quantity ?? 0;
  // Support both originalPrice (camelCase) and original_price (snake_case)
  const origPrice = product.originalPrice ?? product.original_price;
  
  // Get image from product_images (snake_case from API) or images (camelCase)
  const rawImages = product.product_images || product.images || [];
  // Filter out deleted images
  const images = rawImages.filter(img => !img.is_delete);
  let imageUrl = '';
  
  console.log('[DEBUG] Product:', product.name, 'Raw images:', rawImages.length, 'Filtered:', images.length);
  
  if (images.length > 0) {
    // Find primary image first, otherwise use first image
    const primaryImage = images.find(img => img.is_primary || img.isPrimary);
    const firstImage = primaryImage || images[0];
    const url = firstImage.image_url || firstImage.url || '';
    console.log('[DEBUG] First image URL:', url);
    // Accept both full URLs (http/https) and relative paths (/products/...)
    if (url.startsWith('http') || url.startsWith('/')) {
      imageUrl = url;
    }
  }
  
  // If no image found, use placeholder based on category
  if (!imageUrl) {
    const categorySlug = product.category?.slug || '';
    if (categorySlug.includes('vot') || categorySlug.includes('racket')) {
      imageUrl = '/img/racketcate.jpg';
    } else if (categorySlug.includes('giay') || categorySlug.includes('shoes') || categorySlug.includes('footwear')) {
      imageUrl = '/img/footwearercate.jpg';
    } else if (categorySlug.includes('phu-kien') || categorySlug.includes('accessories')) {
      imageUrl = '/img/accessoriescate.png';
    }
  }
  
  return {
    id: product.id,
    name: product.name,
    brand: product.brand?.name || '',
    price: Number(product.price),
    originalPrice: origPrice ? Number(origPrice) : undefined,
    image: imageUrl,
    category: product.category?.slug || 'racket',
    rating: Number(product.rating) || 4.5,
    reviews: 0,
    badge: mapBadge(product.badge),
    inStock: stock > 0,
  };
}

// Map array of products
export function mapProductsForDisplay(products: ApiProduct[]): DisplayProduct[] {
  // Defensive check: return empty array if products is not an array
  if (!Array.isArray(products)) {
    console.warn('mapProductsForDisplay: Expected array but received:', typeof products);
    return [];
  }
  return products.map(mapProductForDisplay);
}

// Format price in VND
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}
