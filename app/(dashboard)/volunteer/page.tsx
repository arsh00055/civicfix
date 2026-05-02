'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/UI/cards/StatCard';
import IssueCard from '@/components/UI/cards/IssueCard';
import QuickActions from '@/components/dashboard/widgets/QuickActions';
import Loading from '@/app/loading';
import Error from '@/app/error';
import RecentActivity from '@/components/dashboard/widgets/RecentActivity';
import { CheckCircleIcon, ClockIcon, UserGroupIcon, StarIcon } from '@/components/UI/icons';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  fetchVolunteerDashboard,
  refreshVolunteerDashboard,
} from '@/lib/helpers/volunteerDashboard.helper';
import { volunteersAPI } from '@/lib/services/api/endpoints';
import { toast } from 'sonner';
import { formatRelativeTime } from '@/lib/helpers/dashboardUtils';
import { VolunteerDashboardStats, AvailableTask, Assignment } from '@/types/volunteer.types';

// ---------------------------------------------------------------------------
// Module-level constants
// ---------------------------------------------------------------------------

const DEFAULT_STATS: VolunteerDashboardStats = Object.freeze({
  completedTasks:         0,
  activeTasks:            0,
  totalClaimed:           0,
  responseTime:           'N/A',
  rating:                 '0.0',
  communityRank:          'Volunteer',
  points:                 0,
  level:                  1,
  averageResolutionHours: 0,
})

// UX: status → progress percentage for the assignment progress bars
const STATUS_PROGRESS: Record<string, number> = Object.freeze({
  assigned:       25,
  in_progress:    50,
  pending_review: 75,
  resolved:       100,
})

// UX: status → Tailwind fill colour for the progress bar
const STATUS_BAR_COLOR: Record<string, string> = Object.freeze({
  assigned:       'bg-yellow-400',
  in_progress:    'bg-blue-500',
  pending_review: 'bg-purple-500',
  resolved:       'bg-green-500',
})

// UX: status → pill styling
const STATUS_PILL: Record<string, string> = Object.freeze({
  assigned:       'bg-yellow-50 text-yellow-700 border-yellow-200',
  in_progress:    'bg-blue-50 text-blue-700 border-blue-200',
  pending_review: 'bg-purple-50 text-purple-700 border-purple-200',
  resolved:       'bg-green-50 text-green-700 border-green-200',
  closed:         'bg-gray-100 text-gray-600 border-gray-200',
})

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

function parseDashboardData(d: any) {
  return {
    stats: {
      completedTasks:         d.stats.completedTasks,
      activeTasks:            d.stats.activeTasks,
      totalClaimed:           d.stats.totalClaimed,
      responseTime:           d.stats.responseTime,
      rating:                 d.stats.rating,
      communityRank:          d.stats.communityRank,
      points:                 d.stats.points,
      level:                  d.stats.level,
      averageResolutionHours: d.stats.averageResolutionHours,
    } as VolunteerDashboardStats,
    availableTasks:      (d.availableTasks      || []) as AvailableTask[],
    myAssignments:       (d.myAssignments        || []) as Assignment[],
    recentNotifications: (d.recentNotifications  || []) as any[],
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VolunteerDashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [stats, setStats]                             = useState<VolunteerDashboardStats>(DEFAULT_STATS)
  const [availableTasks, setAvailableTasks]           = useState<AvailableTask[]>([])
  const [myAssignments, setMyAssignments]             = useState<Assignment[]>([])
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading]                     = useState(true)
  const [error, setError]                             = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing]               = useState(false)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (user?.role === 'volunteer') loadDashboardData()
  }, [user, authLoading, router])

  const applyDashboardData = useCallback((raw: any) => {
    const d = parseDashboardData(raw)
    setStats(d.stats)
    setAvailableTasks(d.availableTasks)
    setMyAssignments(d.myAssignments)
    setRecentNotifications(d.recentNotifications)
  }, [])

  const loadDashboardData = async () => {
    if (!user?.id) return
    try {
      setIsLoading(true)
      setError(null)
      applyDashboardData(await fetchVolunteerDashboard(user.id))
    } catch (err: unknown) {
      setError('Failed to load dashboard data.')
      toast.error('Failed to load dashboard data')
      setStats(DEFAULT_STATS)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!user?.id || isRefreshing) return
    setIsRefreshing(true)
    try {
      applyDashboardData(await refreshVolunteerDashboard(user.id))
      toast.success('Dashboard refreshed')
    } catch {
      toast.error('Failed to refresh dashboard')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleTaskClaim = async (taskId: string) => {
    try {
      await volunteersAPI.claimTask(taskId)
      toast.success('Task claimed successfully!')
      await loadDashboardData()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to claim task.')
    }
  }

  // UX: completion rate derived once — not recalculated inside JSX
  const completionRate = useMemo(() => {
    if (!stats.totalClaimed || stats.totalClaimed === 0) return 0
    return Math.round((stats.completedTasks / stats.totalClaimed) * 100)
  }, [stats.completedTasks, stats.totalClaimed])

  // UX: unread notification count for the badge
  const unreadCount = useMemo(
    () => recentNotifications.filter((n: any) => !n.read).length,
    [recentNotifications]
  )

  // UX: active assignments (non-resolved) for the sidebar summary
  const activeAssignments = useMemo(
    () => myAssignments.filter(a => a.status !== 'resolved' && a.status !== 'closed'),
    [myAssignments]
  )

  if (authLoading) return null
  if (!user || user.role !== 'volunteer') return null
  if (isLoading) return <Loading isLoading={true} mode="page" message="Loading..." />
  if (error && stats.completedTasks === 0) {
    return <Error error={error as unknown as Error & { digest?: string }} reset={loadDashboardData} />
  }

  const ratingNum = parseFloat(stats.rating)

  return (
    <div className="space-y-5">

      {/* ── Welcome Banner ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-5 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold mb-1">
              Welcome back, {user?.name?.split(' ')[0] || 'Volunteer'}!
            </h1>
            {/* UX: subtitle always carries real numbers */}
            <p className="text-green-100 text-sm leading-relaxed">
              {stats.completedTasks > 0
                ? `${stats.completedTasks} tasks done · Lv ${stats.level} · ${stats.points} pts · ★ ${stats.rating}`
                : 'Find a task below to start helping your community.'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* UX: rank badge always shown */}
            <div className="bg-white/15 border border-white/25 rounded-full px-3 py-1.5">
              <span className="text-xs font-medium whitespace-nowrap">
                {stats.communityRank}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Completed tasks"
          value={stats.completedTasks.toString()}
          icon={CheckCircleIcon}
          description={`${completionRate}% completion rate`}
          trend={{ value: stats.completedTasks > 0 ? 12 : 0, isPositive: true }}
        />
        <StatCard
          title="Active tasks"
          value={stats.activeTasks.toString()}
          icon={ClockIcon}
          description={activeAssignments.length > 0 ? `${activeAssignments.length} in progress` : 'none in progress'}
        />
        <StatCard
          title="Total claimed"
          value={stats.totalClaimed.toString()}
          icon={UserGroupIcon}
          description={`${completionRate}% completed`}
        />
        {/* UX: rating card shows star count visually in description */}
        <StatCard
          title="Volunteer rating"
          value={stats.rating}
          icon={StarIcon}
          description={`Level ${stats.level} · ${stats.points} pts`}
          trend={{ value: ratingNum > 4 ? 0.3 : 0, isPositive: true }}
        />
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-5">
          <QuickActions userRole="volunteer" />

          {/* UX: unread badge in activity header */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center px-4 pt-4 pb-2">
              <h2 className="text-sm font-semibold text-gray-900">
                Recent activity
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-4 h-4 text-xs font-bold bg-green-600 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h2>
              <button
                onClick={() => router.push('/notifications')}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                View all
              </button>
            </div>
            <RecentActivity
              notifications={recentNotifications}
              loading={isLoading}
              error={error}
              onRefresh={handleRefresh}
              onViewAll={() => router.push('/notifications')}
            />
          </div>
        </div>

        {/* Right: tasks + assignments */}
        <div className="lg:col-span-2 space-y-5">

          {/* Available tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Available tasks
                {availableTasks.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({availableTasks.length})
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/tasks/available')}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Browse all →
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  {isRefreshing ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {availableTasks.length > 0 ? (
                availableTasks.slice(0, 3).map(task => (
                  <IssueCard
                    key={task.id}
                    issue={task as any}
                    onUpdate={loadDashboardData}
                    showClaimButton={true}
                    showVoting={false}
                    onClaim={handleTaskClaim}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">All tasks claimed</p>
                  <p className="text-xs text-gray-400 mb-3">Check back soon for new opportunities</p>
                  <button
                    onClick={() => router.push('/tasks/available')}
                    className="px-4 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Browse all tasks
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* My active assignments — UX: progress bars show status at a glance */}
          {myAssignments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-gray-900">
                  My assignments
                  {activeAssignments.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      ({activeAssignments.length} active)
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => router.push('/tasks/assignments')}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  View all →
                </button>
              </div>
              <div className="space-y-3">
                {myAssignments.slice(0, 3).map(assignment => {
                  const progress  = STATUS_PROGRESS[assignment.status] ?? 0
                  const barColor  = STATUS_BAR_COLOR[assignment.status] ?? 'bg-gray-400'
                  const pillClass = STATUS_PILL[assignment.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'
                  const statusLabel = (assignment.status ?? 'assigned').replaceAll('_', ' ')

                  return (
                    <div
                      key={assignment.id}
                      className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                            {assignment.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            {/* UX: status pill */}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${pillClass}`}>
                              {statusLabel}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatRelativeTime(assignment.claimedAt)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => router.push(`/issues/${assignment.taskId}?role=volunteer`)}
                          className="flex-shrink-0 px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          View
                        </button>
                      </div>
                      {/* UX: progress bar — volunteers see how far along each task is */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 tabular-nums w-8 text-right">
                          {progress}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}