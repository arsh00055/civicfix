'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/UI/cards/StatCard';
import QuickActions from '@/components/dashboard/widgets/QuickActions';
import Loading from '@/app/loading';
import Error from '@/app/error';
import RecentActivity from '@/components/dashboard/widgets/RecentActivity';
import { 
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@/components/UI/icons';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { fetchAdminDashboard, refreshAdminDashboard } from '@/lib/helpers/adminDashboard.helper';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeIssues: 0,
    resolvedThisWeek: 0,
    systemHealth: 0,
    newRegistrations: 0,
    activeVolunteers: 0,
    totalIssues: 0,
    pendingIssues: 0,
  });
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [pendingIssues, setPendingIssues] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user && user.role === 'admin') {
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const dashboardData = await fetchAdminDashboard();

      setStats({
        totalUsers: dashboardData.stats.totalUsers,
        activeIssues: dashboardData.stats.activeIssues,
        resolvedThisWeek: dashboardData.stats.resolvedThisWeek,
        systemHealth: dashboardData.stats.systemHealth,
        newRegistrations: dashboardData.stats.newRegistrations,
        activeVolunteers: dashboardData.stats.activeVolunteers,
        totalIssues: dashboardData.stats.totalIssues,
        pendingIssues: dashboardData.stats.pendingIssues,
      });
      
      setSystemAlerts(dashboardData.systemAlerts);
      setRecentNotifications(dashboardData.recentNotifications);
      setPendingIssues(dashboardData.pendingIssues);
      setRecentUsers(dashboardData.recentUsers);

    } catch (err: any) {
      console.error('Failed to load admin dashboard:', err);
      setError(err.message || 'Failed to load dashboard data. Please try again.');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const dashboardData = await refreshAdminDashboard();
      
      setStats({
        totalUsers: dashboardData.stats.totalUsers,
        activeIssues: dashboardData.stats.activeIssues,
        resolvedThisWeek: dashboardData.stats.resolvedThisWeek,
        systemHealth: dashboardData.stats.systemHealth,
        newRegistrations: dashboardData.stats.newRegistrations,
        activeVolunteers: dashboardData.stats.activeVolunteers,
        totalIssues: dashboardData.stats.totalIssues,
        pendingIssues: dashboardData.stats.pendingIssues,
      });
      
      setSystemAlerts(dashboardData.systemAlerts);
      setRecentNotifications(dashboardData.recentNotifications);
      setPendingIssues(dashboardData.pendingIssues);
      setRecentUsers(dashboardData.recentUsers);
      
      toast.success('Dashboard refreshed');
    } catch (err) {
      console.error('Failed to refresh dashboard:', err);
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReviewIssues = () => {
    router.push('/admin/issues');
  };

  const handleViewUsers = () => {
    router.push('/admin/user-management');
  };

  const handleViewAnalytics = () => {
    router.push('/admin/analytics');
  };

  const handleResolveAlert = async (alertId: string) => {
    // Mark alert as resolved (you can implement API call)
    setSystemAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast.success('Alert dismissed');
  };

  const formatRelativeTime = (dateString: string): string => {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (authLoading) {
    return null;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading />
      </div>
    );
  }

  if (error && stats.totalUsers === 0) {
    return (<Error error={error as unknown as Error & { digest?: string }} reset={loadDashboardData} />);
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!
            </h1>
            <p className="text-purple-100">
              {stats.systemHealth >= 95
                ? `System health is excellent at ${stats.systemHealth}%. ${stats.totalUsers} users active.`
                : 'Your oversight keeps the system running smoothly.'
              }
            </p>
          </div>
          {stats.systemHealth >= 95 && (
            <div className="bg-white/20 rounded-lg px-3 py-2">
              <span className="text-sm font-medium">🚀 Optimal</span>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toString()}
          icon={UsersIcon}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Active Issues"
          value={stats.activeIssues.toString()}
          icon={ExclamationTriangleIcon}
          trend={{ value: stats.activeIssues > 30 ? 12 : -5, isPositive: stats.activeIssues <= 30 }}
        />
        <StatCard
          title="Resolved (Week)"
          value={stats.resolvedThisWeek.toString()}
          icon={ChartBarIcon}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="System Health"
          value={`${stats.systemHealth}%`}
          icon={ShieldCheckIcon}
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="New Registrations"
          value={stats.newRegistrations.toString()}
          icon={UserPlusIcon}
          description="This week"
        />
        <StatCard
          title="Active Volunteers"
          value={stats.activeVolunteers.toString()}
          icon={UsersIcon}
          description="Currently helping"
        />
        <StatCard
          title="Total Issues"
          value={stats.totalIssues.toString()}
          icon={ChartBarIcon}
          description="All time"
        />
        <StatCard
          title="Pending Review"
          value={stats.pendingIssues.toString()}
          icon={ClockIcon}
          description="Awaiting action"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions & Recent Activity */}
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

        {/* Right Column - System Alerts & Pending Issues */}
        <div className="lg:col-span-2 space-y-6">
          {/* System Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <div className="space-y-4">
              {systemAlerts.length > 0 ? (
                systemAlerts.map(alert => (
                  <div key={alert.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{alert.message}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatRelativeTime(alert.timestamp)} • {alert.severity}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          alert.severity === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.severity}
                        </span>
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="text-gray-400 hover:text-gray-600"
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
                  <p className="text-lg font-medium text-gray-600">No system alerts</p>
                  <p className="text-sm text-gray-500">All systems are operating normally</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Review Issues */}
          {pendingIssues.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Pending Review</h2>
                <button
                  onClick={handleReviewIssues}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {pendingIssues.slice(0, 5).map(issue => (
                  <div key={issue.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{issue.title}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{issue.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>Reported by {issue.reporter}</span>
                          <span>{formatRelativeTime(issue.reportedAt)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/admin/issues?issueId=${issue.id}`)}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                <button
                  onClick={handleViewUsers}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {recentUsers.slice(0, 5).map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">
                          {user.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'volunteer' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(user.createdAt)}
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