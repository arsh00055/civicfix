'use client'

import React, { useState, useEffect } from 'react'
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
} from '@/components/UI/icons'
import { useAuth } from '@/features/auth/hooks/useAuth'
import apiClient from '@/lib/services/api/client'

interface CitizenStats {
  reportsSubmitted: number;
  issuesResolved: number;
  achievementsEarned: number;
  communityRank: string;
  communityImpact: string;
}

export default function CitizenDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<CitizenStats | null>(null);
  const [myReports, setMyReports] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    try {
      setIsLoading(true);
      setError(null);

      const dashboardResponse = await apiClient.get('/dashboard/citizen');
      const dashboardData = dashboardResponse.data || dashboardResponse;

      setStats({
        reportsSubmitted: dashboardData.stats?.reportsSubmitted || 0,
        issuesResolved: dashboardData.stats?.issuesResolved || 0,
        achievementsEarned: dashboardData.stats?.achievementsEarned || 0,
        communityRank: dashboardData.stats?.communityRank || 'Citizen',
        communityImpact: dashboardData.stats?.communityImpact || '0%'
      });
      
      setMyReports(dashboardData.myReports || []);
      setRecentActivity(dashboardData.recentActivity || []);

    } catch (err: any) {
      console.error('Failed to load citizen dashboard:', err);
      setError(err.message || 'Failed to load dashboard data. Please try again.');
      
      setStats({
        reportsSubmitted: 0,
        issuesResolved: 0,
        achievementsEarned: 0,
        communityRank: 'Citizen',
        communityImpact: '0%'
      });
      setMyReports([]);
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIssueUpdate = () => {
    loadDashboardData();
  };

  const handleReportIssue = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/issues/new?role=' + (user?.role || ''));
  };

  if (authLoading) {
    return null;
  }

  if (!user || user.role !== 'citizen') {
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
          <h1 className="text-2xl font-bold mb-2">
  Welcome back, {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Citizen'}!
</h1>
            <p className="text-blue-100">
              {stats && stats.reportsSubmitted > 0 
                ? `You've contributed ${stats.reportsSubmitted} issues to our community. Thank you!`
                : 'Glad to see you again! Together we can make our community better.'
              }
            </p>
          </div>
          {stats && stats.communityRank === 'Top Contributor' && (
            <div className="bg-white/20 rounded-lg px-3 py-2">
              <span className="text-sm font-medium">🌟 {stats.communityRank}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Reports Submitted"
          value={stats?.reportsSubmitted.toString() || '0'}
          icon={PlusIcon}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Issues Resolved"
          value={stats?.issuesResolved.toString() || '0'}
          icon={CheckCircleIcon}
          trend={{ value: 10, isPositive: true }}
        />
        <StatCard
          title="Achievements"
          value={stats?.achievementsEarned.toString() || '0'}
          icon={HomeIcon}
        />
        <StatCard
          title="Community Impact"
          value={stats?.communityImpact || '0%'}
          icon={MapIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-8">
          <QuickActions userRole="citizen" />
          <RecentActivity />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Recent Reports</h2>
              <button
                onClick={loadDashboardData}
                className="text-sm text-blue-600 cursor-pointer hover:text-blue-700 font-medium"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-8 flex flex-col">
              {myReports.length > 0 ? (
                myReports.map(report => (
                  <IssueCard 
                    key={report.id} 
                    issue={{
                      id: report.id,
                      title: report.title,
                      description: report.description || '',
                      status: report.status,
                      views: report.views ?? 0,
                      commentsCount: report.commentsCount ?? (report.comments ? report.comments.length : 0),
                      reportedAt: report.reportedAt ?? report.createdAt,
                      priority: report.priority,
                      category: report.category || 'general',
                      location: report.location || '',
                      createdAt: report.createdAt,
                      reporter: { id: user.id, name: user?.name || 'You' },
                      upvotes: 0,
                      latitude: report.latitude ?? null,
                      longitude: report.longitude ?? null,
                      images: report.images ?? [],
                      reporterId: report.reporterId ?? user.id,
                      updatedAt: report.updatedAt ?? report.createdAt,
                      comments: report.comments ?? [],
                      assignedTo: report.assignedTo ?? null,
                    }}
                    onUpdate={handleIssueUpdate}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <PlusIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-lg font-medium text-gray-600">No issues reported yet</p>
                  <p className="text-sm text-gray-500 mb-4">Start contributing to your community</p>
                  <button
                    onClick={handleReportIssue}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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