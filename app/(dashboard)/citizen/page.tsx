'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
import { fetchCitizenDashboard, refreshCitizenDashboard } from '@/lib/helpers/citizenDashboard.helper'
import { issuesAPI } from '@/lib/services/api/endpoints'
import { toast } from 'sonner'
import { ClockIcon, UserIcon } from 'lucide-react'

interface DashboardStats {
  reportsSubmitted: number;
  issuesResolved: number;
  achievementsEarned: number;
  communityRank: string;
  communityImpact: string;
  totalVotes: number;
  totalComments: number;
  activeVolunteers: number;
  resolutionRate: number;
  averageResolutionTime: string;
  pendingIssues: number;
  totalCommunityIssues: number;
  thisWeekReports: number;
  thisWeekResolved: number;
}

export default function CitizenDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    reportsSubmitted: 0,
    issuesResolved: 0,
    achievementsEarned: 0,
    communityRank: 'Citizen',
    communityImpact: '0%',
    totalVotes: 0,
    totalComments: 0,
    activeVolunteers: 0,
    resolutionRate: 0,
    averageResolutionTime: 'N/A',
    pendingIssues: 0,
    totalCommunityIssues: 0,
    thisWeekReports: 0,
    thisWeekResolved: 0
  });
  const [myReports, setMyReports] = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [voteStatusMap, setVoteStatusMap] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role === 'citizen') {
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      setError(null);
      const dashboardData = await fetchCitizenDashboard(user.id);
      setStats({
        reportsSubmitted: dashboardData.stats.reportsSubmitted ?? 0,
        issuesResolved: dashboardData.stats.issuesResolved ?? 0,
        achievementsEarned: dashboardData.stats.achievementsEarned ?? 0,
        communityRank: dashboardData.stats.communityRank ?? 'Citizen',
        communityImpact: dashboardData.stats.communityImpact ?? '0%',
        totalVotes: dashboardData.stats.totalVotes ?? 0,
        totalComments: dashboardData.stats.totalComments ?? 0,
        activeVolunteers: dashboardData.stats.activeVolunteers ?? 0,
        resolutionRate: dashboardData.stats.resolutionRate ?? 0,
        averageResolutionTime: dashboardData.stats.averageResolutionTime ?? 'N/A',
        pendingIssues: dashboardData.stats.pendingIssues ?? 0,
        totalCommunityIssues: dashboardData.stats.totalCommunityIssues ?? 0,
        thisWeekReports: dashboardData.stats.thisWeekReports ?? 0,
        thisWeekResolved: dashboardData.stats.thisWeekResolved ?? 0,
      });
      setMyReports(dashboardData.myReports ?? []);
      setRecentNotifications(dashboardData.recentNotifications ?? []);
      if (user) {
        const newVoteMap = new Map<string, boolean>();
        dashboardData.myReports?.forEach((report: any) => {
          newVoteMap.set(report.id, report.voters?.includes(user.id) || false);
        });
        setVoteStatusMap(newVoteMap);
      }
    } catch (err: any) {
      console.error('Failed to load citizen dashboard:', err);
      setError(err.message || 'Failed to load dashboard data. Please try again.');
      toast.error('Failed to load dashboard data');
      setStats({ reportsSubmitted: 0, issuesResolved: 0, achievementsEarned: 0, communityRank: 'Citizen', communityImpact: '0%', totalVotes: 0, totalComments: 0, activeVolunteers: 0, resolutionRate: 0, averageResolutionTime: 'N/A', pendingIssues: 0, totalCommunityIssues: 0, thisWeekReports: 0, thisWeekResolved: 0 });
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
      const dashboardData = await refreshCitizenDashboard(user.id);
      setStats({
        reportsSubmitted: dashboardData.stats.reportsSubmitted ?? 0,
        issuesResolved: dashboardData.stats.issuesResolved ?? 0,
        achievementsEarned: dashboardData.stats.achievementsEarned ?? 0,
        communityRank: dashboardData.stats.communityRank ?? 'Citizen',
        communityImpact: dashboardData.stats.communityImpact ?? '0%',
        totalVotes: dashboardData.stats.totalVotes ?? 0,
        totalComments: dashboardData.stats.totalComments ?? 0,
        activeVolunteers: dashboardData.stats.activeVolunteers ?? 0,
        resolutionRate: dashboardData.stats.resolutionRate ?? 0,
        averageResolutionTime: dashboardData.stats.averageResolutionTime ?? 'N/A',
        pendingIssues: dashboardData.stats.pendingIssues ?? 0,
        totalCommunityIssues: dashboardData.stats.totalCommunityIssues ?? 0,
        thisWeekReports: dashboardData.stats.thisWeekReports ?? 0,
        thisWeekResolved: dashboardData.stats.thisWeekResolved ?? 0,
      });
      setMyReports(dashboardData.myReports ?? []);
      setRecentNotifications(dashboardData.recentNotifications ?? []);
      if (user) {
        const newVoteMap = new Map<string, boolean>();
        dashboardData.myReports?.forEach((report: any) => {
          newVoteMap.set(report.id, report.voters?.includes(user.id) || false);
        });
        setVoteStatusMap(newVoteMap);
      }
      toast.success('Dashboard refreshed');
    } catch (err) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleVote = async (issueId: string) => {
    if (!user?.id) { toast.warning('Please login to vote'); router.push('/login'); return; }
    try {
      const response = await issuesAPI.voteIssue(issueId);
      const result = response.data;
      setMyReports(prev => prev.map(report => {
        if (report.id === issueId) {
          return { ...report, upvotes: result.upvotes, voters: result.voted ? [...(report.voters || []), user.id] : (report.voters || []).filter((v: string) => v !== user.id) };
        }
        return report;
      }));
      setVoteStatusMap(prev => { const m = new Map(prev); m.set(issueId, result.voted); return m; });
      toast.success(result.voted ? 'Vote added!' : 'Vote removed');
    } catch {
      toast.error('Failed to vote. Please try again.');
    }
  };

  const handleIssueUpdate = () => loadDashboardData();

  const handleReportIssue = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/issues/new?role=' + (user?.role || ''));
  };

  const hasUserVoted = useCallback((issueId: string): boolean => voteStatusMap.get(issueId) || false, [voteStatusMap]);

  if (authLoading) return null;
  if (!user || user.role !== 'citizen') return null;
  if (isLoading) return <div className="space-y-6"><Loading /></div>;
  if (error && stats.reportsSubmitted === 0) return <Error error={error as unknown as Error & { digest?: string | undefined }} reset={loadDashboardData} />;

  return (
    <div className="space-y-6">
      {/* FIX: Welcome banner — flex-col on mobile, row on sm+ */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* FIX: text-xl on mobile, text-2xl on sm+ */}
            <h1 className="text-xl sm:text-2xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Citizen'}!
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              {stats.reportsSubmitted > 0
                ? `You've contributed ${stats.reportsSubmitted} issues to our community. Thank you!`
                : 'Glad to see you again! Together we can make our community better.'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
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
      </div>

      {/* Personal Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="Reports Submitted" value={stats.reportsSubmitted.toString()} icon={PlusIcon} trend={{ value: stats.reportsSubmitted > 0 ? 15 : 0, isPositive: true }} />
        <StatCard title="Issues Resolved" value={stats.issuesResolved.toString()} icon={CheckCircleIcon} trend={{ value: stats.issuesResolved > 0 ? 10 : 0, isPositive: true }} />
        <StatCard title="Achievements" value={stats.achievementsEarned.toString()} icon={HomeIcon} />
        <StatCard title="Community Impact" value={stats.communityImpact} icon={MapIcon} />
      </div>

      {/* Community Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="Active Volunteers" value={stats.activeVolunteers.toString()} icon={UserIcon} description="Helping our community" />
        <StatCard title="Resolution Rate" value={`${stats.resolutionRate}%`} icon={CheckCircleIcon} description={`${stats.thisWeekResolved} resolved this week`} trend={{ value: stats.resolutionRate, isPositive: stats.resolutionRate > 50 }} />
        <StatCard title="Avg Resolution Time" value={stats.averageResolutionTime} icon={ClockIcon} description="From report to resolution" />
        <StatCard title="Community Issues" value={stats.totalCommunityIssues.toString()} icon={ExclamationTriangleIcon} description={`${stats.pendingIssues} pending · ${stats.thisWeekReports} new this week`} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-8">
          <QuickActions userRole="citizen" />
          <RecentActivity notifications={recentNotifications} loading={isLoading} error={error} onRefresh={handleRefresh} onViewAll={() => router.push('/notifications')} />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Your Recent Reports</h2>
              <button onClick={handleRefresh} disabled={isRefreshing} className="text-sm text-blue-600 cursor-pointer hover:text-blue-700 font-medium disabled:opacity-50">
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
                    onUpdate={handleIssueUpdate}
                    showActions={false}
                    showVoting={true}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <PlusIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-base sm:text-lg font-medium text-gray-600">No issues reported yet</p>
                  <p className="text-sm text-gray-500 mb-4">Start contributing to your community</p>
                  <button onClick={handleReportIssue} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
