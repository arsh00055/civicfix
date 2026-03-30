'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export default function SupportCTA() {
  const router = useRouter()

  const handleContactSupport = () => {
    router.push('/help#contact')
  }

  const handleScheduleCall = () => {
    // Implement schedule call logic - pending
    console.log('Schedule a call')
  }

  return (
    <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 mb-5 text-center text-white">
      <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
      <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
        Our dedicated support team is here to assist you with any questions or issues you might have.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleContactSupport}
          className="bg-white text-blue-600 py-3 px-8 rounded-lg cursor-pointer hover:bg-blue-600 hover:border hover:border-white hover:text-white hover:bg-blue-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
        >
          Contact Support
        </button>
        <button
          onClick={handleScheduleCall}
          className="border border-white text-white py-3 px-8 rounded-lg hover:bg-white hover:text-blue-500 cursor-pointer hover:bg-opacity-10 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
        >
          Schedule a Call
        </button>
      </div>
    </div>
  )
}