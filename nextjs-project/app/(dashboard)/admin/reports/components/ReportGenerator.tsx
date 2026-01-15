'use client'

import React from 'react'
import { DownloadIcon } from '@/components/ui/icons'

type ReportType = 'issues' | 'users' | 'performance' | 'financial' | 'system'
type ReportFormat = 'pdf' | 'csv' | 'excel'

interface ReportGeneratorProps {
  generating: string | null
  onGenerateReport: (type: ReportType, format: ReportFormat) => void
}

export default function ReportGenerator({ generating, onGenerateReport }: ReportGeneratorProps) {
  const reportTypes = [
    { 
      type: 'issues' as ReportType, 
      label: 'Issues Report', 
      formats: ['pdf' as ReportFormat, 'csv' as ReportFormat, 'excel' as ReportFormat] 
    },
    { 
      type: 'users' as ReportType, 
      label: 'User Report', 
      formats: ['pdf' as ReportFormat, 'csv' as ReportFormat, 'excel' as ReportFormat] 
    },
    { 
      type: 'performance' as ReportType, 
      label: 'Performance', 
      formats: ['pdf' as ReportFormat, 'excel' as ReportFormat] 
    },
    { 
      type: 'financial' as ReportType, 
      label: 'Financial', 
      formats: ['pdf' as ReportFormat, 'excel' as ReportFormat] 
    },
    { 
      type: 'system' as ReportType, 
      label: 'System Health', 
      formats: ['pdf' as ReportFormat, 'csv' as ReportFormat] 
    }
  ]

  const handleGenerateReport = (type: ReportType, format: ReportFormat) => {
    onGenerateReport(type, format)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {reportTypes.map((reportType) => (
          <div key={reportType.type} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-black mb-3">{reportType.label}</h4>
            <div className="space-y-2 text-blue-500">
              {reportType.formats.map((format) => {
                const isGenerating = generating === `${reportType.type}-${format}`
                return (
                  <button
                    key={format}
                    onClick={() => handleGenerateReport(reportType.type, format)}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 hover:bg-gray-300 cursor-pointer rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    aria-label={`Generate ${reportType.label} in ${format.toUpperCase()} format`}
                  >
                    <span className="font-medium">{format.toUpperCase()}</span>
                    {isGenerating ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" aria-hidden="true"></div>
                    ) : (
                      <DownloadIcon className="h-3 w-3 text-gray-400" aria-hidden="true" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}