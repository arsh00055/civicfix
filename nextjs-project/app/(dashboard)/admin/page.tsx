'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/UI/cards/StatCard';
import IssueCard from '@/components/UI/cards/IssueCard';
import QuickActions from '@/components/dashboard/widgets/QuickActions';
import Loading from '@/app/loading';
import Error from '@/app/error';
import RecentActivity from '@/components/dashboard/widgets/RecentActivity';
import { 
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from '@/components/UI/icons';
import type { Issue } from '@/types/issue.types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import apiClient from '@/lib/services/api/client';

interface AdminStats {
  totalUsers: number;
  activeIssues: number;
  resolvedThisWeek: number;
  systemHealth: number;
  newRegistrations: number;
  userTrend?: { value: number; isPositive: boolean };
  resolutionTrend?: { value: number; isPositive: boolean };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
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

      // Fetch admin dashboard data from API
      const dashboardResponse = await apiClient.get('/admin');
      const dashboardData = dashboardResponse.data || dashboardResponse;
      
      // Fetch admin stats separately
      const statsResponse = await apiClient.get('/admin/stats');
      const statsData = statsResponse.data || statsResponse;
      
      // Fetch recent activity
      const activityResponse = await apiClient.get('/activity/system');
      const activityData = activityResponse.data || activityResponse;

      // Combine data
      setStats({
        totalUsers: statsData.totalUsers || dashboardData.stats?.totalUsers || 0,
        activeIssues: dashboardData.stats?.activeIssues || 0,
        resolvedThisWeek: statsData.resolvedIssues || 0,
        systemHealth: parseInt(dashboardData.stats?.systemHealth?.replace('%', '') || '98'),
        newRegistrations: statsData.newUsersThisWeek || 0,
        userTrend: { value: 8, isPositive: true }, // Default trend
        resolutionTrend: { value: 15, isPositive: true } // Default trend
      });
      
      setSystemAlerts(dashboardData.systemAlerts || []);
      setRecentActivity(activityData.activities || dashboardData.recentActivity || []);

    } catch (err: any) {
      console.error('Failed to load admin dashboard:', err);
      setError(err.message || 'Failed to load dashboard data. Please try again.');
      
      // Set fallback data on error
      setStats({
        totalUsers: 0,
        activeIssues: 0,
        resolvedThisWeek: 0,
        systemHealth: 0,
        newRegistrations: 0
      });
      setSystemAlerts([]);
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIssueUpdate = () => {
    loadDashboardData();
  };

  const handleReviewIssues = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/admin/issues');
  };

  // Don't show anything during auth check
  if (authLoading) {
    return null;
  }

  // If not authenticated or wrong role, don't show dashboard
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

  if (error && !stats) {
    return (<Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />);
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section - Exactly like Citizen but with purple theme */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Admin'}!</h1>
            <p className="text-purple-100">
              {stats && stats.systemHealth >= 95
                ? `System health is excellent at ${stats.systemHealth}%. ${stats.totalUsers} users active.`
                : 'Your oversight keeps the system running smoothly.'
              }
            </p>
          </div>
          {stats && stats.systemHealth >= 95 && (
            <div className="bg-white/20 rounded-lg px-3 py-2">
              <span className="text-sm font-medium">🚀 Optimal</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid - 4 cards like Citizen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers.toString() || '0'}
          icon={UsersIcon}
          trend={stats?.userTrend}
        />
        <StatCard
          title="Active Issues"
          value={stats?.activeIssues.toString() || '0'}
          icon={ExclamationTriangleIcon}
        />
        <StatCard
          title="Resolved (Week)"
          value={stats?.resolvedThisWeek.toString() || '0'}
          icon={ChartBarIcon}
          trend={stats?.resolutionTrend}
        />
        <StatCard
          title="System Health"
          value={`${stats?.systemHealth || 0}%`}
          icon={ShieldCheckIcon}
        />
      </div>

      {/* Main Content Grid - Exactly like Citizen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions & Recent Activity */}
        <div className="lg:col-span-1 space-y-8">
          <QuickActions userRole="admin" />
          <RecentActivity />
        </div>

        {/* Right Column - System Alerts */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
              <button
                onClick={loadDashboardData}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-4">
              {systemAlerts.length > 0 ? (
                systemAlerts.map(alert => (
                  <div key={alert.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{alert.message}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(alert.timestamp).toLocaleDateString()} • {alert.severity}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        alert.severity === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShieldCheckIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-lg font-medium text-gray-600">No system alerts</p>
                  <p className="text-sm text-gray-500 mb-4">All systems are operating normally</p>
                  <button
                    onClick={handleReviewIssues}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Review Issue Queue
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