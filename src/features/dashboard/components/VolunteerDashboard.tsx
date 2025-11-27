import React, { useState, useEffect } from 'react';
import StatCard from '../../../components/UI/cards/StatCard';
import IssueCard from '../../../components/UI/cards/IssueCard';
import QuickActions from '../widgets/QuickActions';
import RecentActivity from '../widgets/RecentActivity';
import TaskBoard from '../widgets/TaskBoard';
import { 
  WrenchIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  UserGroupIcon,
  ExclamationTriangleIcon
} from '../../../components/UI/icons';
import { dashboardAPI, volunteersAPI} from '../../../services/api/endpoints';
import type { Issue, VolunteerStats } from '../../../types';

interface VolunteerProps {
  role: string | null;
}

const VolunteerDashboard: React.FC<VolunteerProps> = ({ role }) => {
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [availableTasks, setAvailableTasks] = useState<Issue[]>([]);
  const [myAssignments, setMyAssignments] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all volunteer data in parallel
      const [dashboardResponse, tasksResponse, assignmentsResponse] = await Promise.all([
        dashboardAPI.getVolunteerDashboard(),
        volunteersAPI.getAvailableTasks(),
        volunteersAPI.getMyAssignments()
      ]);

      const dashboardData = dashboardResponse.data;
      const availableTasksData = tasksResponse.data;
      const assignmentsData = assignmentsResponse.data;

      setStats(dashboardData);
      setAvailableTasks(availableTasksData);
      setMyAssignments(assignmentsData);

    } catch (err) {
      console.error('Failed to load volunteer dashboard:', err);
      setError('Failed to load dashboard data. Please try again.');
      
      // Set fallback data
      setStats({
        completedTasks: 0,
        activeTasks: 0,
        responseTime: '0h',
        rating: '0.0',
        completionRate: 0
      });
      setAvailableTasks([]);
      setMyAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskClaim = async (taskId: string) => {
    try {
      await volunteersAPI.claimTask(taskId);
      // Refresh data to reflect the change
      loadDashboardData();
    } catch (err) {
      console.error('Failed to claim task:', err);
      alert('Failed to claim task. Please try again.');
    }
  };

  const getCompletionRateTrend = (completionRate: number) => {
    if (completionRate >= 90) return { value: 5, isPositive: true };
    if (completionRate >= 75) return { value: 2, isPositive: true };
    if (completionRate >= 50) return { value: 0, isPositive: true };
    return { value: -5, isPositive: false };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 text-white animate-pulse">
          <div className="h-6 bg-green-500 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-green-500 rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h2>
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadDashboardData}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, Volunteer!</h1>
            <p className="text-green-100">
              {stats && stats.completedTasks > 0 
                ? `You've completed ${stats.completedTasks} tasks. Thank you for your service!`
                : 'Thank you for helping make our community better. Your efforts are appreciated!'
              }
            </p>
          </div>
          {stats && parseFloat(stats.rating) >= 4.5 && (
            <div className="bg-white/20 rounded-lg px-3 py-2">
              <span className="text-sm font-medium">⭐ Top Volunteer</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Completed Tasks"
          value={stats?.completedTasks.toString() || '0'}
          icon={CheckCircleIcon}
          trend={stats?.completionRate ? getCompletionRateTrend(stats.completionRate) : undefined}
          
        />
        <StatCard
          title="Active Tasks"
          value={stats?.activeTasks.toString() || '0'}
          icon={WrenchIcon}
          
        />
        <StatCard
          title="Avg Response Time"
          value={stats?.responseTime || '0h'}
          icon={ClockIcon}
          
        />
        <StatCard
          title="Volunteer Rating"
          value={stats?.rating || '0.0'}
          icon={UserGroupIcon}
          
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions & Task Board */}
        <div className="lg:col-span-1 space-y-8">
          <QuickActions userRole={role} />
          <TaskBoard />
          <RecentActivity />
        </div>

        {/* Available Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Tasks ({availableTasks.length})
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={loadDashboardData}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Refresh
                </button>
                <span className="text-sm text-gray-500">
                  {myAssignments.length} assigned to you
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {availableTasks.map(task => (
                <IssueCard 
                  key={task.id} 
                  issue={task} 
                  showClaimButton={true}
                  onClaim={handleTaskClaim}
                  onUpdate={loadDashboardData}
                />
              ))}
              {availableTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-lg font-medium text-gray-600">No available tasks</p>
                  <p className="text-sm text-gray-500">
                    Great job! All current tasks have been claimed.
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Check back later for new opportunities to help.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;