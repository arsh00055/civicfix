'use client'

import React, { useState, useEffect } from 'react'
import apiClient from '@/lib/services/api/client'
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
      const response = await apiClient.get('/admin/reports')
      setReports(response.data.reports || response.data.data || [])
    } catch (err: any) {
      console.error('Failed to fetch reports:', err)
      setError(err.message || 'Failed to load reports.')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (type: ReportType, format: ReportFormat) => {
    const tempId = `${type}-${format}-${Date.now()}`
    setGenerating(tempId)
    setError(null)

    try {
      // ── Step 1: Direct blob fetch from export endpoint ──
      // apiClient parses JSON by default, so use native fetch for blob
      const exportFormat = format === 'excel' ? 'csv' : format  // backend supports csv/json
      const exportUrl = `/api/admin/analytics/export?format=${exportFormat}&type=${type}`

      const res = await fetch(exportUrl, { credentials: 'include' })

      if (!res.ok) {
        throw new Error(`Export failed: ${res.status} ${res.statusText}`)
      }

      const blob = await res.blob()
      const ext = format === 'excel' ? 'csv' : format === 'pdf' ? 'json' : format
      const fileName = `civicfix-${type}-report-${new Date().toISOString().split('T')[0]}.${ext}`

      // ── Step 2: Trigger browser download immediately ──
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      // ── Step 3: Save record to DB ──
      const savePayload = {
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        description: getReportDescription(type),
        type,
        format,
        period: getReportPeriod(),
        status: 'completed',
        fileSize: String(blob.size),
        downloadUrl: null,  // no persistent URL — file was downloaded directly
      }

      try {
        const saveRes = await apiClient.post('/admin/reports', savePayload)
        const saved: Report = saveRes.data.data
        // Prepend to list
        setReports(prev => [{ ...saved, status: 'completed' }, ...prev])
      } catch {
        // Save failed but download worked — still show a local entry
        const localEntry: Report = {
          id: tempId,
          ...savePayload,
          downloadUrl: undefined,
          generatedAt: new Date().toISOString(),
          status: 'completed',
        }
        setReports(prev => [localEntry, ...prev])
      }

    } catch (err: any) {
      console.error('Failed to generate report:', err)
      setError(`Failed to generate ${type} ${format.toUpperCase()} report. Please try again.`)

      // Try to save failed record
      try {
        const failPayload = {
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
          description: getReportDescription(type),
          type,
          format,
          period: getReportPeriod(),
          status: 'failed',
        }
        const saveRes = await apiClient.post('/admin/reports', failPayload)
        const saved: Report = saveRes.data.data
        setReports(prev => [{ ...saved, status: 'failed' }, ...prev])
      } catch {
        const failEntry: Report = {
          id: tempId,
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
          description: getReportDescription(type),
          type,
          format,
          generatedAt: new Date().toISOString(),
          period: getReportPeriod(),
          status: 'failed',
        }
        setReports(prev => [failEntry, ...prev])
      }

    } finally {
      setGenerating(null)
    }
  }

  const getReportDescription = (type: ReportType): string => {
    switch (type) {
      case 'issues':     return 'Comprehensive overview of all issues reported, resolved, and in progress'
      case 'users':      return 'Detailed analysis of user registration, activity patterns, and demographics'
      case 'performance':return 'Platform performance metrics and volunteer performance statistics'
      case 'financial':  return 'Financial overview and resource allocation analysis'
      case 'system':     return 'System health metrics and platform usage statistics'
      default:           return 'Automatically generated system report'
    }
  }

  const getReportPeriod = (): string => {
    const now = new Date()
    return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`
  }

  // Download button in list — re-fetch from export (no persistent URL stored)
  const handleDownload = async (report: Report) => {
    if (report.downloadUrl) {
      // If a real URL exists, use it
      const link = document.createElement('a')
      link.href = report.downloadUrl
      link.download = `${report.title.toLowerCase().replace(/\s+/g, '-')}.${report.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // Re-generate download on the fly
      await generateReport(report.type, report.format)
    }
  }

  const handleRegenerate = (report: Report) => {
    generateReport(report.type, report.format)
  }

  const handleDelete = async (report: Report) => {
    try {
      await apiClient.delete(`/admin/reports?id=${report.id}`)
      setReports(prev => prev.filter(r => r.id !== report.id))
    } catch {
      setError('Failed to delete report. Please try again.')
    }
  }

  const handleRetry = () => fetchReports()
  const handleDismissError = () => setError(null)

  if (loading && !reports.length) return null

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
              <p className="text-red-800 font-medium flex-1">{error}</p>
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
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}