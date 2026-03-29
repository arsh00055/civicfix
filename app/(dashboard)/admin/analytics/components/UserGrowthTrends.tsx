'use client'

import React from 'react'
import { UserIcon } from '@heroicons/react/24/outline'

interface UserGrowthTrendProps {
  userGrowth: { date: string; count: number }[]
  timeRange: 'week' | 'month' | 'year'
}

export default function UserGrowthTrend({ userGrowth, timeRange }: UserGrowthTrendProps) {
  const maxCount = Math.max(...userGrowth.map(u => u.count), 1)
  const formatDate = (date: string) => {
    const d = new Date(date)
    if (timeRange === 'year') {
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <UserIcon className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">User Growth Trend</h3>
      </div>
      
      {userGrowth.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No user growth data available for this period
        </div>
      ) : (
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between gap-2">
            {userGrowth.map((item, index) => {
              const height = (item.count / maxCount) * 100
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full max-w-[40px] bg-blue-600 rounded-t-lg transition-all duration-500 hover:bg-blue-700"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                    {formatDate(item.date)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Total new users: {userGrowth.reduce((sum, u) => sum + u.count, 0)}</span>
          <span>Peak day: {Math.max(...userGrowth.map(u => u.count), 0)} users</span>
        </div>
      </div>
    </div>
  )
}