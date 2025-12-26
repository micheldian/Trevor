/**
 * Admin API Client
 *
 * Client for making authenticated requests to admin endpoints
 */

import { tokenStorage } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Generic fetch wrapper with authentication
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Get token from auth storage
    const token = tokenStorage.getToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || 'An error occurred',
        status: response.status,
      };
    }

    return {
      data,
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
 * Admin API methods
 */
export const adminApi = {
  // Dashboard
  getStats: () => apiFetch('/admin/stats'),
  getMetrics: () => apiFetch('/admin/metrics'),

  // Users
  getUsers: () => apiFetch('/admin/users'),
  getUserById: (id: string) => apiFetch(`/admin/users/${id}`),
  updateUserRole: (id: string, role: string) =>
    apiFetch(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  deactivateUser: (id: string) =>
    apiFetch(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

  // Jobs
  getJobs: () => apiFetch('/admin/jobs'),
  getJobById: (id: string) => apiFetch(`/admin/jobs/${id}`),

  // Matches
  getMatches: () => apiFetch('/admin/matches'),
  getMatchById: (id: string) => apiFetch(`/admin/matches/${id}`),

  // Reviews
  getReviews: () => apiFetch('/admin/reviews'),
  deleteReview: (id: string, reason: string) =>
    apiFetch(`/admin/reviews/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    }),

  // Audit Logs
  getAuditLogs: (params?: {
    limit?: number;
    action?: string;
    actorId?: string;
  }) => {
    const queryParams = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return apiFetch(`/audit-logs${queryParams ? `?${queryParams}` : ''}`);
  },
  getAuditLogsByEntity: (type: string, id: string) =>
    apiFetch(`/audit-logs/entity/${type}/${id}`),

  // Security
  getLockedIps: () => apiFetch('/admin/security/locked-ips'),
  getIpStats: (ip: string) => apiFetch(`/admin/security/ips/${ip}/stats`),
  unlockIp: (ip: string) =>
    apiFetch(`/admin/security/ips/${ip}/unlock`, {
      method: 'POST',
    }),
};

/**
 * Helper to handle API responses in components
 */
export function useApiResponse<T>(response: ApiResponse<T>) {
  if (response.error) {
    console.error('API Error:', response.error);
    return null;
  }
  return response.data;
}
