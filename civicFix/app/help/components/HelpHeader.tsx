'use client'

import React from 'react'
import { LifebuoyIcon } from '@heroicons/react/24/outline'

export default function HelpHeader() {
  return (
    <div className="text-center mb-12">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
          <LifebuoyIcon className="w-8 h-8 text-white" aria-hidden="true" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Help & Support</h1>
      <p className="text-[15px] text-gray-600 max-w-2xl mx-auto">
        Get help, find answers, and learn how to make the most of CivicFix
      </p>
    </div>
  )
}