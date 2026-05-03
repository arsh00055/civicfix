'use client'

import React, { useState, useEffect, useCallback, useReducer } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '@/components/UI/cards/StatCard'
import IssueCard from '@/components/UI/cards/IssueCard'
import QuickActions from '@/components/dashboard/widgets/QuickActions'
import Loading from '@/app/loading'
import Error from '@/app/error'
import RecentActivity from '@/components/dashboard/widgets/RecentActivity'
import {
  HomeIcon,
  MapIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@/components/UI/icons'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  fetchCitizenDashboard,
  refreshCitizenDashboard,
} from '@/lib/helpers/citizenDashboard.helper'
import { issuesAPI } from '@/lib/services/api/endpoints'
import { toast } from 'sonner'
import { ClockIcon, UserIcon } from 'lucide-react'
import { CitizenDashboardStats } from '@/types/user.types'

// ---------------------------------------------------------------------------
// Vote reducer — bail-out prevents re-render when value unchanged
// ---------------------------------------------------------------------------

type VoteState  = Record<string, boolean>
type VoteAction = { issueId: string; voted: boolean }

function voteReducer(state: VoteState, action: VoteAction): VoteState {
  if (state[action.issueId] === action.voted) return state
  return { ...state, [action.issueId]: action.voted }
}

// ---------------------------------------------------------------------------
// Module-level constants
// ---------------------------------------------------------------------------

const DEFAULT_STATS: CitizenDashboardStats = Object.freeze({
  reportsSubmitted:      0,
  issuesResolved:        0,
  achievementsEarned:    0,
  communityRank:         'Citizen',
  communityImpact:       '0%',
  totalVotes:            0,
  totalComments:         0,
  activeVolunteers:      0,
  resolutionRate:        0,
  averageResolutionTime: 'N/A',
  pendingIssues:         0,
  totalCommunityIssues:  0,
  thisWeekReports:       0,
  thisWeekResolved:      0,
})

// UX: rank → emoji map so the banner always shows the user's rank,
// not just for "Top Contributor"
const RANK_EMOJI: Record<string, string> = Object.freeze({
  'Community Legend': '🏆',
  'Top Contributor':  '🌟',
  'Active Member':    '⚡',
  'Rising Star':      '✨',
  'Contributor':      '👍',
  'Citizen':          '🏘️',
})

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

function parseDashboardData(data: any, userId: string) {
  const s = data.stats
  const myReports: any[] = data.myReports ?? []
  const voteStatusMap: VoteState = {}
  for (const report of myReports) {
    voteStatusMap[report.id] = report.voters?.includes(userId) ?? false
  }
  return {
    stats: {
      reportsSubmitted:      s.reportsSubmitted      ?? 0,
      issuesResolved:        s.issuesResolved        ?? 0,
      achievementsEarned:    s.achievementsEarned    ?? 0,
      communityRank:         s.communityRank         ?? 'Citizen',
      communityImpact:       s.communityImpact       ?? '0%',
      totalVotes:            s.totalVotes            ?? 0,
      totalComments:         s.totalComments         ?? 0,
      activeVolunteers:      s.activeVolunteers      ?? 0,
      resolutionRate:        s.resolutionRate        ?? 0,
      averageResolutionTime: s.averageResolutionTime ?? 'N/A',
      pendingIssues:         s.pendingIssues         ?? 0,
      totalCommunityIssues:  s.totalCommunityIssues  ?? 0,
      thisWeekReports:       s.thisWeekReports       ?? 0,
      thisWeekResolved:      s.thisWeekResolved       ?? 0,
    } as CitizenDashboardStats,
    myReports,
    recentNotifications: data.recentNotifications ?? [],
    voteStatusMap,
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CitizenDashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [stats, setStats]                             = useState<CitizenDashboardStats>(DEFAULT_STATS)
  const [myReports, setMyReports]                     = useState<any[]>([])
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])
  const [voteStatusMap, dispatchVote]                 = useReducer(voteReducer, {})
  const [isLoading, setIsLoading]                     = useState(true)
  const [error, setError]                             = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing]               = useState(false)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (user?.role === 'citizen') loadDashboardData()
  }, [user, authLoading, router])

  const applyDashboardData = useCallback((raw: any) => {
    if (!user?.id) return
    const parsed = parseDashboardData(raw, user.id)
    setStats(parsed.stats)
    setMyReports(parsed.myReports)
    setRecentNotifications(parsed.recentNotifications)
    for (const [issueId, voted] of Object.entries(parsed.voteStatusMap)) {
      dispatchVote({ issueId, voted: voted as boolean })
    }
  }, [user?.id])

  const loadDashboardData = async () => {
    if (!user?.id) return
    try {
      setIsLoading(true)
      setError(null)
      applyDashboardData(await fetchCitizenDashboard(user.id))
    } catch (error) {
      setError("Failed to load Dashboard data");
      toast.error('Failed to load dashboard data')
      setStats(DEFAULT_STATS)
      setMyReports([])
      setRecentNotifications([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!user?.id || isRefreshing) return
    setIsRefreshing(true)
    try {
      applyDashboardData(await refreshCitizenDashboard(user.id))
      toast.success('Dashboard refreshed')
    } catch {
      toast.error('Failed to refresh dashboard')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleVote = async (issueId: string) => {
    if (!user?.id) {
      toast.warning('Please login to vote')
      router.push('/login')
      return
    }
    try {
      const { data: result } = await issuesAPI.voteIssue(issueId)
      setMyReports(prev =>
        prev.map(r =>
          r.id !== issueId ? r : {
            ...r,
            upvotes: result.upvotes,
            voters: result.voted
              ? [...(r.voters || []), user.id]
              : (r.voters || []).filter((id: string) => id !== user.id),
          }
        )
      )
      dispatchVote({ issueId, voted: result.voted })
      toast.success(result.voted ? 'Vote added!' : 'Vote removed')
    } catch {
      toast.error('Failed to vote. Please try again.')
    }
  }

  const hasUserVoted = (issueId: string): boolean => voteStatusMap[issueId] ?? false

  if (authLoading) return null
  if (!user || user.role !== 'citizen') return null
  if (isLoading) return <div className="space-y-6"><Loading /></div>
  if (error && stats.reportsSubmitted === 0) {
    return <Error error={error as unknown as Error & { digest?: string }} reset={loadDashboardData} />
  }

  // UX: derive banner subtitle with actual data so it's never generic
  const rankEmoji   = RANK_EMOJI[stats.communityRank] ?? '🏘️'
  const unreadCount = recentNotifications.filter((n: any) => !n.read).length

  return (
    <div className="space-y-5">

      {/* ── Welcome Banner ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold mb-1">
              Welcome back, {user?.name?.split(' ')[0] || 'Citizen'}!
            </h1>
            {/* UX: subtitle carries real data instead of a generic greeting */}
            <p className="text-blue-100 text-sm leading-relaxed">
              {stats.reportsSubmitted > 0
                ? `${stats.reportsSubmitted} reports · ${stats.issuesResolved} resolved · ${stats.resolutionRate}% resolution rate`
                : 'Start reporting issues to help your community.'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* UX: rank badge always shown, not just for "Top Contributor" */}
            <div className="bg-white/15 border border-white/25 rounded-full px-3 py-1.5">
              <span className="text-xs font-medium whitespace-nowrap">
                {rankEmoji} {stats.communityRank}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-white/10 hover:bg-white/20 cursor-pointer border border-white/20 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Personal Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Reports Submitted"
          value={stats.reportsSubmitted.toString()}
          icon={PlusIcon}
          description={`${stats.thisWeekReports} this week`}
          trend={{ value: stats.reportsSubmitted > 0 ? 15 : 0, isPositive: true }}
        />
        <StatCard
          title="Issues Resolved"
          value={stats.issuesResolved.toString()}
          icon={CheckCircleIcon}
          description={`${stats.resolutionRate}% rate`}
          trend={{ value: stats.issuesResolved > 0 ? 10 : 0, isPositive: true }}
        />
        <StatCard
          title="Achievements"
          value={stats.achievementsEarned.toString()}
          icon={HomeIcon}
          description="badges earned"
        />
        <StatCard
          title="Community Impact"
          value={stats.communityImpact}
          icon={MapIcon}
          description="your contribution"
        />
      </div>

      {/* ── Community Stats ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Active Volunteers"
          value={stats.activeVolunteers.toString()}
          icon={UserIcon}
          description="in your area"
        />
        {/* UX: resolution rate gets a progress bar sub-component via description */}
        <StatCard
          title="Resolution Rate"
          value={`${stats.resolutionRate}%`}
          icon={CheckCircleIcon}
          description={`${stats.thisWeekResolved} resolved this week`}
          trend={{ value: stats.resolutionRate, isPositive: stats.resolutionRate > 50 }}
        />
        <StatCard
          title="Avg Resolution"
          value={stats.averageResolutionTime}
          icon={ClockIcon}
          description="report to fix"
        />
        <StatCard
          title="Community Issues"
          value={stats.totalCommunityIssues.toString()}
          icon={ExclamationTriangleIcon}
          // UX: pending count in description so admin urgency is surfaced
          description={`${stats.pendingIssues} pending · ${stats.thisWeekReports} new`}
        />
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-5">
          <QuickActions userRole="citizen" />

          {/* UX: unread count shown in activity header */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center px-4 pt-4 pb-2">
              <h2 className="text-sm font-semibold text-gray-900">
                Recent activity
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-4 h-4 text-xs font-bold bg-blue-600 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h2>
              <button
                onClick={() => router.push('/notifications')}
                className="text-xs text-blue-600 cursor-pointer hover:text-blue-700 font-medium"
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

        {/* Right: recent reports */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Your recent reports</h2>
              <div className="flex items-center gap-3">
                {/* UX: link to full list */}
                <button
                  onClick={() => router.push('/issues/my-reports')}
                  className="text-xs cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all →
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 disabled:opacity-50"
                >
                  {isRefreshing ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {myReports.length > 0 ? (
                myReports.slice(0, 3).map(report => (
                  <IssueCard
                    key={report.id}
                    issue={report}
                    isVoted={hasUserVoted(report.id)}
                    onVote={() => handleVote(report.id)}
                    onClick={() => router.push(`/issues/${report.id}?role=${user?.role || ''}`)}
                    onUpdate={loadDashboardData}
                    showActions={false}
                    showVoting={true}
                  />
                ))
              ) : (
                /* UX: tighter empty state — icon + one CTA, no filler text */
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                    <PlusIcon className="w-6 h-6 text-blue-400" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">No reports yet</p>
                  <p className="text-xs text-gray-400 mb-4">Be the first to report an issue in your area</p>
                  <button
                    onClick={() => router.push('/issues/new?role=' + (user?.role || ''))}
                    className="inline-flex items-center cursor-pointer gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    Report your first issue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}