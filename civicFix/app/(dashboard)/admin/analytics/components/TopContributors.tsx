// app/admin/analytics/components/TopContributors.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { analyticsAPI } from '@/lib/services/api/endpoints'
import { UserIcon, TrophyIcon } from '@heroicons/react/24/outline'

interface Contributor {
  id: string
  name: string
  email: string
  totalReports: number
  totalVotes: number
  totalComments: number
  points: number
}

export default function TopContributors() {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopContributors()
  }, [])

  const fetchTopContributors = async () => {
    try {
      const response = await analyticsAPI.getUserStats()
      const data = response.data
      // Process users to get top contributors
      const users = data.recentUsers || []
      const top = users
        .map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          totalReports: user.totalReports || 0,
          totalVotes: user.totalVotes || 0,
          totalComments: user.totalComments || 0,
          points: (user.totalReports || 0) * 10 + (user.totalVotes || 0) * 5 + (user.totalComments || 0) * 3
        }))
        .sort((a: { points: number }, b: { points: number }) => b.points - a.points)
        .slice(0, 5)
      setContributors(top)
    } catch (error) {
      console.error('Failed to fetch contributors:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded mb-3"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrophyIcon className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900">Top Contributors</h3>
      </div>
      
      <div className="space-y-3">
        {contributors.map((contributor, index) => (
          <div key={contributor.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600">{index + 1}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{contributor.name}</p>
              <p className="text-xs text-gray-500">{contributor.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{contributor.points} pts</p>
              <p className="text-xs text-gray-500">{contributor.totalReports} reports</p>
            </div>
          </div>
        ))}
      </div>
      
      {contributors.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No contributor data available
        </div>
      )}
    </div>
  )
}