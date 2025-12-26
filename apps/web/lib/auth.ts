/**
 * Authentication Utilities
 *
 * Token management and authentication helpers for admin console
 */

const TOKEN_KEY = 'admin_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';
const USER_KEY = 'admin_user';

export interface AdminUser {
  id: string;
  email?: string;
  phone?: string;
  role: 'admin';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Token Storage
 */
export const tokenStorage = {
  /**
   * Get access token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Set tokens
   */
  setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  },

  /**
   * Remove all tokens
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

/**
 * User Storage
 */
export const userStorage = {
  /**
   * Get stored user
   */
  getUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Set user
   */
  setUser(user: AdminUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Remove user
   */
  clearUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
  },
};

/**
 * Decode JWT token
 */
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();

  return currentTime >= expirationTime;
}

/**
 * Check if user has admin role
 */
export function isAdmin(token: string): boolean {
  const decoded = decodeToken(token);
  return decoded?.role === 'admin';
}

/**
 * Get user from token
 */
export function getUserFromToken(token: string): AdminUser | null {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    id: decoded.sub,
    email: decoded.email,
    phone: decoded.phone,
    role: decoded.role,
  };
}

/**
 * Validate admin authentication
 */
export function validateAdminAuth(): {
  isValid: boolean;
  user: AdminUser | null;
  reason?: string;
} {
  const token = tokenStorage.getToken();

  if (!token) {
    return { isValid: false, user: null, reason: 'no_token' };
  }

  if (isTokenExpired(token)) {
    tokenStorage.clearTokens();
    userStorage.clearUser();
    return { isValid: false, user: null, reason: 'token_expired' };
  }

  if (!isAdmin(token)) {
    tokenStorage.clearTokens();
    userStorage.clearUser();
    return { isValid: false, user: null, reason: 'not_admin' };
  }

  const user = getUserFromToken(token);
  if (!user) {
    return { isValid: false, user: null, reason: 'invalid_token' };
  }

  return { isValid: true, user };
}
