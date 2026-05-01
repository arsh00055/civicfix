'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
});

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
  };
}

export default function VolunteerDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [stats, setStats]                             = useState<VolunteerDashboardStats>(DEFAULT_STATS);
  const [availableTasks, setAvailableTasks]           = useState<AvailableTask[]>([]);
  const [myAssignments, setMyAssignments]             = useState<Assignment[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading]                     = useState(true);
  const [error, setError]                             = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing]               = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user?.role === 'volunteer') loadDashboardData();
  }, [user, authLoading, router]);

  const applyDashboardData = useCallback((raw: any) => {
    const d = parseDashboardData(raw);
    setStats(d.stats);
    setAvailableTasks(d.availableTasks);
    setMyAssignments(d.myAssignments);
    setRecentNotifications(d.recentNotifications);
  }, []); // stable — no deps

  const loadDashboardData = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      setError(null);
      applyDashboardData(await fetchVolunteerDashboard(user.id));
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
      toast.error('Failed to load dashboard data');
      setStats(DEFAULT_STATS); // reuses frozen constant — no allocation
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!user?.id || isRefreshing) return;
    setIsRefreshing(true);
    try {
      applyDashboardData(await refreshVolunteerDashboard(user.id));
      toast.success('Dashboard refreshed');
    } catch {
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTaskClaim = async (taskId: string) => {
    try {
      await volunteersAPI.claimTask(taskId);
      toast.success('Task claimed successfully!');
      await loadDashboardData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to claim task.');
    }
  };

  if (authLoading) return null;
  if (!user || user.role !== 'volunteer') return null;
  if (isLoading) return <Loading isLoading={true} mode="page" message="Loading..." />;
  if (error && stats.completedTasks === 0) {
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
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Volunteer'}!
            </h1>
            <p className="text-green-100 text-sm sm:text-base">
              {stats.completedTasks > 0
                ? `You've completed ${stats.completedTasks} tasks. Thank you for your service!`
                : 'Thank you for helping make our community better!'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {parseFloat(stats.rating) >= 4.5 && (
              <div className="bg-white/20 rounded-lg px-3 py-2">
                <span className="text-sm font-medium">⭐ {stats.communityRank}</span>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks.toString()}
          icon={CheckCircleIcon}
          trend={{ value: stats.completedTasks > 0 ? 12 : 0, isPositive: true }}
        />
        <StatCard title="Active Tasks"   value={stats.activeTasks.toString()}  icon={ClockIcon} />
        <StatCard title="Total Claimed"  value={stats.totalClaimed.toString()} icon={UserGroupIcon} />
        <StatCard
          title="Volunteer Rating"
          value={stats.rating}
          icon={StarIcon}
          description={`Level ${stats.level} · ${stats.points} pts`}
          trend={{ value: parseFloat(stats.rating) > 4 ? 0.3 : 0, isPositive: true }}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-8">
          <QuickActions userRole="volunteer" />
          <RecentActivity
            notifications={recentNotifications}
            loading={isLoading}
            error={error}
            onRefresh={handleRefresh}
            onViewAll={() => router.push('/notifications')}
          />
        </div>

        <div className="lg:col-span-2">
          {/* Available Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Available Tasks</h2>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <div className="space-y-4">
              {availableTasks.length > 0 ? (
                availableTasks.map(task => (
                  <IssueCard
                    key={task.id}
                    issue={task as any}
                    onUpdate={loadDashboardData}
                    showClaimButton={true}
                    onClaim={handleTaskClaim}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-base sm:text-lg font-medium text-gray-600">No available tasks</p>
                  <p className="text-sm text-gray-500 mb-4">All current tasks have been claimed</p>
                  <button
                    onClick={() => router.push('/tasks/available')}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Check for New Tasks
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* My Active Assignments */}
          {myAssignments.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  My Active Assignments
                </h2>
                <button
                  onClick={() => router.push('/tasks/assignments')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {myAssignments.slice(0, 3).map(assignment => (
                  <div
                    key={assignment.id}
                    className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {assignment.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>Claimed {formatRelativeTime(assignment.claimedAt)}</span>
                          <span className="capitalize">
                            {assignment.status?.replace('_', ' ') || 'Assigned'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          router.push(`/issues/${assignment.taskId}?role=volunteer`)
                        }
                        className="flex-shrink-0 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}