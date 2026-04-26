'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { UserGroupIcon, WrenchScrewdriverIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

interface LoginRoleSelectorProps {
  onRoleSelect: (role: 'citizen' | 'volunteer' | 'admin') => void
}

export default function LoginRoleSelector({ onRoleSelect }: LoginRoleSelectorProps) {
  const router = useRouter()

  const roles = [
    {
      id: 'citizen' as const,
      title: 'Citizen',
      description: 'Report and track community issues',
      icon: UserGroupIcon,
      gradient: 'from-blue-500 to-cyan-500',
      features: ['Report local issues', 'Track progress', 'Community updates']
    },
    {
      id: 'volunteer' as const,
      title: 'Volunteer',
      description: 'Help resolve issues in your community',
      icon: WrenchScrewdriverIcon,
      gradient: 'from-green-500 to-emerald-500',
      features: ['Claim tasks', 'Earn recognition', 'Build skills']
    },
    {
      id: 'admin' as const,
      title: 'Administrator',
      description: 'Manage platform operations',
      icon: Cog6ToothIcon,
      gradient: 'from-purple-500 to-fuchsia-500',
      features: ['User management', 'Content moderation', 'Analytics']
    },
  ]

  const pathname = usePathname()
  const isLoginPage = pathname === '/login'
  const isRegisterPage = pathname === '/register'

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push('/register')
  }

  return (
    <div className="max-w-4xl mx-auto">
  {/* <div className="bg-white rounded-2xl p-8 pt-4 shadow-xl border border-gray-100 overflow-auto max-h-[90vh]"> */}
  <div className="bg-white rounded-2xl p-4 sm:p-8 sm:pt-4 pt-3 shadow-xl border border-gray-100 overflow-auto max-h-[90vh]">
        <div className="text-center mb-5">
          <h2 className="text-1xl font-bold text-gray-900 mb-1">
            Welcome back
          </h2>
          <p className="text-gray-800 text-md">Choose how you&apos;d like to sign in</p>
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4"> */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-4">
          {roles.map((role) => {
            const IconComponent = role.icon
            
            return (
              <button
                key={role.id}
                onClick={() => onRoleSelect(role.id)}
                className="group relative cursor-pointer text-left w-full bg-transparent border-none p-0"
                aria-label={`Sign in as ${role.title}`}
              >
                {/* <div className="relative bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:border-gray-300 h-full flex flex-col"> */}
                <div className="relative bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:border-gray-300 h-full flex flex-col">
                  
                  {/* <div className={`w-12 h-12 bg-gradient-to-r ${role.gradient} rounded-xl flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}> */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${role.gradient} rounded-xl flex items-center justify-center shadow-md mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {role.title}
                    </h3>
                    <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                      {role.description}
                    </p>
                    
                    <ul className="space-y-2">
                      {role.features.map((feature, index) => (
                        <li 
                          key={index} 
                          className="flex items-center text-xs text-gray-700"
                        >
                          <div className={`w-1.5 h-1.5 bg-gradient-to-r ${role.gradient} rounded-full mr-2`}></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm font-medium text-gray-500 group-hover:text-gray-800 transition-colors duration-300 flex items-center">
                      Continue
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
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
    </div>
  )
}