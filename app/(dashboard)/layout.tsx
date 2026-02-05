// 'use client'

// import React, { useEffect } from 'react'
// import { usePathname, useRouter } from 'next/navigation'
// import { useAuth } from '@/features/auth/hooks/useAuth'
// import MainLayout from '@/components/layout/MainLayout'
// import Loading from '@/app/loading'

// const getDashboardPath = (role: string | null): string => {
//   switch (role) {
//     case 'admin': return '/admin'
//     case 'volunteer': return '/volunteer'
//     case 'citizen': return '/citizen'
//     default: return '/'
//   }
// }

// const getAllowedPaths = (role: string | null): string[] => {
//   const roleSpecificRoutes: Record<string, string[]> = {
//     admin: ['/admin', '/admin/users', '/admin/analytics', '/admin/reports', '/admin/settings'],
//     volunteer: ['/volunteer', '/available-tasks', '/my-assignments', '/find-tasks'],
//     citizen: ['/citizen', '/my-reports', '/achievements'],
//   }

//   const commonRoutes = ['/', '/map', '/notifications', '/profile', '/help', '/report-issue']
  
//   return [...commonRoutes, ...(roleSpecificRoutes[role || ''] || [])]
// }

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const { user, isLoading, isAuthenticated, userRole } = useAuth()
//   const router = useRouter()
//   const pathname = usePathname()

//   useEffect(() => {
//     if (!isLoading && !isAuthenticated) {
//       router.push('/login')
//       return
//     }
    
//     if (!isLoading && isAuthenticated && userRole) {
//       const currentPath = pathname
//       const allowedPaths = getAllowedPaths(userRole)
//       const mainDashboardPath = getDashboardPath(userRole)
      
//       const isPathAllowed = allowedPaths.some(path => 
//         currentPath.startsWith(path) || 
//         currentPath === '/' || 
//         currentPath === mainDashboardPath
//       )
      
//       if (!isPathAllowed) {
//         // Redirect to the correct dashboard for the user's role
//         router.push(mainDashboardPath)
//       }
//     }
//   }, [isLoading, isAuthenticated, userRole, pathname, router])

//   if (isLoading) {
//     return (
//       <div className="h-screen bg-white flex items-center justify-center">
//         <Loading />
//       </div>
//     )
//   }

//   if (!isAuthenticated) {
//     return null
//   }

//   return (
//     <MainLayout role={userRole}>
//       {children}
//     </MainLayout>
//   )
// }

'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import Loading from '@/app/loading';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Import Cookies from js-cookie instead of using global UMD
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        // Lazy-load js-cookie to avoid SSR issues
        const jsCookie = require('js-cookie');
        token = localStorage.getItem('auth_token') || jsCookie.get('auth_token');
      } catch {
        // fallback if js-cookie is unavailable
        token = localStorage.getItem('auth_token');
      }
    }

    if (!isLoading) {
      if (!isAuthenticated && !token) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (isAuthenticated && userRole) {
        // Check if user is on correct dashboard
        const rolePath = `/${userRole}`;
        if (!pathname.startsWith(rolePath) && pathname !== '/dashboard') {
          router.push(rolePath);
        }
      }
      setCheckingAuth(false);
    }
  }, [isAuthenticated, userRole, isLoading, pathname, router]);

  if (isLoading || checkingAuth) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <MainLayout role={userRole}>
      {children}
    </MainLayout>
  );
}