'use client'

import React from 'react'

interface LoginFormContainerProps {
  onBack: () => void
  form: React.ReactNode
}

export default function LoginFormContainer({ onBack, form }: LoginFormContainerProps) {
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onBack()
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <button
        onClick={handleBackClick}
        className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-gray-800 mb-6 transition-all duration-200 hover:translate-x-1 group"
        aria-label="Back to role selection"
      >
        <svg 
          className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
        Back to role selection
      </button>
      {form}
    </div>
  )
}