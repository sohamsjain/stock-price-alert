'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const AuthGuard = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/signin' 
}: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Store the attempted URL to redirect back after login
        sessionStorage.setItem('redirectAfterLogin', pathname);
        router.push(redirectTo);
      } else if (!requireAuth && isAuthenticated) {
        // If user is authenticated and trying to access auth pages, redirect to alerts
        router.push('/alerts');
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router, pathname, redirectTo]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show children if auth requirements are met
  if ((requireAuth && isAuthenticated) || (!requireAuth && !isAuthenticated)) {
    return <>{children}</>;
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
};