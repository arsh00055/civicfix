'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/UI/cards/StatCard';
import QuickActions from '@/components/dashboard/widgets/QuickActions';
import Loading from '@/app/loading';
import Error from '@/app/error';
import RecentActivity from '@/components/dashboard/widgets/RecentActivity';
import {
  UsersIcon, ChartBarIcon, ExclamationTriangleIcon, ShieldCheckIcon,
  UserPlusIcon, CheckCircleIcon, ClockIcon,
} from '@/components/UI/icons';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  fetchAdminDashboard,
  refreshAdminDashboard,
} from '@/lib/helpers/adminDashboard.helper';
import { toast } from 'sonner';
import { formatRelativeTime } from '@/lib/helpers/dashboardUtils';
import { AdminDashboardStats } from '@/types/admin.types';


const DEFAULT_STATS: AdminDashboardStats = Object.freeze({
  totalUsers:       0,
  activeUsers:      0,
  totalIssues:      0,
  activeIssues:     0,
  resolvedIssues:   0,
  resolvedThisWeek: 0,
  pendingIssues:    0,
  systemHealth:     0,
  newRegistrations: 0,
  activeVolunteers: 0,
  userTrend:        Object.freeze({ value: 0, isPositive: true }),
  issueTrend:       Object.freeze({ value: 0, isPositive: true }),
  resolutionTrend:  Object.freeze({ value: 0, isPositive: true }),
});

const SEVERITY_CLASSES: Record<string, string> = Object.freeze({
  warning: 'bg-yellow-100 text-yellow-800',
  error:   'bg-red-100 text-red-800',
  info:    'bg-blue-100 text-blue-800',
});

function parseDashboardData(d: any) {
  return {
    stats: {
      totalUsers:       d.stats.totalUsers,
      activeUsers:      d.stats.activeUsers,
      totalIssues:      d.stats.totalIssues,
      activeIssues:     d.stats.activeIssues,
      resolvedIssues:   d.stats.resolvedIssues,
      resolvedThisWeek: d.stats.resolvedThisWeek,
      pendingIssues:    d.stats.pendingIssues,
      systemHealth:     d.stats.systemHealth,
      newRegistrations: d.stats.newRegistrations,
      activeVolunteers: d.stats.activeVolunteers,
      userTrend:        d.stats.userTrend,
      issueTrend:       d.stats.issueTrend,
      resolutionTrend:  d.stats.resolutionTrend,
    } as AdminDashboardStats,
    systemAlerts:        d.systemAlerts        ?? [],
    recentNotifications: d.recentNotifications ?? [],
    pendingIssues:       d.pendingIssues       ?? [],
    recentUsers:         d.recentUsers         ?? [],
  };
}


export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [stats, setStats]                             = useState<AdminDashboardStats>(DEFAULT_STATS);
  const [systemAlerts, setSystemAlerts]               = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [pendingIssues, setPendingIssues]             = useState<any[]>([]);
  const [recentUsers, setRecentUsers]                 = useState<any[]>([]);
  const [isLoading, setIsLoading]                     = useState(true);
  const [error, setError]                             = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing]               = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user?.role === 'admin') loadDashboardData();
  }, [user, authLoading, router]);

  const applyDashboardData = useCallback((raw: any) => {
    const d = parseDashboardData(raw);
    setStats(d.stats);
    setSystemAlerts(d.systemAlerts);
    setRecentNotifications(d.recentNotifications);
    setPendingIssues(d.pendingIssues);
    setRecentUsers(d.recentUsers);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      applyDashboardData(await fetchAdminDashboard());
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
      toast.error('Failed to load dashboard data');
      setStats(DEFAULT_STATS); // reuses frozen constant — zero allocation
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      applyDashboardData(await refreshAdminDashboard()); // same path as load
      toast.success('Dashboard refreshed');
    } catch {
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  // FIX 3: useCallback — stable reference, no re-creation on unrelated renders
  const handleResolveAlert = useCallback((alertId: string) => {
    setSystemAlerts(prev => prev.filter(a => a.id !== alertId));
    toast.success('Alert dismissed');
  }, []);

  if (authLoading) return null;
  if (!user || user.role !== 'admin') return null;
  if (isLoading) return <Loading isLoading={true} mode="page" message="Loading..." />;
  if (error && stats.totalUsers === 0) {
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
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!
            </h1>
            <p className="text-purple-100 text-sm sm:text-base">
              {stats.systemHealth >= 95
                ? `System health is excellent at ${stats.systemHealth}%. ${stats.totalUsers} users active.`
                : 'Your oversight keeps the system running smoothly.'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {stats.systemHealth >= 95 && (
              <div className="bg-white/20 rounded-lg px-3 py-2">
                <span className="text-sm font-medium">🚀 Optimal</span>
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-white/10 cursor-pointer hover:bg-white/20 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="Total Users"      value={stats.totalUsers.toString()}       icon={UsersIcon}              trend={{ value: 8, isPositive: true }} />
        <StatCard title="Active Issues"    value={stats.activeIssues.toString()}     icon={ExclamationTriangleIcon} trend={stats.issueTrend} />
        <StatCard title="Resolved (Week)"  value={stats.resolvedThisWeek.toString()} icon={ChartBarIcon}            trend={{ value: 15, isPositive: true }} />
        <StatCard title="System Health"    value={`${stats.systemHealth}%`}          icon={ShieldCheckIcon} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="New Registrations" value={stats.newRegistrations.toString()} icon={UserPlusIcon}  description="This week" />
        <StatCard title="Active Volunteers" value={stats.activeVolunteers.toString()} icon={UsersIcon}     description="Currently helping" />
        <StatCard title="Total Issues"      value={stats.totalIssues.toString()}      icon={ChartBarIcon}  description="All time" />
        <StatCard title="Pending Review"    value={stats.pendingIssues.toString()}    icon={ClockIcon}     description="Awaiting action" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-8">
          <QuickActions userRole="admin" />
          <RecentActivity
            notifications={recentNotifications}
            loading={isLoading}
            error={error}
            onRefresh={handleRefresh}
            onViewAll={() => router.push('/notifications')}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* System Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">System Alerts</h2>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-sm text-purple-600 cursor-pointer hover:text-purple-700 font-medium disabled:opacity-50"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <div className="space-y-4">
              {systemAlerts.length > 0 ? (
                systemAlerts.map(alert => (
                  <div key={alert.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 break-words">{alert.message}</p>
                        {/* FIX 2: formatRelativeTime from shared module — not redefined here */}
                        <p className="text-sm text-gray-500 mt-1">
                          {formatRelativeTime(alert.timestamp)} • {alert.severity}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {/* FIX: lookup instead of ternary chain in JSX */}
                        <span className={`px-2 py-1 text-xs rounded-full ${SEVERITY_CLASSES[alert.severity] ?? SEVERITY_CLASSES.info}`}>
                          {alert.severity}
                        </span>
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="text-gray-400 cursor-pointer hover:text-gray-600"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShieldCheckIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-base sm:text-lg font-medium text-gray-600">No system alerts</p>
                  <p className="text-sm text-gray-500">All systems are operating normally</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Review */}
          {pendingIssues.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Pending Review</h2>
                <button
                  onClick={() => router.push('/admin/issues')}
                  className="text-sm text-purple-600 cursor-pointer hover:text-purple-700 font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {pendingIssues.slice(0, 5).map(issue => (
                  <div
                    key={issue.id}
                    className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{issue.title}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{issue.description}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>Reported by {issue.reporter}</span>
                          {/* FIX 2: shared formatRelativeTime */}
                          <span>{formatRelativeTime(issue.reportedAt)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/admin/issues?issueId=${issue.id}`)}
                        className="flex-shrink-0 px-3 cursor-pointer py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Users */}
          {recentUsers.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Users</h2>
                <button
                  onClick={() => router.push('/admin/user-management')}
                  className="text-sm text-purple-600 cursor-pointer hover:text-purple-700 font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {recentUsers.slice(0, 5).map((u: any) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-purple-600">
                          {u.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{u.name}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* FIX: role → class lookup table defined at module level */}
                      <span className={`text-xs px-2 py-1 rounded-full ${ROLE_CLASSES[u.role] ?? ROLE_CLASSES.citizen}`}>
                        {u.role}
                      </span>
                      {/* FIX 2: shared formatRelativeTime */}
                      <span className="text-xs text-gray-400 hidden sm:inline">
                        {formatRelativeTime(u.createdAt)}
                      </span>
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

// Defined at module scope — not reconstructed inside JSX on every render
const ROLE_CLASSES: Record<string, string> = Object.freeze({
  admin:     'bg-purple-100 text-purple-700',
  volunteer: 'bg-green-100 text-green-700',
  citizen:   'bg-blue-100 text-blue-700',
});