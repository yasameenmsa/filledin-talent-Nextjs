'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardRedirect({ params }: { params: Promise<{ lang: string }> }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { lang } = use(params);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // If not logged in, redirect to login
        router.push(`/${lang}/login`);
      } else {
        // Redirect based on user role
        switch (user.role) {
          case 'jobseeker':
            router.push(`/${lang}/jobseeker`);
            break;
          case 'employer':
            router.push(`/${lang}/employer`);
            break;
          case 'admin':
            router.push(`/${lang}/admin`);
            break;
          default:
            // Default to jobseeker if role is unclear
            router.push(`/${lang}/jobseeker`);
        }
      }
    }
  }, [user, loading, router, lang]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Redirecting to your dashboard...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}