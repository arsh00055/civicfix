'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/features/auth/hooks/useAuth'
import apiClient from '@/lib/services/api/client'
import {
  TrophyIcon,
  ArrowPathIcon,
  StarIcon,
  CheckCircleIcon,
  FireIcon,
} from '@heroicons/react/24/outline'
import { TrophyIcon as TrophySolid } from '@heroicons/react/24/solid'

type Period = 'weekly' | 'monthly' | 'alltime'

interface LeaderboardEntry {
  rank: number
  volunteerId: string
  name: string
  avatar: string | null
  tasksCompleted: number
  points: number
  rating: number
  isCurrentUser: boolean
}

const MEDAL: Record<number, { color: string; bg: string; icon: string }> = {
  1: { color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-200', icon: '🥇' },
  2: { color: 'text-gray-400',   bg: 'bg-gray-50 border-gray-200',     icon: '🥈' },
  3: { color: 'text-orange-400', bg: 'bg-orange-50 border-orange-200', icon: '🥉' },
}

const PERIOD_LABELS: Record<Period, string> = {
  weekly:  'This Week',
  monthly: 'This Month',
  alltime: 'All Time',
}

function Avatar({ name, avatar, size = 10 }: { name: string; avatar: string | null; size?: number }) {
  if (avatar) {
    return <img src={avatar} alt={name} className={`w-${size} h-${size} rounded-full object-cover`} />
  }
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`w-${size} h-${size} rounded-full ${color} flex items-center justify-center text-white font-bold text-sm`}>
      {initials}
    </div>
  )
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [period, setPeriod] = useState<Period>('monthly')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<{ rank: number; tasksCompleted: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true); setError(null)
      const res = await apiClient.get('/leaderboard', { params: { period } })
      setLeaderboard(res.data.leaderboard || [])
      setCurrentUserRank(res.data.currentUserRank || null)
    } catch { setError('Failed to load leaderboard.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLeaderboard() }, [period])

  const top3 = leaderboard.slice(0, 3)
  const rest  = leaderboard.slice(3)

  return (
    <MainLayout role={user?.role ?? null}>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6">

          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-yellow-100 rounded-2xl">
                <TrophySolid className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            {/* FIX: text-2xl on mobile, text-3xl on sm+ */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leaderboard</h1>
            <p className="text-gray-500 mt-1 text-sm">Top volunteers making a difference</p>
          </div>

          {/* Period tabs */}
          <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${period === p ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
              {error}
              <button onClick={fetchLeaderboard} className="font-medium underline">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="animate-pulse flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <TrophyIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-700">No data yet</h3>
              <p className="text-sm text-gray-400 mt-1">Complete tasks to appear on the leaderboard</p>
            </div>
          ) : (
            <>
              {/* Top 3 podium */}
              {top3.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[top3[1], top3[0], top3[2]].map((entry, i) => {
                    if (!entry) return <div key={i} />
                    const actualRank = entry.rank
                    const medal = MEDAL[actualRank]
                    const isFirst = actualRank === 1
                    return (
                      <div
                        key={entry.volunteerId}
                        className={`flex flex-col items-center p-2 sm:p-4 rounded-xl border-2 ${medal.bg} ${isFirst ? 'scale-105 shadow-md' : ''} ${entry.isCurrentUser ? 'ring-2 ring-blue-400' : ''}`}
                      >
                        <span className="text-xl sm:text-2xl mb-1 sm:mb-2">{medal.icon}</span>
                        <Avatar name={entry.name} avatar={entry.avatar} size={10} />
                        <p className="text-xs font-bold text-gray-900 mt-1 sm:mt-2 text-center line-clamp-1">{entry.name}</p>
                        <p className={`text-base sm:text-lg font-bold mt-1 ${medal.color}`}>{entry.tasksCompleted}</p>
                        <p className="text-xs text-gray-400">tasks</p>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Rest of leaderboard */}
              {rest.length > 0 && (
                <div className="space-y-2">
                  {rest.map(entry => (
                    <div
                      key={entry.volunteerId}
                      className={`flex items-center gap-3 sm:gap-4 bg-white rounded-xl border p-3 sm:p-4 transition-all ${entry.isCurrentUser ? 'border-blue-300 ring-1 ring-blue-300 bg-blue-50' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}
                    >
                      <span className="w-7 sm:w-8 text-center text-sm font-bold text-gray-400">#{entry.rank}</span>
                      <Avatar name={entry.name} avatar={entry.avatar} size={10} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {entry.name}
                          {entry.isCurrentUser && <span className="ml-2 text-xs text-blue-600 font-normal">(you)</span>}
                        </p>
                        <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
                          {entry.rating > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-yellow-500">
                              <StarIcon className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
                              {entry.rating}
                            </span>
                          )}
                          {entry.points > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-purple-600">
                              <FireIcon className="h-3 w-3" />
                              {entry.points} pts
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold text-gray-900">{entry.tasksCompleted}</p>
                        <p className="text-xs text-gray-400">tasks</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentUserRank && !leaderboard.find(e => e.isCurrentUser) && (
                <div className="flex items-center gap-3 sm:gap-4 bg-blue-50 border-2 border-blue-300 rounded-xl p-3 sm:p-4">
                  <span className="w-7 sm:w-8 text-center text-sm font-bold text-blue-600">#{currentUserRank.rank}</span>
                  <Avatar name={user?.name || 'You'} avatar={user?.avatar ?? null} size={10} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-blue-900 truncate">{user?.name || 'You'}</p>
                    <p className="text-xs text-blue-600">Your current rank</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold text-blue-900">{currentUserRank.tasksCompleted}</p>
                    <p className="text-xs text-blue-600">tasks</p>
                  </div>
                </div>
              )}
            </>
          )}

          <button onClick={fetchLeaderboard} className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
    </MainLayout>
  )
}
