'use client'

import React from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

interface RegistrationSuccessProps {
  email: string
  onContinue: () => void
}

export default function RegistrationSuccess({ 
  email, 
  onContinue 
}: RegistrationSuccessProps) {
  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault()
    onContinue()
  }

  return (
    <div className="text-center py-8">
      <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" aria-hidden="true" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Registration Successful!
      </h2>
      <p className="text-gray-600 mb-4">
        We&apos;ve sent a verification email to <strong>{email}</strong>.
        Please check your inbox and verify your email address to continue.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6" role="note">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> If you don&apos;t see the email, check your spam folder.
        </p>
      </div>
      <button
        onClick={handleContinue}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        aria-label="Continue to login page"
      >
        Continue to Login
      </button>
    </div>
  )
}