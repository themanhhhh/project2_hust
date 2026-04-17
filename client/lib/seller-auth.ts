import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const SELLER_TOKEN_KEY = 'seller_auth_token';
const SELLER_KEY = 'seller_data';

export interface AuthSeller {
  id: string;
  email: string;
  store_name: string;
  role: 'seller';
  status: 'pending' | 'active' | 'suspended';
}

export interface SellerLoginData {
  email: string;
  password: string;
}

export interface SellerRegisterData {
  email: string;
  password: string;
  store_name: string;
  description?: string;
}

export interface SellerAuthResponse {
  success: boolean;
  message?: string;
  data?: {
    seller: AuthSeller;
    token: string;
  };
}

export function getSellerToken(): string | undefined {
  return Cookies.get(SELLER_TOKEN_KEY);
}

export function setSellerToken(token: string): void {
  Cookies.set(SELLER_TOKEN_KEY, token, { expires: 7, sameSite: 'strict' });
}

export function removeSellerToken(): void {
  Cookies.remove(SELLER_TOKEN_KEY);
}

export function getStoredSeller(): AuthSeller | null {
  if (typeof window === 'undefined') return null;
  const sellerStr = localStorage.getItem(SELLER_KEY);
  if (!sellerStr) return null;
  try {
    return JSON.parse(sellerStr);
  } catch {
    return null;
  }
}

export function setStoredSeller(seller: AuthSeller): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SELLER_KEY, JSON.stringify(seller));
}

export function removeStoredSeller(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SELLER_KEY);
}

export function isSellerAuthenticated(): boolean {
  return !!getSellerToken();
}

export async function loginSeller(data: SellerLoginData): Promise<SellerAuthResponse> {
  const response = await fetch(`${API_BASE_URL}/sellers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || 'Login failed' };
  }

  if (result.data) {
    setSellerToken(result.data.token);
    setStoredSeller(result.data.seller);
  }

  return { success: true, message: 'Login successful', data: result.data };
}

export async function registerSeller(data: SellerRegisterData): Promise<SellerAuthResponse> {
  const response = await fetch(`${API_BASE_URL}/sellers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || 'Registration failed' };
  }

  return { success: true, message: 'Registration successful', data: result.data };
}

export function logoutSeller(): void {
  removeSellerToken();
  removeStoredSeller();
}

export async function getCurrentSeller(): Promise<AuthSeller | null> {
  const token = getSellerToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/sellers/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      logoutSeller();
      return null;
    }

    const result = await response.json();
    return { ...result.data, role: 'seller' };
  } catch {
    return null;
  }
}

export async function authSellerFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getSellerToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}
