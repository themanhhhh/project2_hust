'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  AuthUser,
  LoginData,
  RegisterData,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  getStoredUser,
  getCurrentUser,
  isAuthenticated as checkAuth,
} from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<{ success: boolean; message?: string; user?: AuthUser }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string; user?: AuthUser }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      // First try to get user from localStorage for instant UI
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }

      // Then verify with server
      if (checkAuth()) {
        const serverUser = await getCurrentUser();
        if (serverUser) {
          setUser(serverUser);
        } else {
          // Token invalid, clear user
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (data: LoginData) => {
    setLoading(true);
    try {
      const result = await authLogin(data);
      if (result.success && result.data) {
        setUser(result.data.user);
        return { success: result.success, message: result.message, user: result.data.user };
      }
      return { success: result.success, message: result.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    try {
      const result = await authRegister(data);
      if (result.success && result.data) {
        setUser(result.data.user);
      }
      return { success: result.success, message: result.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const serverUser = await getCurrentUser();
    if (serverUser) {
      setUser(serverUser);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
