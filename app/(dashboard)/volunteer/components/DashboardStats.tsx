'use client'

import React from 'react'
import StatsVisualization from '@/components/three/StatsVisualization'

interface DashboardStatsProps {
  data: number[]
  title: string
  description?: string
}

export default function DashboardStats({ data, title, description }: DashboardStatsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-center h-48">
        <StatsVisualization data={data} />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-gray-900">{data[0]}</p>
          <p className="text-sm text-gray-600">This Week</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{data[1]}</p>
          <p className="text-sm text-gray-600">Last Week</p>
        </div>
      </div>
    </div>
  )
}