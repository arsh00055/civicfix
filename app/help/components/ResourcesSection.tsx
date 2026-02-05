'use client'

import React from 'react'
import { 
  DocumentTextIcon,
  VideoCameraIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export default function ResourcesSection() {
  const resources = [
    {
      title: 'User Guide',
      description: 'Complete guide to using CivicFix',
      icon: DocumentTextIcon,
      type: 'PDF',
      size: '2.4 MB'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      icon: VideoCameraIcon,
      type: 'Video Series',
      size: '15 videos'
    },
    {
      title: 'Community Guidelines',
      description: 'Rules and best practices',
      icon: UserGroupIcon,
      type: 'Document',
      size: '1.1 MB'
    }
  ]

  const handleDownload = (resourceTitle: string) => {
    console.log(`Downloading ${resourceTitle}`)
    // Implement download logic - pending
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource, index) => (
        <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <resource.icon className="w-6 h-6 text-blue-600" aria-hidden="true" />
          </div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-2">{resource.title}</h3>
          <p className="text-gray-600 mb-4">{resource.description}</p>
          <div className="flex items-center justify-between text-[13px] text-gray-500">
            <span>{resource.type}</span>
            <span>{resource.size}</span>
          </div>
          <button 
            onClick={() => handleDownload(resource.title)}
            className="w-full mt-4 cursor-pointer bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Download
          </button>
        </div>
      ))}
    </div>
  )
}