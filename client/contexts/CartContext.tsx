'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  itemCount: number;
  subtotal: number;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

// Map API cart response to CartItem[]
function mapCartItems(cart: any): CartItem[] {
  if (!cart?.cart_items) return [];
  return cart.cart_items
    .filter((item: any) => !item.is_delete)
    .map((item: any) => {
      const product = item.product || {};
      const images = product.product_images || [];
      const primaryImage = images.find((img: any) => img.is_primary) || images[0];
      const imageUrl = primaryImage?.image_url || primaryImage?.url || '/products/placeholder.jpg';

      return {
        id: item.id,
        productId: item.product_id,
        name: product.name || 'Sản phẩm',
        brand: product.brand?.name || '',
        price: Number(product.price) || 0,
        image: imageUrl,
        quantity: item.quantity,
      };
    });
}

// Helper for authenticated API calls
async function cartFetch(url: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error?.message || 'Cart API error');
  }

  return response.json();
}

export function CartProvider({ children }: CartProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState<string | null>(null);

  // Calculate derived values
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const matchCartItem = useCallback((item: CartItem, identifier: string) => {
    return item.productId === identifier || item.id === identifier;
  }, []);

  // Load cart from API on mount or when auth changes
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);

      if (isAuthenticated && user?.id) {
        try {
          const result = await cartFetch(`/carts/user/${user.id}`, { method: 'POST' });
          if (result.data) {
            setCartId(result.data.id);
            setItems(mapCartItems(result.data));
          }
        } catch (error) {
          console.warn('Failed to load cart:', error);
          setCartId(null);
          setItems([]);
        }
      } else {
        // Not authenticated — empty cart
        setCartId(null);
        setItems([]);
      }

      setLoading(false);
    };

    loadCart();
  }, [isAuthenticated, user]);

  const addToCart = useCallback(async (item: Omit<CartItem, 'id'>) => {
    if (!cartId) return;

    // Optimistic update
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, { ...item, id: `temp-${Date.now()}` }];
    });

    try {
      const result = await cartFetch(`/carts/${cartId}/items`, {
        method: 'POST',
        body: JSON.stringify({
          productId: item.productId,
          quantity: item.quantity,
        }),
      });
      // Sync with server response
      if (result.data) {
        setItems(mapCartItems(result.data));
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Revert on error — reload cart
      try {
        const result = await cartFetch(`/carts/user/${user?.id}`, { method: 'POST' });
        if (result.data) setItems(mapCartItems(result.data));
      } catch { /* ignore */ }
    }
  }, [cartId, user?.id]);

  const removeFromCart = useCallback(async (identifier: string) => {
    if (!cartId) return;

    // Optimistic update
    const previousItems = [...items];
    setItems(prev => prev.filter(i => !matchCartItem(i, identifier)));

    try {
      const result = await cartFetch(`/carts/${cartId}/items/${identifier}`, {
        method: 'DELETE',
      });
      if (result.data) {
        setItems(mapCartItems(result.data));
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      setItems(previousItems); // Revert
    }
  }, [cartId, items, matchCartItem]);

  const updateQuantity = useCallback(async (identifier: string, quantity: number) => {
    if (!cartId) return;

    if (quantity <= 0) {
      return removeFromCart(identifier);
    }

    // Optimistic update
    const previousItems = [...items];
    setItems(prev =>
      prev.map(i =>
        matchCartItem(i, identifier) ? { ...i, quantity } : i
      )
    );

    try {
      const result = await cartFetch(`/carts/${cartId}/items/${identifier}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      if (result.data) {
        setItems(mapCartItems(result.data));
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      setItems(previousItems); // Revert
    }
  }, [cartId, items, matchCartItem, removeFromCart]);

  const clearCart = useCallback(async () => {
    if (!cartId) return;

    const previousItems = [...items];
    setItems([]);

    try {
      const result = await cartFetch(`/carts/${cartId}/items`, {
        method: 'DELETE',
      });
      if (result.data) {
        setItems(mapCartItems(result.data));
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      setItems(previousItems); // Revert
    }
  }, [cartId, items]);

  const value: CartContextType = {
    items,
    loading,
    itemCount,
    subtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
