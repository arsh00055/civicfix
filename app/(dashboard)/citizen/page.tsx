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

type VoteState  = Record<string, boolean>;
type VoteAction = { issueId: string; voted: boolean };

function voteReducer(state: VoteState, action: VoteAction): VoteState {
  if (state[action.issueId] === action.voted) return state;
  return { ...state, [action.issueId]: action.voted };
}

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
});

function parseDashboardData(data: any, userId: string) {
  const s = data.stats;

  const voteStatusMap: VoteState = {};
  const myReports: any[] = data.myReports ?? [];
  for (const report of myReports) {
    voteStatusMap[report.id] = report.voters?.includes(userId) ?? false;
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
      thisWeekResolved:      s.thisWeekResolved      ?? 0,
    } as CitizenDashboardStats,
    myReports,
    recentNotifications: data.recentNotifications ?? [],
    voteStatusMap,
  };
}


export default function CitizenDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [stats, setStats]                             = useState<CitizenDashboardStats>(DEFAULT_STATS);
  const [myReports, setMyReports]                     = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [voteStatusMap, dispatchVote]                 = useReducer(voteReducer, {});
  const [isLoading, setIsLoading]                     = useState(true);
  const [error, setError]                             = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing]               = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user?.role === 'citizen') loadDashboardData();
  }, [user, authLoading, router]);

  const applyDashboardData = useCallback((raw: any) => {
    if (!user?.id) return;
    const parsed = parseDashboardData(raw, user.id);
    setStats(parsed.stats);
    setMyReports(parsed.myReports);
    setRecentNotifications(parsed.recentNotifications);
    for (const [issueId, voted] of Object.entries(parsed.voteStatusMap)) {
      dispatchVote({ issueId, voted: voted as boolean });
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      setError(null);
      applyDashboardData(await fetchCitizenDashboard(user.id));
    } catch (err: any) {
      console.error('Failed to load citizen dashboard:', err);
      setError(err.message || 'Failed to load dashboard data. Please try again.');
      toast.error('Failed to load dashboard data');
      setStats(DEFAULT_STATS); // reuses frozen constant — no allocation
      setMyReports([]);
      setRecentNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!user?.id || isRefreshing) return;
    setIsRefreshing(true);
    try {
      applyDashboardData(await refreshCitizenDashboard(user.id));
      toast.success('Dashboard refreshed');
    } catch {
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleVote = async (issueId: string) => {
    if (!user?.id) {
      toast.warning('Please login to vote');
      router.push('/login');
      return;
    }
    try {
      const { data: result } = await issuesAPI.voteIssue(issueId);

      setMyReports(prev =>
        prev.map(report =>
          report.id !== issueId
            ? report
            : {
                ...report,
                upvotes: result.upvotes,
                voters:  result.voted
                  ? [...(report.voters || []), user.id]
                  : (report.voters || []).filter((id: string) => id !== user.id),
              }
        )
      );

      dispatchVote({ issueId, voted: result.voted });
      toast.success(result.voted ? 'Vote added!' : 'Vote removed');
    } catch {
      toast.error('Failed to vote. Please try again.');
    }
  };

  const handleReportIssue = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/issues/new?role=' + (user?.role || ''));
  };

  const hasUserVoted = (issueId: string): boolean => voteStatusMap[issueId] ?? false;

  if (authLoading) return null;
  if (!user || user.role !== 'citizen') return null;
  if (isLoading) return <div className="space-y-6"><Loading /></div>;
  if (error && stats.reportsSubmitted === 0) {
    return (
      <Error
        error={error as unknown as Error & { digest?: string }}
        reset={loadDashboardData}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Citizen'}!
            </h1>
            <p className="text-blue-100">
              {stats.reportsSubmitted > 0
                ? `You've contributed ${stats.reportsSubmitted} issues to our community. Thank you!`
                : 'Glad to see you again! Together we can make our community better.'}
            </p>
          </div>
          {stats.communityRank === 'Top Contributor' && (
            <div className="bg-white/20 rounded-lg px-3 py-2">
              <span className="text-sm font-medium">🌟 {stats.communityRank}</span>
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Personal Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Reports Submitted"
          value={stats.reportsSubmitted.toString()}
          icon={PlusIcon}
          trend={{ value: stats.reportsSubmitted > 0 ? 15 : 0, isPositive: true }}
        />
        <StatCard
          title="Issues Resolved"
          value={stats.issuesResolved.toString()}
          icon={CheckCircleIcon}
          trend={{ value: stats.issuesResolved > 0 ? 10 : 0, isPositive: true }}
        />
        <StatCard
          title="Achievements"
          value={stats.achievementsEarned.toString()}
          icon={HomeIcon}
        />
        <StatCard
          title="Community Impact"
          value={stats.communityImpact}
          icon={MapIcon}
        />
      </div>

      {/* Community Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Volunteers"
          value={stats.activeVolunteers.toString()}
          icon={UserIcon}
          description="Helping our community"
        />
        <StatCard
          title="Resolution Rate"
          value={`${stats.resolutionRate}%`}
          icon={CheckCircleIcon}
          description={`${stats.thisWeekResolved} resolved this week`}
          trend={{ value: stats.resolutionRate, isPositive: stats.resolutionRate > 50 }}
        />
        <StatCard
          title="Avg Resolution Time"
          value={stats.averageResolutionTime}
          icon={ClockIcon}
          description="From report to resolution"
        />
        <StatCard
          title="Community Issues"
          value={stats.totalCommunityIssues.toString()}
          icon={ExclamationTriangleIcon}
          description={`${stats.pendingIssues} pending · ${stats.thisWeekReports} new this week`}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-8">
          <QuickActions userRole="citizen" />
          <RecentActivity
            notifications={recentNotifications}
            loading={isLoading}
            error={error}
            onRefresh={handleRefresh}
            onViewAll={() => router.push('/notifications')}
          />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Recent Reports</h2>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-sm text-blue-600 cursor-pointer hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <div className="space-y-8 flex flex-col">
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
                <div className="text-center py-8 text-gray-500">
                  <PlusIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-lg font-medium text-gray-600">No issues reported yet</p>
                  <p className="text-sm text-gray-500 mb-4">Start contributing to your community</p>
                  <button
                    onClick={handleReportIssue}
                    className="inline-flex items-center cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                    Report Your First Issue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}