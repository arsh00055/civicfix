'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'
  const isRegisterPage = pathname === '/register'

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col">
        {children}
      </div>
      
      <footer className="py-4 px-6 text-center text-gray-500 text-sm border-t border-gray-100">
        <p>© {new Date().getFullYear()} CivicFix. All rights reserved.</p>
        {isLoginPage && (
          <p className="mt-2">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign up here
            </a>
          </p>
        )}
        {isRegisterPage && (
          <p className="mt-2">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign in here
            </a>
          </p>
        )}
      </footer>
    </div>
  )
}