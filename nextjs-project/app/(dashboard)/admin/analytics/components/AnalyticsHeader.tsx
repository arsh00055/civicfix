'use client'

import React from 'react'
import { ChartBarIcon } from '@/components/ui/icons' // Updated path

type TimeRange = 'week' | 'month' | 'year'

interface AnalyticsHeaderProps {
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
}

export default function AnalyticsHeader({ timeRange, onTimeRangeChange }: AnalyticsHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <ChartBarIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Comprehensive overview of platform performance and user activity
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="timeRange" className="text-sm font-medium text-gray-700">
            Time Range:
          </label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            aria-label="Select time range for analytics"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>
    </div>
  )
}