import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'customer';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: AuthUser;
    token: string;
  };
}

/**
 * Get stored auth token
 */
export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

/**
 * Set auth token
 */
export function setToken(token: string): void {
  // Token expires in 7 days (matching server setting)
  Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: 'strict' });
}

/**
 * Remove auth token
 */
export function removeToken(): void {
  Cookies.remove(TOKEN_KEY);
}

/**
 * Get stored user from localStorage
 */
export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Store user in localStorage
 */
export function setStoredUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Remove stored user
 */
export function removeStoredUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Login user
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: result.message || 'Login failed',
    };
  }

  // Store token and user
  if (result.data) {
    setToken(result.data.token);
    setStoredUser(result.data.user);
  }

  return {
    success: true,
    message: 'Login successful',
    data: result.data,
  };
}

/**
 * Register user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: result.message || 'Registration failed',
    };
  }

  // Store token and user
  if (result.data) {
    setToken(result.data.token);
    setStoredUser(result.data.user);
  }

  return {
    success: true,
    message: 'Registration successful',
    data: result.data,
  };
}

/**
 * Logout user
 */
export function logout(): void {
  removeToken();
  removeStoredUser();
}

/**
 * Get current user from API
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Token invalid, clear storage
      logout();
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch {
    return null;
  }
}

/**
 * Make authenticated API request
 */
export async function authFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  
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
