// app/admin/analytics/components/PlatformMetrics.tsx
'use client'

import React from 'react'
import { 
  UserGroupIcon, 
  ChatBubbleLeftIcon, 
  HandThumbUpIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface PlatformMetricsProps {
  metrics: {
    totalUsers: number
    totalIssues: number
    totalComments: number
    totalVotes: number
    engagementRate: number
    avgResponseTimeHours: number
    topCategories: { category: string; count: number }[]
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
  }
}

export default function PlatformMetrics({ metrics }: PlatformMetricsProps) {
  const metricCards = [
    { label: 'Total Users', value: metrics.totalUsers, icon: UserGroupIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Issues', value: metrics.totalIssues, icon: ChartBarIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Total Comments', value: metrics.totalComments, icon: ChatBubbleLeftIcon, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Total Votes', value: metrics.totalVotes, icon: HandThumbUpIcon, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Engagement Rate', value: `${metrics.engagementRate}%`, icon: ChartBarIcon, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Avg Response Time', value: `${metrics.avgResponseTimeHours}h`, icon: ClockIcon, color: 'text-rose-600', bg: 'bg-rose-100' },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
        <div className="space-y-3">
          {metrics.topCategories.map(category => (
            <div key={category.category} className="flex justify-between items-center">
              <span className="text-gray-700 capitalize">{category.category}</span>
              <div className="flex items-center gap-3">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 rounded-full h-2"
                    style={{ width: `${(category.count / (metrics.topCategories[0]?.count || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">{category.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}