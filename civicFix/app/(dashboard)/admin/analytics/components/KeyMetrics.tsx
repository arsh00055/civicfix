'use client'

import React from 'react'
import { UsersIcon, ClipboardIcon, CheckCircleIcon } from '@/components/UI/icons' // Updated path

interface OverviewData {
  totalUsers: number
  totalIssues: number
  resolvedIssues: number
  activeVolunteers: number
  newUsersThisWeek: number
  issuesThisWeek: number
}

interface KeyMetricsProps {
  overview: OverviewData | null
}

export default function KeyMetrics({ overview }: KeyMetricsProps) {
  const calculateResolutionRate = () => {
    if (!overview || !overview.totalIssues) return 0
    return Math.round((overview.resolvedIssues / overview.totalIssues) * 100)
  }

  const metrics = [
    {
      title: 'Total Users',
      value: overview?.totalUsers || '0',
      change: `+${overview?.newUsersThisWeek || 0} this week`,
      changeColor: 'text-green-600',
      icon: UsersIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Total Issues',
      value: overview?.totalIssues || '0',
      change: `+${overview?.issuesThisWeek || 0} this week`,
      changeColor: 'text-blue-600',
      icon: ClipboardIcon,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Resolved Issues',
      value: overview?.resolvedIssues || '0',
      change: `${calculateResolutionRate()}% resolution rate`,
      changeColor: 'text-green-600',
      icon: CheckCircleIcon,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Active Volunteers',
      value: overview?.activeVolunteers || '0',
      change: 'Helping the community',
      changeColor: 'text-gray-600',
      icon: UsersIcon,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-2 ${metric.iconBg} rounded-lg`}>
                <IconComponent className={`h-6 w-6 ${metric.iconColor}`} aria-hidden="true" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className={`text-xs ${metric.changeColor}`}>{metric.change}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}