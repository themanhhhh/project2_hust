import {
  User,
  Product,
  Category,
  Brand,
  Order,
  Cart,
  Address,
  Review,
  Campaign,
  FlashSale,
  Post,
  Shipment,
  Collection,
} from './types';
import { getToken } from './auth';
import { getSellerToken } from './seller-auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// API Response format from server
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = getToken() || getSellerToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  const json = await response.json() as ApiResponse<T>;
  
  // Extract data from API response format
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data;
  }
  
  // Fallback: return as-is if not in standard format
  return json as T;
}

// ============================================
// UPLOAD API
// ============================================
export const uploadApi = {
  // Upload image for a product - saves to database
  uploadProductImage: async (productId: string, file: File, isPrimary: boolean = false): Promise<{ url: string; id: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    if (isPrimary) {
      formData.append('is_primary', 'true');
    }

    const response = await fetch(`${API_BASE_URL}/upload/product/${productId}/image`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const json = await response.json();
    return json.data;
  },

  // Get all images for a product
  getProductImages: async (productId: string): Promise<{ id: string; url: string; is_primary: boolean }[]> => {
    return fetchApi(`/upload/product/${productId}/images`);
  },

  // Delete a product image
  deleteProductImage: async (imageId: string): Promise<void> => {
    return fetchApi(`/upload/product-image/${imageId}`, { method: 'DELETE' });
  },

  // Generic upload image (for banners, etc.)
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to upload image' }));
      throw new Error(error.message || 'Failed to upload image');
    }

    const json = await response.json();
    return json.data;
  },
};

// ============================================
// USER API
// ============================================
export const userApi = {
  getAll: async (page: number = 1, limit: number = 1000): Promise<{ data: User[]; pagination: any }> => {
    const response = await fetch(`${API_BASE_URL}/users?page=${page}&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return {
      data: json.data || [],
      pagination: json.pagination || { page, limit, total: 0, totalPages: 1 },
    };
  },
  
  getById: (id: string): Promise<User> => 
    fetchApi(`/users/${id}`),
  
  getByEmail: (email: string): Promise<User> => 
    fetchApi(`/users/email/${encodeURIComponent(email)}`),
  
  create: (data: Partial<User>): Promise<User> => 
    fetchApi('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<User>): Promise<User> => 
    fetchApi(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchApi(`/users/${id}`, { method: 'DELETE' }),
};

// ============================================
// PRODUCT API
// ============================================
export interface ProductFilters {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const productApi = {
  getAll: (limit?: number): Promise<Product[]> => 
    // Use a high limit to fetch all products (server default is 100)
    fetchApi(`/products?limit=${limit || 1000}`),
  
  getWithFilters: (filters: ProductFilters): Promise<Product[]> => {
    // Build query string from filters
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.search) params.append('search', filters.search);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    
    const queryString = params.toString();
    return fetchApi(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getByCategory: (categoryId: string): Promise<Product[]> =>
    fetchApi(`/products/category/${categoryId}`),

  getByBrand: (brandId: string): Promise<Product[]> =>
    fetchApi(`/products/brand/${brandId}`),

  getByCollection: (collectionId: string): Promise<Product[]> =>
    fetchApi(`/products/collection/${collectionId}`),

  getById: (id: string): Promise<Product> => 
    fetchApi(`/products/${id}`),
  
  getWithDetails: (id: string): Promise<Product> => 
    fetchApi(`/products/${id}/details`),
  
  getBySlug: (slug: string): Promise<Product> => 
    fetchApi(`/products/slug/${slug}`),
  
  create: (data: Partial<Product>): Promise<Product> => 
    fetchApi('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Product>): Promise<Product> => 
    fetchApi(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchApi(`/products/${id}`, { method: 'DELETE' }),
};

// ============================================
// CATEGORY API
// ============================================
export const categoryApi = {
  getAll: (): Promise<Category[]> => 
    fetchApi('/categories'),
  
  getRootCategories: (): Promise<Category[]> => 
    fetchApi('/categories/root'),
  
  getById: (id: string): Promise<Category> => 
    fetchApi(`/categories/${id}`),
  
  getBySlug: (slug: string): Promise<Category> => 
    fetchApi(`/categories/slug/${slug}`),
  
  create: (data: Partial<Category>): Promise<Category> => 
    fetchApi('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Category>): Promise<Category> => 
    fetchApi(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchApi(`/categories/${id}`, { method: 'DELETE' }),
};

// ============================================
// BRAND API
// ============================================
export const brandApi = {
  getAll: (): Promise<Brand[]> => 
    fetchApi('/brands'),
  
  getById: (id: string): Promise<Brand> => 
    fetchApi(`/brands/${id}`),
  
  getBySlug: (slug: string): Promise<Brand> => 
    fetchApi(`/brands/slug/${slug}`),
  
  create: (data: Partial<Brand>): Promise<Brand> => 
    fetchApi('/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Brand>): Promise<Brand> => 
    fetchApi(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchApi(`/brands/${id}`, { method: 'DELETE' }),
};

// ============================================
// ORDER API
// ============================================
export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  date?: string;
}

export const orderApi = {
  getWithFilters: async (filters: OrderFilters): Promise<{ data: Order[]; pagination: any }> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/orders?${params.toString()}`;
    const token = getToken();
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    };
    
    const response = await fetch(url, config);
    if (!response.ok) throw new Error('API Error');
    const json = await response.json();
    return {
      data: json.data || [],
      pagination: json.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }
    };
  },
  getAll: (): Promise<Order[]> => 
    fetchApi('/orders'),
  
  getById: (id: string): Promise<Order> => 
    fetchApi(`/orders/${id}`),
  
  getByOrderNumber: (orderNumber: string): Promise<Order> => 
    fetchApi(`/orders/number/${orderNumber}`),
  
  getByUser: (userId: string): Promise<Order[]> => 
    fetchApi(`/orders/user/${userId}`),
  
  create: (data: Partial<Order>): Promise<Order> => 
    fetchApi('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Order>): Promise<Order> => 
    fetchApi(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchApi(`/orders/${id}`, { method: 'DELETE' }),

  verifyOTP: (orderId: string, otp: string): Promise<{ success: boolean; message: string }> =>
    fetchApi(`/orders/${orderId}/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    }),

  resendOTP: (orderId: string): Promise<{ success: boolean; message: string }> =>
    fetchApi(`/orders/${orderId}/resend-otp`, {
      method: 'POST',
    }),
};

// ============================================
// FULFILLMENT API
// ============================================
export const fulfillmentApi = {
  getShipmentByOrder: (orderId: string): Promise<Shipment | null> =>
    fetchApi(`/fulfillment/order/${orderId}/shipment`),

  getShipmentsByOrder: (orderId: string): Promise<Shipment[]> =>
    fetchApi(`/fulfillment/order/${orderId}/shipments`),

  getShipmentByTracking: (trackingNumber: string): Promise<Shipment> =>
    fetchApi(`/fulfillment/tracking/${trackingNumber}`),

  createShipment: (orderId: string, data: Partial<Shipment>): Promise<Shipment> =>
    fetchApi(`/fulfillment/order/${orderId}/shipment`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  startPicking: (orderId: string): Promise<void> =>
    fetchApi(`/fulfillment/order/${orderId}/picking`, { method: 'POST' }),

  startPacking: (orderId: string): Promise<void> =>
    fetchApi(`/fulfillment/order/${orderId}/packing`, { method: 'POST' }),

  markReady: (orderId: string): Promise<void> =>
    fetchApi(`/fulfillment/order/${orderId}/ready`, { method: 'POST' }),

  inputTracking: (orderId: string, tracking_number: string, carrier: string): Promise<void> =>
    fetchApi(`/fulfillment/order/${orderId}/tracking`, {
      method: 'POST',
      body: JSON.stringify({ tracking_number, carrier }),
    }),

  handover: (orderId: string, data?: { tracking_number?: string; carrier?: string }): Promise<void> =>
    fetchApi(`/fulfillment/order/${orderId}/handover`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),

  confirmDelivery: (orderId: string): Promise<void> =>
    fetchApi(`/fulfillment/order/${orderId}/confirm-delivery`, { method: 'POST' }),

  cancelShipment: (orderId: string): Promise<void> =>
    fetchApi(`/fulfillment/order/${orderId}/cancel`, { method: 'POST' }),

  updateShipmentStatus: (orderId: string, data: Partial<Shipment> & { status: Shipment['status'] }): Promise<void> =>
    fetchApi(`/fulfillment/order/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  syncCarrierStatus: (trackingNumber: string, data: Record<string, unknown>): Promise<void> =>
    fetchApi(`/fulfillment/sync-carrier/${trackingNumber}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============================================
// CART API
// ============================================
export const cartApi = {
  getAll: (): Promise<Cart[]> => 
    fetchApi('/carts'),
  
  getById: (id: string): Promise<Cart> => 
    fetchApi(`/carts/${id}`),
  
  getByUser: (userId: string): Promise<Cart> => 
    fetchApi(`/carts/user/${userId}`),
  
  getOrCreate: (userId: string): Promise<Cart> => 
    fetchApi(`/carts/user/${userId}`, { method: 'POST' }),
  
  addItem: (cartId: string, item: { productId: string; quantity: number }): Promise<Cart> => 
    fetchApi(`/carts/${cartId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchApi(`/carts/${id}`, { method: 'DELETE' }),
};

// ============================================
// ADDRESS API
// ============================================
export const addressApi = {
  getAll: (): Promise<Address[]> => 
    fetchApi('/addresses'),
  
  getById: (id: string): Promise<Address> => 
    fetchApi(`/addresses/${id}`),
  
  getByUser: (userId: string): Promise<Address[]> => 
    fetchApi(`/addresses/user/${userId}`),
  
  getDefaultByUser: (userId: string): Promise<Address> => 
    fetchApi(`/addresses/user/${userId}/default`),
  
  create: (data: Partial<Address>): Promise<Address> => 
    fetchApi('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Address>): Promise<Address> => 
    fetchApi(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchApi(`/addresses/${id}`, { method: 'DELETE' }),
};

// ============================================
// REVIEW API
// ============================================
export const reviewApi = {
  getAll: (): Promise<Review[]> => 
    fetchApi('/reviews'),
  
  getById: (id: string): Promise<Review> => 
    fetchApi(`/reviews/${id}`),
  
  getByProduct: (productId: string): Promise<Review[]> => 
    fetchApi(`/reviews/product/${productId}`),
  
  getAverageRating: (productId: string): Promise<{ rating: number; count: number }> => 
    fetchApi(`/reviews/product/${productId}/rating`),
  
  getByUser: (userId: string): Promise<Review[]> => 
    fetchApi(`/reviews/user/${userId}`),
  
  create: (data: Partial<Review>): Promise<Review> => 
    fetchApi('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Review>): Promise<Review> => 
    fetchApi(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchApi(`/reviews/${id}`, { method: 'DELETE' }),
};

// ============================================
// CAMPAIGN API
// ============================================
export const campaignApi = {
  getAll: (): Promise<Campaign[]> => 
    fetchApi('/campaigns'),
  
  getActive: (): Promise<Campaign[]> => 
    fetchApi('/campaigns/active'),
  
  getForHomepage: (): Promise<Campaign[]> => 
    fetchApi('/campaigns/homepage'),
  
  getById: (id: string): Promise<Campaign> => 
    fetchApi(`/campaigns/${id}`),
  
  getByCode: (code: string): Promise<Campaign> => 
    fetchApi(`/campaigns/code/${code}`),
  
  validate: (code: string): Promise<{ valid: boolean; campaign?: Campaign; message?: string }> => 
    fetchApi(`/campaigns/validate/${code}`),
  
  create: (data: Partial<Campaign>): Promise<Campaign> => 
    fetchApi('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Campaign>): Promise<Campaign> => 
    fetchApi(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchApi(`/campaigns/${id}`, { method: 'DELETE' }),
};

// ============================================
// FLASH SALE API
// ============================================
export const flashSaleApi = {
  getAll: (): Promise<FlashSale[]> => 
    fetchApi('/flash-sales'),
  
  getActive: (): Promise<FlashSale[]> => 
    fetchApi('/flash-sales/active'),
  
  getById: (id: string): Promise<FlashSale> => 
    fetchApi(`/flash-sales/${id}`),
  
  getWithProducts: (id: string): Promise<FlashSale> => 
    fetchApi(`/flash-sales/${id}/products`),
  
  create: (data: Partial<FlashSale>): Promise<FlashSale> => 
    fetchApi('/flash-sales', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<FlashSale>): Promise<FlashSale> => 
    fetchApi(`/flash-sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchApi(`/flash-sales/${id}`, { method: 'DELETE' }),
};

// ============================================
// STATS API
// ============================================
export const statsApi = {
  getDashboardStats: (): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    revenueGrowth: number;
    ordersGrowth: number;
    customersGrowth: number;
    productsGrowth: number;
  }> => fetchApi('/stats/dashboard'),
};

// ============================================
// POST API
// ============================================
export const postApi = {
  getAll: async (page: number = 1, limit: number = 10): Promise<{ data: Post[]; pagination: any }> => {
    const response = await fetch(`${API_BASE_URL}/posts?page=${page}&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return {
      data: json.data || [],
      pagination: json.pagination || { page, limit, total: 0, totalPages: 1 },
    };
  },
  
  getPublished: async (page: number = 1, limit: number = 10): Promise<{ data: Post[]; pagination: any }> => {
    const response = await fetch(`${API_BASE_URL}/posts/published?page=${page}&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return {
      data: json.data || [],
      pagination: json.pagination || { page, limit, total: 0, totalPages: 1 },
    };
  },
  
  getById: (id: string): Promise<Post> => 
    fetchApi(`/posts/${id}`),
  
  getBySlug: (slug: string): Promise<Post> => 
    fetchApi(`/posts/slug/${slug}`),
  
  create: (data: Partial<Post>): Promise<Post> => 
    fetchApi('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Post>): Promise<Post> => 
    fetchApi(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchApi(`/posts/${id}`, { method: 'DELETE' }),
};

// ============================================
// COLLECTION API
// ============================================
export const collectionApi = {
  getAll: (): Promise<Collection[]> => 
    fetchApi('/collections'),
  
  getById: (id: string): Promise<Collection> => 
    fetchApi(`/collections/${id}`),
  
  getBySlug: (slug: string): Promise<Collection> => 
    fetchApi(`/collections/slug/${slug}`),
  
  create: (data: Partial<Collection>): Promise<Collection> => 
    fetchApi('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Collection>): Promise<Collection> => 
    fetchApi(`/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string): Promise<void> => 
    fetchApi(`/collections/${id}`, { method: 'DELETE' }),
};

// ============================================
// SELLER API (Seller-scoped endpoints using Seller Token)
// ============================================

async function fetchSellerApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getSellerToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const json = await response.json() as ApiResponse<T>;
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data;
  }
  return json as T;
}

export const sellerApi = {
  getProfile: (): Promise<any> => fetchSellerApi('/sellers/profile'),

  updateProfile: (data: any): Promise<any> =>
    fetchSellerApi('/sellers/profile', { method: 'PUT', body: JSON.stringify(data) }),

  getMyProducts: (sellerId: string): Promise<Product[]> =>
    fetchSellerApi(`/sellers/${sellerId}/products`),

  getMyKyb: (): Promise<any> => fetchSellerApi('/kyb/my-kyb'),

  submitKyb: (data: any): Promise<any> =>
    fetchSellerApi('/kyb/submit', { method: 'POST', body: JSON.stringify(data) }),

  getMyOrders: (filters: { page?: number; limit?: number; search?: string; status?: string; date?: string }): Promise<{ data: Order[]; pagination: any }> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    return fetchSellerApi(`/sellers/profile/orders${params.toString() ? `?${params.toString()}` : ''}`);
  },

  updateMyOrder: (orderId: string, data: Partial<Order>): Promise<Order> =>
    fetchSellerApi(`/sellers/profile/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteMyOrder: (orderId: string): Promise<void> =>
    fetchSellerApi(`/sellers/profile/orders/${orderId}`, { method: 'DELETE' }),
};

// Export all APIs as a single object for convenience
export const api = {
  users: userApi,
  products: productApi,
  categories: categoryApi,
  brands: brandApi,
  orders: orderApi,
  carts: cartApi,
  addresses: addressApi,
  reviews: reviewApi,
  campaigns: campaignApi,
  flashSales: flashSaleApi,
  stats: statsApi,
  posts: postApi,
  fulfillment: fulfillmentApi,
  collections: collectionApi,
};

export default api;
