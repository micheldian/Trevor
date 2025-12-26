import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Admin Auth Middleware
 *
 * Protects /admin/* routes (except /admin/login)
 * Validates JWT token and admin role
 */

const ADMIN_PREFIX = '/admin';
const LOGIN_PATH = '/admin/login';

/**
 * Decode JWT token (server-side)
 */
function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();

  return currentTime >= expirationTime;
}

/**
 * Check if user has admin role
 */
function isAdmin(token: string): boolean {
  const decoded = decodeToken(token);
  return decoded?.role === 'admin';
}

/**
 * Middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only process /admin/* routes
  if (!pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.next();
  }

  // Allow login page
  if (pathname === LOGIN_PATH) {
    return NextResponse.next();
  }

  // Get token from cookie or header
  // Try cookie first (more secure)
  let token = request.cookies.get('admin_token')?.value;

  // Fallback to header if no cookie
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // No token - redirect to login
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Token expired - redirect to login
  if (isTokenExpired(token)) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set('returnUrl', pathname);
    url.searchParams.set('reason', 'expired');

    const response = NextResponse.redirect(url);
    // Clear expired token cookie
    response.cookies.delete('admin_token');
    return response;
  }

  // Not admin role - redirect to login with error
  if (!isAdmin(token)) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set('error', 'unauthorized');

    const response = NextResponse.redirect(url);
    // Clear invalid token cookie
    response.cookies.delete('admin_token');
    return response;
  }

  // Valid admin token - allow access
  return NextResponse.next();
}

/**
 * Middleware config
 *
 * Match all /admin/* routes except /admin/login
 */
export const config = {
  matcher: [
    '/admin/:path*',
    // Exclude login page from middleware
    '/((?!admin/login).*)',
  ],
};
