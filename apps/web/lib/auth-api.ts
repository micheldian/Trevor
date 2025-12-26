/**
 * Admin Authentication API
 *
 * API methods for admin authentication using existing OTP/JWT system
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Request OTP code for admin login
 */
export async function requestAdminOtp(
  phoneOrEmail: string
): Promise<ApiResponse<{ message: string; expiresIn: number }>> {
  try {
    // Determine if it's phone or email
    const isPhone = /^\+?[0-9\s\-()]+$/.test(phoneOrEmail);

    const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        isPhone
          ? { phone: phoneOrEmail }
          : { email: phoneOrEmail }
      ),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || 'Failed to send OTP',
        status: response.status,
      };
    }

    return {
      data: {
        message: data.message || 'OTP sent successfully',
        expiresIn: data.expiresIn || 300,
      },
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 500,
    };
  }
}

/**
 * Verify OTP and login
 */
export async function verifyAdminOtp(
  phoneOrEmail: string,
  otp: string
): Promise<
  ApiResponse<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email?: string;
      phone?: string;
      role: string;
    };
  }>
> {
  try {
    // Determine if it's phone or email
    const isPhone = /^\+?[0-9\s\-()]+$/.test(phoneOrEmail);

    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        isPhone
          ? { phone: phoneOrEmail, otp }
          : { email: phoneOrEmail, otp }
      ),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || 'Invalid OTP',
        status: response.status,
      };
    }

    // Validate admin role
    if (data.user?.role !== 'admin') {
      return {
        error: 'Access denied. Admin role required.',
        status: 403,
      };
    }

    return {
      data: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      },
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 500,
    };
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(
  refreshToken: string
): Promise<
  ApiResponse<{
    accessToken: string;
    refreshToken: string;
  }>
> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || 'Failed to refresh token',
        status: response.status,
      };
    }

    return {
      data: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 500,
    };
  }
}

/**
 * Logout (no backend call needed, just clear tokens)
 */
export function logout(): void {
  // Could call backend logout endpoint if needed
  // For now, just return success (tokens cleared in context)
}
