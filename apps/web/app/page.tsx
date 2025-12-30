'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    const token = apiClient.getToken();

    if (!token) {
      // No auth, go to login
      router.push('/login');
      return;
    }

    try {
      // Fetch user's profiles from API
      const profiles = await apiClient.getMyProfiles();

      if (!profiles || profiles.length === 0) {
        // No profile created yet, go to role selection
        router.push('/choose-role');
        return;
      }

      // Check if user has an employer profile
      const hasEmployerProfile = profiles.some(
        (p: any) => p.type === 'employer'
      );

      // Check if user has a worker profile
      const hasWorkerProfile = profiles.some(
        (p: any) => p.type === 'worker' || p.type === 'team_lead'
      );

      if (hasEmployerProfile) {
        // User is employer, go to dashboard
        router.push('/dashboard');
      } else if (hasWorkerProfile) {
        // User is worker, go to jobs list
        router.push('/jobs');
      } else {
        // Shouldn't happen, but redirect to role selection just in case
        router.push('/choose-role');
      }
    } catch (err) {
      console.error('Error checking profiles:', err);
      // On error, redirect to role selection
      router.push('/choose-role');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}
