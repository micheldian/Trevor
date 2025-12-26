'use client';

import { ReactNode } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Loader2 } from 'lucide-react';

interface AdminLayoutContentProps {
  children: ReactNode;
}

/**
 * Admin Layout Content
 *
 * Protected layout content that requires authentication
 */
export function AdminLayoutContent({ children }: AdminLayoutContentProps) {
  const { isAuthenticated, isLoading } = useRequireAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated (redirect happening)
  if (!isAuthenticated) {
    return null;
  }

  // Render protected admin layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Header */}
        <AdminHeader />

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
