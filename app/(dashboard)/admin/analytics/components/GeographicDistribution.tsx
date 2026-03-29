// app/admin/analytics/components/GeographicDistribution.tsx
'use client'

import React from 'react'
import { MapPinIcon } from '@heroicons/react/24/outline'

interface GeographicDistributionProps {
  byCity: { city: string; count: number; latitude: number; longitude: number }[]
  byState: { state: string; count: number }[]
}

export default function GeographicDistribution({ byCity, byState }: GeographicDistributionProps) {
  const topStates = byState.slice(0, 10)
  const topCities = byCity.slice(0, 10)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* By State */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPinIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Issues by State</h3>
        </div>
        <div className="space-y-3">
          {topStates.map(state => (
            <div key={state.state} className="flex justify-between items-center">
              <span className="text-gray-700">{state.state || 'Unknown'}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 rounded-full h-2"
                    style={{ width: `${(state.count / (topStates[0]?.count || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">{state.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By City */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPinIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Top Cities</h3>
        </div>
        <div className="space-y-3">
          {topCities.map(city => (
            <div key={city.city} className="flex justify-between items-center">
              <span className="text-gray-700">{city.city}</span>
              <span className="text-sm font-medium text-gray-600">{city.count} issues</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}