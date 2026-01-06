'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import PageLoader from '@/components/loading/PageLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login',
  requireAuth = true,
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      const currentPath = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Preserve the current path for redirect back after login
      if (currentPath !== '/login') {
        searchParams.set('redirect', currentPath);
      }
      
      router.push(`${redirectTo}?${searchParams.toString()}`);
    }
  }, [isAuthenticated, isLoading, requireAuth, router, redirectTo]);

  if (isLoading) {
    return <PageLoader message="Checking authentication..." />;
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <PageLoader message="Redirecting to login..." />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;