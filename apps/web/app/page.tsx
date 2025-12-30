'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const profile = apiClient.getUserProfile();
    const token = apiClient.getToken();

    if (token && profile) {
      // Redirect based on profile type
      if (profile.type === 'employer') {
        router.push('/dashboard');
      } else {
        // Workers go to jobs list
        router.push('/jobs');
      }
    } else {
      // No auth, go to login
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}
