import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const metadata = {
  title: 'Admin Console - Trevor',
  description: 'Trevor platform administration console',
};

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Admin Layout
 *
 * Main layout for admin console with:
 * - Responsive sidebar navigation
 * - Header with user info
 * - Main content area
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Header */}
        <AdminHeader />

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
