'use client'

import React, { useState, useEffect } from 'react'
import { analyticsAPI } from '@/lib/services/api/endpoints'
import AnalyticsHeader from './components/AnalyticsHeader'
import KeyMetrics from './components/KeyMetrics'
import IssuesByStatus from './components/IssuesByStatus'
import IssuesByCategory from './components/IssuesByCategory'
import IssueTrends from './components/IssueTrends'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import GeographicDistribution from './components/GeographicDistribution'
import PlatformMetrics from './components/PlatformMetrics'
import TopContributors from './components/TopContributors'
import UserGrowthTrend from './components/UserGrowthTrends'

interface AnalyticsData {
  overview: { totalUsers: number; totalIssues: number; resolvedIssues: number; activeVolunteers: number; newUsersThisWeek: number; issuesThisWeek: number }
  issuesByStatus: { status: string; count: number }[]
  issuesByCategory: { category: string; count: number }[]
  userGrowth: { date: string; count: number }[]
  issueTrends: { date: string; reported: number; resolved: number }[]
}

interface TrendsData {
  period: string
  trends: { issues: { date: string; created: number; resolved: number; net: number }[]; users: { date: string; citizens: number; volunteers: number; total: number }[] }
  summary: { totalIssuesCreated: number; totalIssuesResolved: number; totalUsersRegistered: number; totalVolunteersRegistered: number; avgDailyIssues: number; avgDailyResolved: number; resolutionRate: number; peakIssueDay: { date: string; count: number } | null; peakResolutionDay: { date: string; count: number } | null; peakUserRegistrationDay: { date: string; count: number } | null }
}

interface GeographicData {
  byCity: { city: string; count: number; latitude: number; longitude: number }[]
  byState: { state: string; count: number }[]
}

interface PlatformMetricsData {
  totalUsers: number; totalIssues: number; totalComments: number; totalVotes: number; engagementRate: number; avgResponseTimeHours: number; topCategories: { category: string; count: number }[]; dailyActiveUsers: number; weeklyActiveUsers: number; monthlyActiveUsers: number
}

type TimeRange = 'week' | 'month' | 'year'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [trends, setTrends] = useState<TrendsData | null>(null)
  const [geographic, setGeographic] = useState<GeographicData | null>(null)
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const [activeSection, setActiveSection] = useState<string>('overview')

  useEffect(() => { fetchAllData() }, [timeRange])

  const fetchAllData = async () => {
    try {
      setLoading(true); setError(null)
      const [overviewRes, trendsRes, geographicRes, platformRes] = await Promise.all([
        analyticsAPI.getOverview({ timeframe: timeRange }),
        analyticsAPI.getTrends(timeRange),
        analyticsAPI.getGeographicData(),
        analyticsAPI.getPlatformMetrics(),
      ])
      const od = overviewRes.data
      setAnalytics({ overview: { totalUsers: od.overview?.totalUsers || 0, totalIssues: od.overview?.totalIssues || 0, resolvedIssues: od.overview?.resolvedIssues || 0, activeVolunteers: od.overview?.activeVolunteers || 0, newUsersThisWeek: od.overview?.newUsersThisWeek || 0, issuesThisWeek: od.overview?.issuesThisWeek || 0 }, issuesByStatus: od.issuesByStatus || [], issuesByCategory: od.issuesByCategory || [], userGrowth: od.userGrowth || [], issueTrends: od.issueTrends || [] })
      setTrends(trendsRes.data)
      setGeographic(geographicRes.data)
      setPlatformMetrics(platformRes.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data.')
      toast.error('Failed to load analytics data')
    } finally { setLoading(false) }
  }

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    try { toast.info(`Preparing ${format.toUpperCase()} export...`); await analyticsAPI.exportAnalytics(format); toast.success(`${format.toUpperCase()} export downloaded`); }
    catch { toast.error('Failed to export analytics'); }
  }

  const sections = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'trends', label: 'Trends', icon: '📈' },
    { id: 'geographic', label: 'Geographic', icon: '🗺️' },
    { id: 'platform', label: 'Platform', icon: '⚙️' },
  ]

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 text-4xl mb-2">⚠️</div>
              <p className="text-gray-900 font-medium mb-2">Something went wrong</p>
              <p className="text-gray-600 text-sm mb-4">{error}</p>
              <button onClick={fetchAllData} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Try Again</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalIssues = analytics?.overview?.totalIssues || 0

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <AnalyticsHeader timeRange={timeRange} onTimeRangeChange={setTimeRange} onExport={handleExport} />

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-yellow-800 font-medium break-words">Warning: {error}</p>
                <p className="text-yellow-700 text-sm mt-1">Showing cached data.</p>
              </div>
              <button onClick={fetchAllData} className="flex-shrink-0 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700">Retry</button>
            </div>
          </div>
        )}

        {/* FIX: Section nav scrollable on mobile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max sm:min-w-0">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap text-sm ${activeSection === section.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <span className="mr-1 sm:mr-2">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {activeSection === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <KeyMetrics overview={analytics?.overview || null} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
              <IssuesByStatus items={analytics?.issuesByStatus || []} totalIssues={totalIssues} />
              <IssuesByCategory items={analytics?.issuesByCategory || []} totalIssues={totalIssues} />
            </div>
            <IssueTrends trends={analytics?.issueTrends || []} timeRange={timeRange} />
            <UserGrowthTrend userGrowth={analytics?.userGrowth || []} timeRange={timeRange} />
          </motion.div>
        )}

        {activeSection === 'trends' && trends && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
            {/* FIX: grid-cols-2 on mobile, 4 on md+ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-500">Issues Created</p>
                {/* FIX: text-xl on mobile, text-2xl on sm+ */}
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{trends.summary.totalIssuesCreated}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-500">Issues Resolved</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{trends.summary.totalIssuesResolved}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-500">Resolution Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{trends.summary.resolutionRate}%</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-500">Avg Daily Issues</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{trends.summary.avgDailyIssues}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Issue Trends Over Time</h3>
              <IssueTrends trends={trends.trends.issues.map(t => ({ date: t.date, reported: t.created, resolved: t.resolved }))} timeRange={timeRange} />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">User Growth Over Time</h3>
              <UserGrowthTrend userGrowth={trends.trends.users.map(t => ({ date: t.date, count: t.total }))} timeRange={timeRange} />
            </div>
          </motion.div>
        )}

        {activeSection === 'geographic' && geographic && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
            <GeographicDistribution byCity={geographic.byCity} byState={geographic.byState} />
          </motion.div>
        )}

        {activeSection === 'platform' && platformMetrics && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
            <PlatformMetrics metrics={platformMetrics} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <TopContributors />
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Active Users</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Daily Active Users</span>
                    <span className="text-xl sm:text-2xl font-bold text-blue-600">{platformMetrics.dailyActiveUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Weekly Active Users</span>
                    <span className="text-xl sm:text-2xl font-bold text-green-600">{platformMetrics.weeklyActiveUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Monthly Active Users</span>
                    <span className="text-xl sm:text-2xl font-bold text-purple-600">{platformMetrics.monthlyActiveUsers}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
