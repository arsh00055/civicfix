import React, { useState, useEffect } from 'react';
import StatCard from '../../../components/UI/cards/StatCard';
import IssueCard from '../../../components/UI/cards/IssueCard';
import QuickActions from '../widgets/QuickActions';
import RecentActivity from '../widgets/RecentActivity';
import { 
  HomeIcon, 
  MapIcon, 
  PlusIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '../../../components/UI/icons';
import { dashboardAPI, issuesAPI, analyticsAPI } from '../../../services/api/endpoints';
import type { Issue } from '../../../types';

interface CitizenProps {
  role: string | null;
}

interface CitizenStats {
  reportedIssues: number;
  resolvedIssues: number;
  activeIssues: number;
  communityScore: number;
  issueTrend?: { value: number; isPositive: boolean };
  resolutionTrend?: { value: number; isPositive: boolean };
}

const CitizenDashboard: React.FC<CitizenProps> = ({ role }) => {
  const [stats, setStats] = useState<CitizenStats | null>(null);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [dashboardResponse, myIssuesResponse, analyticsResponse] = await Promise.all([
        dashboardAPI.getCitizenDashboard(),
        issuesAPI.getMyReports(),
        analyticsAPI.getUserStats()
      ]);

      const dashboardData = dashboardResponse.data;
      const userIssues = myIssuesResponse.data.issues || [];
      const analyticsData = analyticsResponse.data;

      const citizenStats: CitizenStats = {
        reportedIssues: dashboardData.totalReported || userIssues.length,
        resolvedIssues: dashboardData.totalResolved || userIssues.filter((issue: { status: string; }) => issue.status === 'resolved').length,
        activeIssues: dashboardData.activeIssues || userIssues.filter((issue: { status: string; }) => 
          ['reported', 'assigned', 'in_progress'].includes(issue.status)
        ).length,
        communityScore: analyticsData.communityScore || calculateCommunityScore(userIssues),
        issueTrend: dashboardData.issueTrend,
        resolutionTrend: dashboardData.resolutionTrend
      };

      setStats(citizenStats);
      setRecentIssues(userIssues.slice(0, 5)); // Show only 5 most recent issues

    } catch (err) {
      console.error('Failed to load citizen dashboard:', err);
      setError('Failed to load dashboard data. Please try again.');
      
      // Set fallback data
      setStats({
        reportedIssues: 0,
        resolvedIssues: 0,
        activeIssues: 0,
        communityScore: 0
      });
      setRecentIssues([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCommunityScore = (issues: Issue[]): number => {
    if (issues.length === 0) return 0;
    
    const resolvedCount = issues.filter(issue => issue.status === 'resolved').length;
    const totalVotes = issues.reduce((sum, issue) => sum + (issue.votes || 0), 0);
    const avgVotes = totalVotes / issues.length;
    
    const resolutionScore = (resolvedCount / issues.length) * 60;
    const engagementScore = Math.min(avgVotes * 5, 40);
    
    return Math.round(resolutionScore + engagementScore);
  };

  const handleIssueUpdate = () => {
    loadDashboardData();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white animate-pulse">
          <div className="h-6 bg-blue-500 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-blue-500 rounded w-2/3"></div>
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, Citizen!</h1>
            <p className="text-blue-100">
              {stats && stats.reportedIssues > 0 
                ? `You've contributed ${stats.reportedIssues} issues to our community. Thank you!`
                : 'Glad to see you again! Together we can make our community better.'
              }
            </p>
          </div>
          {stats && stats.communityScore >= 80 && (
            <div className="bg-white/20 rounded-lg px-3 py-2">
              <span className="text-sm font-medium">🌟 Top Contributor</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Reported Issues"
          value={stats?.reportedIssues.toString() || '0'}
          icon={PlusIcon}
          trend={stats?.issueTrend}
        />
        <StatCard
          title="Resolved Issues"
          value={stats?.resolvedIssues.toString() || '0'}
          icon={CheckCircleIcon}
          trend={stats?.resolutionTrend}
        />
        <StatCard
          title="Active Issues"
          value={stats?.activeIssues.toString() || '0'}
          icon={MapIcon}
        />
        <StatCard
          title="Community Score"
          value={`${stats?.communityScore || 0}%`}
          icon={HomeIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-8">
          <QuickActions userRole={role} />
          <RecentActivity />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Recent Issues</h2>
              <button
                onClick={loadDashboardData}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-4">
              {recentIssues.map(issue => (
                <IssueCard 
                  key={issue.id} 
                  issue={issue} 
                  onUpdate={handleIssueUpdate}
                />
              ))}
              {recentIssues.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <PlusIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-lg font-medium text-gray-600">No issues reported yet</p>
                  <p className="text-sm text-gray-500 mb-4">Start contributing to your community</p>
                  <a 
                    href="/report" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Report Your First Issue
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;