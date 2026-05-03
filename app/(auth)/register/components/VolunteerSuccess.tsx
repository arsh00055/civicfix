'use client'

import React from 'react'
import { ClockIcon } from '@heroicons/react/24/outline'

interface VolunteerSuccessProps {
  email: string
  onContinue: () => void
}

export default function VolunteerSuccess({ 
  email, 
  onContinue 
}: VolunteerSuccessProps) {
  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault()
    onContinue()
  }

  return (
    <div className="text-center py-8">
      <ClockIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" aria-hidden="true" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Application Submitted!
      </h2>
      <p className="text-gray-600 mb-4">
        Thank you for applying to be a volunteer, <strong>{email}</strong>.
      </p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6" role="note">
        <p className="text-sm text-yellow-800">
          ⏳ <strong>Your account is pending admin approval.</strong>
        </p>
        <p className="text-sm text-yellow-700 mt-2">
          You will receive an email once your application is reviewed and approved.
        </p>
      </div>
      <button
        onClick={handleContinue}
        className="w-full bg-green-600 cursor-pointer text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
        aria-label="Continue to login page"
      >
        Continue to Login
      </button>
    </div>
  )
}