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
import { fetchVolunteerDashboard, refreshVolunteerDashboard } from '@/lib/helpers/volunteerDashboard.helper';
import { volunteersAPI } from '@/lib/services/api/endpoints';
import { toast } from 'sonner';

export default function VolunteerDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState({ completedTasks: 0, activeTasks: 0, totalClaimed: 0, responseTime: 'N/A', rating: '0.0', communityRank: 'Volunteer', points: 0, level: 1 });
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [myAssignments, setMyAssignments] = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && user.role === 'volunteer') loadDashboardData();
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true); setError(null);
      const d = await fetchVolunteerDashboard(user.id);
      setStats({ completedTasks: d.stats.completedTasks, activeTasks: d.stats.activeTasks, totalClaimed: d.stats.totalClaimed, responseTime: d.stats.responseTime, rating: d.stats.rating, communityRank: d.stats.communityRank, points: d.stats.points, level: d.stats.level });
      setAvailableTasks(d.availableTasks);
      setMyAssignments(d.myAssignments);
      setRecentNotifications(d.recentNotifications);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
      toast.error('Failed to load dashboard data');
    } finally { setIsLoading(false); }
  };

  const handleRefresh = async () => {
    if (!user?.id || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const d = await refreshVolunteerDashboard(user.id);
      setStats({ completedTasks: d.stats.completedTasks, activeTasks: d.stats.activeTasks, totalClaimed: d.stats.totalClaimed, responseTime: d.stats.responseTime, rating: d.stats.rating, communityRank: d.stats.communityRank, points: d.stats.points, level: d.stats.level });
      setAvailableTasks(d.availableTasks);
      setMyAssignments(d.myAssignments);
      setRecentNotifications(d.recentNotifications);
      toast.success('Dashboard refreshed');
    } catch { toast.error('Failed to refresh dashboard'); }
    finally { setIsRefreshing(false); }
  };

  const handleTaskClaim = async (taskId: string) => {
    try {
      await volunteersAPI.claimTask(taskId);
      toast.success('Task claimed successfully!');
      await loadDashboardData();
    } catch (err: any) { toast.error(err?.message || 'Failed to claim task.'); }
  };

  const handleIssueUpdate = () => loadDashboardData();

  const formatRelativeTime = (dateString: string): string => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString), now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    const diffHours = Math.floor(diffMins / 60), diffDays = Math.floor(diffMins / 1440);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (authLoading) return null;
  if (!user || user.role !== 'volunteer') return null;
  if (isLoading) return <div className="space-y-6"><Loading /></div>;
  if (error && stats.completedTasks === 0) return <Error error={error as unknown as Error & { digest?: string }} reset={loadDashboardData} />;

  return (
    <div className="space-y-6">
      {/* FIX: Welcome banner — flex-col on mobile, row on sm+ */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* FIX: text-xl on mobile */}
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
            <button onClick={handleRefresh} disabled={isRefreshing} className="bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50">
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="Completed Tasks" value={stats.completedTasks.toString()} icon={CheckCircleIcon} trend={{ value: stats.completedTasks > 0 ? 12 : 0, isPositive: true }} />
        <StatCard title="Active Tasks" value={stats.activeTasks.toString()} icon={ClockIcon} />
        <StatCard title="Total Claimed" value={stats.totalClaimed.toString()} icon={UserGroupIcon} />
        <StatCard title="Volunteer Rating" value={stats.rating} icon={StarIcon} description={`Level ${stats.level} · ${stats.points} pts`} trend={{ value: parseFloat(stats.rating) > 4 ? 0.3 : 0, isPositive: true }} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-8">
          <QuickActions userRole="volunteer" />
          <RecentActivity notifications={recentNotifications} loading={isLoading} error={error} onRefresh={handleRefresh} onViewAll={() => router.push('/notifications')} />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Available Tasks</h2>
              <button onClick={handleRefresh} disabled={isRefreshing} className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <div className="space-y-4">
              {availableTasks.length > 0 ? (
                availableTasks.map(task => (
                  <IssueCard
                    key={task.id}
                    issue={{ id: task.id, title: task.title, description: task.description || '', status: 'reported', priority: task.priority || 'medium', category: task.category || 'general', location: task.location || '', latitude: task.latitude ?? 0, longitude: task.longitude ?? 0, images: task.images || [], upvotes: task.upvotes || 0, voters: [], views: 0, commentsCount: 0, comments: [], reporterId: task.reporterId || '', reporter: task.reporter ? { id: task.reporter.id || task.reporterId || '', name: task.reporter.name || task.reportedBy || 'Community Member', avatar: task.reporter.avatar, email: task.reporter.email, phone: task.reporter.phone } : { id: task.reporterId || '', name: task.reportedBy || 'Community Member' }, assignedTo: undefined, createdAt: task.reportedAt || task.createdAt || new Date().toISOString(), updatedAt: task.updatedAt || task.createdAt || new Date().toISOString(), reportedAt: task.reportedAt || task.createdAt || new Date().toISOString() }}
                    onUpdate={handleIssueUpdate}
                    showClaimButton={true}
                    onClaim={handleTaskClaim}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-base sm:text-lg font-medium text-gray-600">No available tasks</p>
                  <p className="text-sm text-gray-500 mb-4">All current tasks have been claimed</p>
                  <button onClick={() => router.push('/tasks/available')} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Check for New Tasks
                  </button>
                </div>
              )}
            </div>
          </div>

          {myAssignments.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">My Active Assignments</h2>
                <button onClick={() => router.push('/tasks/assignments')} className="text-sm text-green-600 hover:text-green-700 font-medium">View All →</button>
              </div>
              <div className="space-y-4">
                {myAssignments.slice(0, 3).map(assignment => (
                  <div key={assignment.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{assignment.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{assignment.description}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>Claimed {formatRelativeTime(assignment.claimedAt)}</span>
                          <span className="capitalize">{assignment.status?.replace('_', ' ') || 'Assigned'}</span>
                        </div>
                      </div>
                      <button onClick={() => router.push(`/issues/${assignment.taskId}?role=volunteer`)} className="flex-shrink-0 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
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
