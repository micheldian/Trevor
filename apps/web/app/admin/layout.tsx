import { ReactNode } from 'react';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { AdminLayoutContent } from '@/components/admin/AdminLayoutContent';

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
 * - Authentication provider
 * - Responsive sidebar navigation
 * - Header with user info
 * - Main content area
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}
