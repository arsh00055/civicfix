'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/features/auth/hooks/useAuth'
import apiClient from '@/lib/services/api/client'

interface StatData {
  issuesReported: number
  issuesResolved: number
  issuesInProgress: number
  communityScore: number
  totalVotes: number
  totalComments: number
  achievementsUnlocked: number
  joinDate: string
  daysActive: number
  // volunteer specific
  tasksCompleted?: number
  tasksAssigned?: number
  rating?: number
  totalRatings?: number
}

const StatCard = ({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
    <div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  </div>
)

const StatisticsPage: React.FC = () => {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [stats, setStats] = useState<StatData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (currentUser?.id) fetchStats()
  }, [currentUser])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiClient.get(`/users/${currentUser!.id}/stats`)
      setStats(res.data?.stats || res.data)
    } catch (err: any) {
      // Fallback to profile data
      try {
        const profileRes = await apiClient.get('/users/profile')
        const u = profileRes.data?.user || profileRes.data
        setStats({
          issuesReported: u?.stats?.issuesReported || 0,
          issuesResolved: u?.stats?.issuesResolved || 0,
          issuesInProgress: 0,
          communityScore: u?.stats?.communityScore || 0,
          totalVotes: 0,
          totalComments: 0,
          achievementsUnlocked: 0,
          joinDate: u?.createdAt || u?.joinDate || '',
          daysActive: u?.createdAt ? Math.floor((Date.now() - new Date(u.createdAt).getTime()) / 86400000) : 0,
          tasksCompleted: u?.completedTasks,
          tasksAssigned: u?.totalTasks,
          rating: u?.rating,
        })
      } catch {
        setError('Failed to load statistics.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isVolunteer = currentUser?.role === 'volunteer'
  const isAdmin = currentUser?.role === 'admin'

  const resolutionRate = stats && stats.issuesReported > 0
    ? Math.round((stats.issuesResolved / stats.issuesReported) * 100)
    : 0

  return (
    <MainLayout role={currentUser?.role || null}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-500 cursor-pointer hover:text-gray-700">← Back</button>
          <h1 className="text-2xl font-bold text-gray-900">My Statistics</h1>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
            <p className="mt-3 text-gray-500">Loading statistics...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
            {error}
            <button onClick={fetchStats} className="block cursor-pointer mx-auto mt-3 text-sm underline">Try again</button>
          </div>
        )}

        {!loading && !error && stats && (
          <div className="space-y-8">
            {/* Community Stats */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Community Activity</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Issues Reported" value={stats.issuesReported} icon="📋" color="bg-blue-100" />
                <StatCard label="Issues Resolved" value={stats.issuesResolved} icon="✅" color="bg-green-100" />
                <StatCard label="Community Score" value={`${stats.communityScore}%`} icon="⭐" color="bg-yellow-100" />
                <StatCard label="Days Active" value={stats.daysActive} icon="📅" color="bg-purple-100" />
              </div>
            </div>

            {/* Resolution Rate */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resolution Rate</h2>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{stats.issuesResolved} of {stats.issuesReported} issues resolved</span>
                <span className="text-sm font-bold text-blue-600">{resolutionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 rounded-full h-3 transition-all duration-500"
                  style={{ width: `${resolutionRate}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {resolutionRate >= 75 ? '🌟 Excellent! Keep it up.' : resolutionRate >= 50 ? '👍 Good progress!' : '💪 Keep contributing!'}
              </p>
            </div>

            {/* Volunteer Stats */}
            {isVolunteer && stats.tasksCompleted !== undefined && (
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Volunteer Stats</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard label="Tasks Completed" value={stats.tasksCompleted || 0} icon="🎯" color="bg-teal-100" />
                  <StatCard label="Tasks Assigned" value={stats.tasksAssigned || 0} icon="📌" color="bg-orange-100" />
                  <StatCard label="Rating" value={stats.rating ? `${stats.rating.toFixed(1)} ⭐` : 'N/A'} icon="🏅" color="bg-amber-100" />
                </div>
              </div>
            )}

            {/* Engagement */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Engagement</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Votes Cast" value={stats.totalVotes} icon="👍" color="bg-indigo-100" />
                <StatCard label="Comments Made" value={stats.totalComments} icon="💬" color="bg-pink-100" />
                <StatCard label="Achievements" value={stats.achievementsUnlocked} icon="🏆" color="bg-yellow-100" />
              </div>
            </div>

            {/* Member Since */}
            {stats.joinDate && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-gray-700 font-medium">
                  Member since{' '}
                  <span className="text-blue-600 font-bold">
                    {new Date(stats.joinDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Active for {stats.daysActive} days</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default StatisticsPage
