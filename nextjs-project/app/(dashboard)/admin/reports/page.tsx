'use client'

import React, { useState, useEffect } from 'react'
import { apiClient } from '@/lib/services/api/client'
import ReportsHeader from './components/ReportsHeader'
import ReportGenerator from './components/ReportGenerator'
import ReportsList from './components/ReportsList'

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

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await apiClient.get('/admin/reports')
      setReports(data)
    } catch (err: any) {
      console.error('Failed to fetch reports:', err)
      setError(err.message || 'Failed to load reports. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (type: ReportType, format: ReportFormat) => {
    const reportId = `${type}-${format}-${Date.now()}`
    setGenerating(reportId)
    setError(null)

    try {
      const data = await apiClient.get('/analytics/export', {
        params: { format }
      })

      const newReport: Report = {
        id: reportId,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        description: getReportDescription(type),
        type,
        format,
        generatedAt: new Date().toISOString(),
        period: getReportPeriod(),
        downloadUrl: data.downloadUrl,
        status: 'completed',
        fileSize: data.fileSize
      }

      setReports(prev => [newReport, ...prev])
    } catch (err: any) {
      console.error('Failed to generate report:', err)
      setError(`Failed to generate ${type} report. Please try again.`)
      
      const failedReport: Report = {
        id: reportId,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        description: getReportDescription(type),
        type,
        format,
        generatedAt: new Date().toISOString(),
        period: getReportPeriod(),
        status: 'failed'
      }
      
      setReports(prev => [failedReport, ...prev])
    } finally {
      setGenerating(null)
    }
  }

  const getReportDescription = (type: ReportType): string => {
    switch (type) {
      case 'issues':
        return 'Comprehensive overview of all issues reported, resolved, and in progress'
      case 'users':
        return 'Detailed analysis of user registration, activity patterns, and demographics'
      case 'performance':
        return 'Platform performance metrics and volunteer performance statistics'
      case 'financial':
        return 'Financial overview and resource allocation analysis'
      case 'system':
        return 'System health metrics and platform usage statistics'
      default:
        return 'Automatically generated system report'
    }
  }

  const getReportPeriod = (): string => {
    const now = new Date()
    const month = now.toLocaleString('default', { month: 'long' })
    const year = now.getFullYear()
    return `${month} ${year}`
  }

  const handleRetry = () => {
    fetchReports()
  }

  const handleDownload = async (report: Report) => {
    if (!report.downloadUrl) return

    try {
      const link = document.createElement('a')
      link.href = report.downloadUrl
      link.download = `${report.title.toLowerCase().replace(/\s+/g, '-')}.${report.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Failed to download report:', err)
      setError('Failed to download report. Please try again.')
    }
  }

  const handleRegenerate = (report: Report) => {
    generateReport(report.type, report.format)
  }

  const handleDismissError = () => {
    setError(null)
  }

  // Loading state - Next.js will handle global loading.tsx
  if (loading && !reports.length) {
    return null // Next.js will show the global loading component
  }

  // Error state for initial load
  if (error && !reports.length) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 mb-2">⚠️</div>
              <p className="text-gray-900 font-medium mb-2">Something went wrong</p>
              <p className="text-gray-600 text-sm mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ReportsHeader onRefresh={handleRetry} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Retry
                </button>
                <button
                  onClick={handleDismissError}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <ReportGenerator 
          generating={generating} 
          onGenerateReport={generateReport} 
        />

        <ReportsList 
          reports={reports} 
          onDownload={handleDownload}
          onRegenerate={handleRegenerate}
        />
      </div>
    </div>
  )
}