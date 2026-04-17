'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  AuthSeller,
  SellerLoginData,
  SellerRegisterData,
  loginSeller,
  registerSeller,
  logoutSeller as authLogoutSeller,
  getStoredSeller,
  getCurrentSeller,
  isSellerAuthenticated,
} from '@/lib/seller-auth';

interface SellerAuthContextType {
  seller: AuthSeller | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: SellerLoginData) => Promise<{ success: boolean; message?: string; seller?: AuthSeller }>;
  register: (data: SellerRegisterData) => Promise<{ success: boolean; message?: string; seller?: AuthSeller }>;
  logout: () => void;
  refreshSeller: () => Promise<void>;
}

const SellerAuthContext = createContext<SellerAuthContextType | undefined>(undefined);

export function SellerAuthProvider({ children }: { children: ReactNode }) {
  const [seller, setSeller] = useState<AuthSeller | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedSeller = getStoredSeller();
      if (storedSeller) setSeller(storedSeller);

      if (isSellerAuthenticated()) {
        const serverSeller = await getCurrentSeller();
        if (serverSeller) setSeller(serverSeller);
        else setSeller(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (data: SellerLoginData) => {
    setLoading(true);
    try {
      const result = await loginSeller(data);
      if (result.success && result.data) {
        setSeller(result.data.seller);
        return { success: result.success, message: result.message, seller: result.data.seller };
      }
      return { success: result.success, message: result.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: SellerRegisterData) => {
    setLoading(true);
    try {
      const result = await registerSeller(data);
      return { success: result.success, message: result.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authLogoutSeller();
    setSeller(null);
  }, []);

  const refreshSeller = useCallback(async () => {
    const serverSeller = await getCurrentSeller();
    if (serverSeller) setSeller(serverSeller);
  }, []);

  const value = {
    seller,
    loading,
    isAuthenticated: !!seller,
    login,
    register,
    logout,
    refreshSeller,
  };

  return <SellerAuthContext.Provider value={value}>{children}</SellerAuthContext.Provider>;
}

export function useSellerAuth() {
  const context = useContext(SellerAuthContext);
  if (context === undefined) {
    throw new Error('useSellerAuth must be used within a SellerAuthProvider');
  }
  return context;
}
