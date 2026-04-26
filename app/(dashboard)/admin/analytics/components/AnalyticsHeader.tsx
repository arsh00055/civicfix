'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChartBarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'

interface AnalyticsHeaderProps {
  timeRange: 'week' | 'month' | 'year'
  onTimeRangeChange: (range: 'week' | 'month' | 'year') => void
  onExport?: (format: 'csv' | 'json' | 'pdf') => void
}

export default function AnalyticsHeader({ timeRange, onTimeRangeChange, onExport }: AnalyticsHeaderProps) {
  const [showExportMenu, setShowExportMenu] = React.useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8"
    >
      <div className="flex flex-col gap-4">
        {/* Title Row */}
        <div className="flex items-center space-x-3">
          <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
            <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 text-sm mt-0.5">
              Monitor platform performance and community engagement
            </p>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === 'week' ? 'Week' : range === 'month' ? 'Month' : 'Year'}
            </button>
          ))}

          {onExport && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm"
              >
                <DocumentArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Export</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {(['csv', 'json', 'pdf'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => {
                        onExport(format)
                        setShowExportMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Export as {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}