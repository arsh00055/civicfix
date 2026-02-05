'use client'

import React from 'react'
import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <div className="text-9xl font-bold text-red-100">500</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">⚠️</div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong!</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium mb-2">Error details:</p>
          <p className="text-red-700 text-sm font-mono break-words">
            {error.message || 'An unexpected error occurred'}
          </p>
          {error.digest && (
            <p className="text-red-600 text-xs mt-2">Error ID: {error.digest}</p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go Home
          </Link>
        </div>
        
        <div className="text-sm text-gray-500 space-y-2">
          <p>If the problem persists, please contact support.</p>
          <p>
            <Link href="/help" className="text-blue-600 hover:text-blue-500 font-medium">
              Get help →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}