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
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
} from '@/components/UI/icons';
import { useAuth } from '@/features/auth/hooks/useAuth';
import apiClient from '@/lib/services/api/client';

interface VolunteerStats {
  completedTasks: number;
  activeTasks: number;
  responseTime: string;
  rating: string;
  communityRank: string;
}

export default function VolunteerDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user && user.role === 'volunteer') {
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const dashboardResponse = await apiClient.get('/dashboard/volunteer');
      const dashboardData = dashboardResponse.data || dashboardResponse;

      setStats({
        completedTasks: dashboardData.stats?.completedTasks || 0,
        activeTasks: dashboardData.stats?.activeTasks || 0,
        responseTime: dashboardData.stats?.responseTime || '0h',
        rating: dashboardData.stats?.rating || '0.0',
        communityRank: dashboardData.stats?.communityRank || 'Volunteer'
      });
      
      setAvailableTasks(dashboardData.availableTasks || []);
      setRecentActivity(dashboardData.recentActivity || []);

    } catch (err: any) {
      console.error('Failed to load volunteer dashboard:', err);
      setError(err.message || 'Failed to load dashboard data. Please try again.');
      
      // Set fallback data on error
      setStats({
        completedTasks: 0,
        activeTasks: 0,
        responseTime: '0h',
        rating: '0.0',
        communityRank: 'Volunteer'
      });
      setAvailableTasks([]);
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskClaim = async (taskId: string) => {
    try {
      await apiClient.post(`/volunteers/tasks/${taskId}/claim`);
      
      // Refresh dashboard data
      loadDashboardData();
    } catch (err) {
      console.error('Failed to claim task:', err);
      setError('Failed to claim task. Please try again.');
    }
  };

  const handleIssueUpdate = () => {
    loadDashboardData();
  };

  const handleViewAvailableTasks = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/tasks/available');
  };

  // Don't show anything during auth check
  if (authLoading) {
    return null;
  }

  // If not authenticated or wrong role, don't show dashboard
  if (!user || user.role !== 'volunteer') {
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
      {/* Welcome Section - Exactly like Citizen but with green theme */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Volunteer'}!</h1>
            <p className="text-green-100">
              {stats && stats.completedTasks > 0 
                ? `You've completed ${stats.completedTasks} tasks. Thank you for your service!`
                : 'Thank you for helping make our community better. Your efforts are appreciated!'
              }
            </p>
          </div>
          {stats && parseFloat(stats.rating) >= 4.5 && (
            <div className="bg-white/20 rounded-lg px-3 py-2">
              <span className="text-sm font-medium">⭐ {stats.communityRank}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid - 4 cards like Citizen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Completed Tasks"
          value={stats?.completedTasks.toString() || '0'}
          icon={CheckCircleIcon}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Tasks"
          value={stats?.activeTasks.toString() || '0'}
          icon={ClockIcon}
        />
        <StatCard
          title="Avg Response Time"
          value={stats?.responseTime || '0h'}
          icon={UserGroupIcon}
        />
        <StatCard
          title="Volunteer Rating"
          value={stats?.rating || '0.0'}
          icon={StarIcon}
          trend={{ value: 0.3, isPositive: true }}
        />
      </div>

      {/* Main Content Grid - Exactly like Citizen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions & Recent Activity */}
        <div className="lg:col-span-1 space-y-8">
          <QuickActions userRole="volunteer" />
          <RecentActivity />
        </div>

        {/* Right Column - Available Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Available Tasks</h2>
              <button
                onClick={loadDashboardData}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-4">
              {availableTasks.length > 0 ? (
                availableTasks.map(task => (
                  <IssueCard 
                    key={task.id} 
                    issue={{
                      id: task.id,
                      title: task.title,
                      description: task.description || '',
                      status: task.status || 'reported',
                      views: task.views ?? 0,
                      commentsCount: task.commentsCount ?? 0,
                      reportedAt: task.reportedAt ?? task.createdAt ?? '',
                      priority: task.priority || 'medium',
                      category: task.category || 'general',
                      location: task.location || '',
                      createdAt: task.createdAt,
                      reporter: task.reporter || { name: 'Community Member' },
                      upvotes: task.votes || 0,
                      latitude: task.latitude ?? 0,
                      longitude: task.longitude ?? 0,
                      images: task.images || [],
                      reporterId: task.reporterId ?? '',
                      updatedAt: task.updatedAt ?? task.createdAt ?? '',
                      assignedTo: task.assignedTo ?? null
                    }}
                    onUpdate={handleIssueUpdate}
                    showClaimButton={true}
                    onClaim={handleTaskClaim}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-lg font-medium text-gray-600">No available tasks</p>
                  <p className="text-sm text-gray-500 mb-4">All current tasks have been claimed</p>
                  <button
                    onClick={handleViewAvailableTasks}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Check for New Tasks
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