import { ReactNode } from 'react';

export const metadata = {
  title: 'Admin Login - Trevor',
  description: 'Secure admin console login',
};

interface LoginLayoutProps {
  children: ReactNode;
}

/**
 * Admin Login Layout
 *
 * Simple layout for login page (no sidebar)
 */
export default function LoginLayout({ children }: LoginLayoutProps) {
  return <>{children}</>;
}
