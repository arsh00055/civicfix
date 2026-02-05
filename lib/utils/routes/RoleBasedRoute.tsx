'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import Loading from '@/app/loading';
import { USER_ROLES } from '@/lib/utils/helpers/constants';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: (typeof USER_ROLES[keyof typeof USER_ROLES])[];
  fallbackPath?: string;
  showForbidden?: boolean;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles,
  fallbackPath = '/dashboard',
  showForbidden = true,
}) => {
  const { userRole, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <Loading message="Checking permissions..." />;
  }

  if (!isAuthenticated) {
    return null; // Auth guard will handle redirect
  }

  if (
    !userRole ||
    !allowedRoles.includes(userRole as typeof USER_ROLES[keyof typeof USER_ROLES])
  ) {
    if (showForbidden) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center max-w-md mx-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.342 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              This page requires special permissions. Please contact an administrator if you believe this is an error.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = fallbackPath}
                className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/support'}
                className="w-full py-2.5 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;