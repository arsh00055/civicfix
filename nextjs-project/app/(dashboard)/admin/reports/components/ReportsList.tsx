'use client'

import React from 'react'
import { DocumentReportIcon, DownloadIcon, CalendarIcon, RefreshIcon } from '@/components/ui/icons'

type ReportType = 'issues' | 'users' | 'performance' | 'financial' | 'system'
type ReportFormat = 'pdf' | 'csv' | 'excel'

interface Report {
  id: string
  title: string
  description: string
  type: ReportType
  format: ReportFormat
  generatedAt: string
  period: string
  downloadUrl?: string
  status?: 'generating' | 'completed' | 'failed'
  fileSize?: string
}

interface ReportsListProps {
  reports: Report[]
  onDownload: (report: Report) => void
  onRegenerate: (report: Report) => void
}

export default function ReportsList({ reports, onDownload, onRegenerate }: ReportsListProps) {
  const getReportTypeColor = (type: ReportType) => {
    switch (type) {
      case 'issues': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'users': return 'bg-green-100 text-green-800 border-green-200'
      case 'performance': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'financial': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'system': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getFormatIcon = (format: ReportFormat) => {
    switch (format) {
      case 'pdf': return '📄'
      case 'csv': return '📊'
      case 'excel': return '📈'
      default: return '📁'
    }
  }

  const getStatusBadge = (report: Report) => {
    if (report.status === 'generating') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
          Generating...
        </span>
      )
    }
    if (report.status === 'failed') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
          Failed
        </span>
      )
    }
    return null
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleDownload = (report: Report) => {
    onDownload(report)
  }

  const handleRegenerate = (report: Report) => {
    onRegenerate(report)
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="text-center py-12">
          <DocumentReportIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports generated</h3>
          <p className="text-gray-600 mb-4">
            Generate your first report using the options above.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Generated Reports</h3>
        <span className="text-sm text-gray-500">
          {reports.length} report{reports.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="divide-y divide-gray-200">
        {reports.map((report) => (
          <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{report.title}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getReportTypeColor(report.type)}`}>
                    {report.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {getFormatIcon(report.format)} {report.format.toUpperCase()}
                  </span>
                  {getStatusBadge(report)}
                </div>
                <p className="text-gray-600 mb-3">{report.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                    <span>Period: {report.period}</span>
                  </div>
                  <div>
                    Generated: {new Date(report.generatedAt).toLocaleDateString()}
                  </div>
                  {report.fileSize && (
                    <div>
                      Size: {formatFileSize(parseInt(report.fileSize))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 lg:ml-4 flex-shrink-0">
                {report.downloadUrl && report.status === 'completed' && (
                  <button
                    onClick={() => handleDownload(report)}
                    className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    aria-label={`Download ${report.title}`}
                  >
                    <DownloadIcon className="h-4 w-4" aria-hidden="true" />
                    <span>Download</span>
                  </button>
                )}
                {report.status === 'failed' && (
                  <button
                    onClick={() => handleRegenerate(report)}
                    className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    aria-label={`Regenerate ${report.title}`}
                  >
                    <RefreshIcon className="h-4 w-4" aria-hidden="true" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}