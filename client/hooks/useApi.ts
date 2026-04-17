'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  userApi,
  productApi,
  categoryApi,
  brandApi,
  orderApi,
  cartApi,
  addressApi,
  reviewApi,
  campaignApi,
  flashSaleApi,
  statsApi,
  postApi,
  fulfillmentApi,
  collectionApi,
} from '@/lib/api';
import type {
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
} from '@/lib/types';

// Generic hook state type
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Generic hook for API calls
export function useApi<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = []
): UseApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchFn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

// ============================================
// PRODUCT HOOKS
// ============================================
export function useProducts(limit?: number) {
  return useApi<Product[]>(() => productApi.getAll(limit));
}

export function useProductsByCollection(collectionId: string) {
  return useApi<Product[]>(() => {
    if (!collectionId) {
      return Promise.resolve([]);
    }
    return productApi.getByCollection(collectionId);
  }, [collectionId]);
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  search?: string;
}

export function useProductsWithFilters(filters: ProductFilters & { _pending?: boolean }) {
  const filterKey = JSON.stringify(filters);
  return useApi<Product[]>(
    () => {
      // Don't fetch if we're still waiting for category/brand to resolve
      if (filters._pending) {
        return Promise.resolve([]);
      }
      // Use specific endpoints if only one filter is set
      if (filters.category && !filters.brand && !filters.search) {
        return productApi.getByCategory(filters.category);
      }
      if (filters.brand && !filters.category && !filters.search) {
        return productApi.getByBrand(filters.brand);
      }
      // Otherwise get all and filter will be client-side for now
      return productApi.getAll();
    },
    [filterKey]
  );
}

export function useProduct(id: string) {
  return useApi<Product>(() => productApi.getById(id), [id]);
}

export function useProductWithDetails(id: string) {
  return useApi<Product>(() => productApi.getWithDetails(id), [id]);
}

export function useProductBySlug(slug: string) {
  return useApi<Product>(() => productApi.getBySlug(slug), [slug]);
}

export function useProductsByCategory(categoryId: string) {
  return useApi<Product[]>(() => productApi.getByCategory(categoryId), [categoryId]);
}

export function useProductsByBrand(brandId: string) {
  return useApi<Product[]>(() => productApi.getByBrand(brandId), [brandId]);
}

// ============================================
// CATEGORY HOOKS
// ============================================
export function useCategories() {
  return useApi<Category[]>(() => categoryApi.getAll());
}

export function useRootCategories() {
  return useApi<Category[]>(() => categoryApi.getRootCategories());
}

export function useCategory(id: string) {
  return useApi<Category>(() => categoryApi.getById(id), [id]);
}

export function useCategoryBySlug(slug: string) {
  return useApi<Category>(() => categoryApi.getBySlug(slug), [slug]);
}

// ============================================
// BRAND HOOKS
// ============================================
export function useBrands() {
  return useApi<Brand[]>(() => brandApi.getAll());
}

export function useBrand(id: string) {
  return useApi<Brand>(() => brandApi.getById(id), [id]);
}

export function useBrandBySlug(slug: string) {
  return useApi<Brand>(() => brandApi.getBySlug(slug), [slug]);
}

// ============================================
// USER HOOKS
// ============================================
export function useUsers(page: number = 1, limit: number = 1000) {
  return useApi<{ data: User[]; pagination: any }>(() => userApi.getAll(page, limit), [page, limit]);
}

export function useUser(id: string) {
  return useApi<User>(() => userApi.getById(id), [id]);
}

// ============================================
// ORDER HOOKS
// ============================================
export function useOrders() {
  return useApi<Order[]>(() => orderApi.getAll());
}

export function useOrdersWithFilters(filters: any) {
  const filterKey = JSON.stringify(filters);
  return useApi<{ data: Order[]; pagination: any }>(() => orderApi.getWithFilters(filters), [filterKey]);
}

export function useOrder(id: string) {
  return useApi<Order>(() => orderApi.getById(id), [id]);
}

export function useOrderByNumber(orderNumber: string) {
  return useApi<Order>(() => orderApi.getByOrderNumber(orderNumber), [orderNumber]);
}


export function useUserOrders(userId: string) {
  return useApi<Order[]>(() => orderApi.getByUser(userId), [userId]);
}

export function useShipmentByOrder(orderId: string) {
  return useApi<Shipment | null>(() => {
    if (!orderId) return Promise.resolve(null);
    return fulfillmentApi.getShipmentByOrder(orderId);
  }, [orderId]);
}

export function useShipmentsByOrder(orderId: string) {
  return useApi<Shipment[]>(() => {
    if (!orderId) return Promise.resolve([]);
    return fulfillmentApi.getShipmentsByOrder(orderId);
  }, [orderId]);
}

export function useShipmentByTracking(trackingNumber: string) {
  return useApi<Shipment>(() => fulfillmentApi.getShipmentByTracking(trackingNumber), [trackingNumber]);
}

// ============================================
// CART HOOKS
// ============================================
export function useCart(id: string) {
  return useApi<Cart>(() => cartApi.getById(id), [id]);
}

export function useUserCart(userId: string) {
  return useApi<Cart>(() => cartApi.getByUser(userId), [userId]);
}

// ============================================
// ADDRESS HOOKS
// ============================================
export function useAddresses() {
  return useApi<Address[]>(() => addressApi.getAll());
}

export function useAddress(id: string) {
  return useApi<Address>(() => addressApi.getById(id), [id]);
}

export function useUserAddresses(userId: string) {
  return useApi<Address[]>(() => addressApi.getByUser(userId), [userId]);
}

export function useDefaultAddress(userId: string) {
  return useApi<Address>(() => addressApi.getDefaultByUser(userId), [userId]);
}

// ============================================
// REVIEW HOOKS
// ============================================
export function useReviews() {
  return useApi<Review[]>(() => reviewApi.getAll());
}

export function useProductReviews(productId: string) {
  return useApi<Review[]>(() => reviewApi.getByProduct(productId), [productId]);
}

export function useProductRating(productId: string) {
  return useApi<{ rating: number; count: number }>(
    () => reviewApi.getAverageRating(productId),
    [productId]
  );
}

export function useUserReviews(userId: string) {
  return useApi<Review[]>(() => reviewApi.getByUser(userId), [userId]);
}

// ============================================
// CAMPAIGN HOOKS
// ============================================
export function useCampaigns() {
  return useApi<Campaign[]>(() => campaignApi.getAll());
}

export function useActiveCampaigns() {
  return useApi<Campaign[]>(() => campaignApi.getActive());
}

export function useHomepageCampaigns() {
  return useApi<Campaign[]>(() => campaignApi.getForHomepage());
}

export function useCampaign(id: string) {
  return useApi<Campaign>(() => campaignApi.getById(id), [id]);
}

// ============================================
// FLASH SALE HOOKS
// ============================================
export function useFlashSales() {
  return useApi<FlashSale[]>(() => flashSaleApi.getAll());
}

export function useActiveFlashSales() {
  return useApi<FlashSale[]>(() => flashSaleApi.getActive());
}

export function useFlashSale(id: string) {
  return useApi<FlashSale>(() => flashSaleApi.getById(id), [id]);
}

export function useFlashSaleWithProducts(id: string) {
  return useApi<FlashSale>(() => flashSaleApi.getWithProducts(id), [id]);
}

// ============================================
// STATS HOOKS
// ============================================
export function useDashboardStats() {
  return useApi<{
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    revenueGrowth: number;
    ordersGrowth: number;
    customersGrowth: number;
    productsGrowth: number;
  }>(() => statsApi.getDashboardStats());
}

// ============================================
// POST HOOKS
// ============================================
export function usePosts(page: number = 1, limit: number = 10) {
  return useApi<{ data: Post[]; pagination: any }>(() => postApi.getAll(page, limit), [page, limit]);
}

export function usePublishedPosts(page: number = 1, limit: number = 10) {
  return useApi<{ data: Post[]; pagination: any }>(() => postApi.getPublished(page, limit), [page, limit]);
}

export function usePost(id: string) {
  return useApi<Post>(() => postApi.getById(id), [id]);
}

export function usePostBySlug(slug: string) {
  return useApi<Post>(() => postApi.getBySlug(slug), [slug]);
}

// ============================================
// COLLECTION HOOKS
// ============================================
export function useCollections() {
  return useApi<Collection[]>(() => collectionApi.getAll());
}

// ============================================
// SELLER-SCOPED HOOKS (dùng seller token riêng)
// ============================================
import { sellerApi } from '@/lib/api';

export function useSellerProducts(sellerId: string) {
  return useApi<Product[]>(() => {
    if (!sellerId) return Promise.resolve([]);
    return sellerApi.getMyProducts(sellerId);
  }, [sellerId]);
}

export function useSellerOrders(filters: { page?: number; limit?: number; search?: string; status?: string; date?: string }) {
  const filterKey = JSON.stringify(filters);
  return useApi<{ data: Order[]; pagination: any }>(
    () => sellerApi.getMyOrders(filters),
    [filterKey]
  );
}

export function useSellerProfile() {
  return useApi<any>(() => sellerApi.getProfile());
}

export function useSellerKyb() {
  return useApi<any>(() => sellerApi.getMyKyb());
}
