'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  tokenStorage,
  userStorage,
  validateAdminAuth,
  AdminUser,
  AuthTokens,
} from '@/lib/auth';
import {
  requestAdminOtp,
  verifyAdminOtp,
  refreshToken as refreshTokenApi,
  logout as logoutApi,
} from '@/lib/auth-api';

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestOtp: (phoneOrEmail: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (
    phoneOrEmail: string,
    otp: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

/**
 * Admin Auth Provider
 *
 * Provides authentication context for admin console
 */
export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * Initialize auth state from storage
   */
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      const validation = validateAdminAuth();

      if (validation.isValid && validation.user) {
        setUser(validation.user);
        userStorage.setUser(validation.user);
      } else {
        setUser(null);
        tokenStorage.clearTokens();
        userStorage.clearUser();
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Request OTP code
   */
  const requestOtp = async (
    phoneOrEmail: string
  ): Promise<{ success: boolean; error?: string }> => {
    const response = await requestAdminOtp(phoneOrEmail);

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true };
  };

  /**
   * Verify OTP and login
   */
  const verifyOtp = async (
    phoneOrEmail: string,
    otp: string
  ): Promise<{ success: boolean; error?: string }> => {
    const response = await verifyAdminOtp(phoneOrEmail, otp);

    if (response.error || !response.data) {
      return { success: false, error: response.error };
    }

    // Store tokens
    tokenStorage.setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });

    // Store user
    const adminUser: AdminUser = {
      id: response.data.user.id,
      email: response.data.user.email,
      phone: response.data.user.phone,
      role: 'admin',
    };
    userStorage.setUser(adminUser);
    setUser(adminUser);

    return { success: true };
  };

  /**
   * Logout
   */
  const logout = () => {
    logoutApi();
    tokenStorage.clearTokens();
    userStorage.clearUser();
    setUser(null);
    router.push('/admin/login');
  };

  /**
   * Refresh authentication
   */
  const refreshAuth = async () => {
    const refreshTokenValue = tokenStorage.getRefreshToken();

    if (!refreshTokenValue) {
      logout();
      return;
    }

    const response = await refreshTokenApi(refreshTokenValue);

    if (response.error || !response.data) {
      logout();
      return;
    }

    tokenStorage.setTokens({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    });

    const validation = validateAdminAuth();
    if (validation.isValid && validation.user) {
      setUser(validation.user);
      userStorage.setUser(validation.user);
    }
  };

  const value: AdminAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    requestOtp,
    verifyOtp,
    logout,
    refreshAuth,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

/**
 * Use Admin Auth Hook
 *
 * Access authentication context
 */
export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }

  return context;
}
