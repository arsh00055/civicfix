'use client'

import React from 'react'
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function QuickActions() {
  const contactOptions = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: ChatBubbleLeftRightIcon,
      availability: 'Available 24/7',
      action: 'Start Chat',
      color: 'bg-green-500'
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: EnvelopeIcon,
      availability: 'Response within 24 hours',
      action: 'Send Email',
      color: 'bg-blue-500'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our team',
      icon: PhoneIcon,
      availability: 'Mon-Fri, 9AM-6PM',
      action: 'Call Now',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {contactOptions.map((option, index) => (
        <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-shadow">
          <div className={`w-12 h-12 ${option.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
            <option.icon className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-2">{option.title}</h3>
          <p className="text-gray-600 mb-3 text-[14px]">{option.description}</p>
          <div className="flex items-center justify-center text-[13px] text-gray-500 mb-4">
            <ClockIcon className="w-4 h-4 mr-1" aria-hidden="true" />
            {option.availability}
          </div>
          <button className="w-full bg-blue-600 cursor-pointer text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium click:bg-white click:border click:border-white click:text-blue-600">
            {option.action}
          </button>
        </div>
      ))}
    </div>
  )
}