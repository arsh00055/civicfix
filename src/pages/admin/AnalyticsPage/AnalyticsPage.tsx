import React, { useState, useEffect, Suspense } from 'react';
import { analyticsAPI } from '../../../services/api/endpoints';
import Sidebar from '../../../components/layout/sidebar/Sidebar';
import Header from '../../../components/layout/Header/Header';
import { useAppSelector } from '../../../app/store/hooks';

import {
  AnalyticsHeader,
  ErrorBanner,
  KeyMetrics,
  IssuesByStatus,
  IssuesByCategory,
  IssueTrends,
  LoadingState,
  ErrorState
} from './components/lazy';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalIssues: number;
    resolvedIssues: number;
    activeVolunteers: number;
    newUsersThisWeek: number;
    issuesThisWeek: number;
  };
  issuesByStatus: { status: string; count: number }[];
  issuesByCategory: { category: string; count: number }[];
  userGrowth: { date: string; count: number }[];
  issueTrends: { date: string; reported: number; resolved: number }[];
}

interface AnalyticsProps {
  role: string | null;
}

type TimeRange = 'week' | 'month' | 'year';

const AnalyticsPage: React.FC<AnalyticsProps> = ({ role }) => {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Only need overview API since it contains all the data
      const overviewResponse = await analyticsAPI.getOverview({ timeframe: timeRange });

      console.log('API Response:', overviewResponse.data);

      // Transform the API response to match your AnalyticsData interface
      const analyticsData: AnalyticsData = {
        overview: {
          totalUsers: overviewResponse.data.overview?.totalUsers || 0,
          totalIssues: overviewResponse.data.overview?.totalIssues || 0,
          resolvedIssues: overviewResponse.data.overview?.resolvedIssues || 0,
          activeVolunteers: overviewResponse.data.overview?.activeVolunteers || 0,
          newUsersThisWeek: overviewResponse.data.overview?.newUsersThisWeek || 0,
          issuesThisWeek: overviewResponse.data.overview?.issuesThisWeek || 0
        },
        issuesByStatus: overviewResponse.data.issuesByStatus || [],
        issuesByCategory: overviewResponse.data.issuesByCategory || [],
        userGrowth: overviewResponse.data.userGrowth || [],
        issueTrends: transformTrendsData(overviewResponse.data)
      };

      console.log('Transformed Analytics Data:', analyticsData);
      setAnalytics(analyticsData);

    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data. Please try again.');
      
      // Set fallback data for development
      setAnalytics(getFallbackAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  // Transform data to create issue trends
  const transformTrendsData = (data: any) => {
    if (data.issueTrends && Array.isArray(data.issueTrends)) {
      return data.issueTrends;
    }
    
    // Create mock trends from userGrowth data
    if (data.userGrowth && Array.isArray(data.userGrowth)) {
      return data.userGrowth.map((item: any, index: number) => ({
        date: item.date || `2024-01-${15 + index}`,
        reported: Math.floor(Math.random() * 20) + 10, // Mock reported issues
        resolved: Math.floor(Math.random() * 15) + 5   // Mock resolved issues
      }));
    }
    
    // Fallback to empty array
    return [];
  };

  // Fallback data for development
  const getFallbackAnalyticsData = (): AnalyticsData => ({
    overview: {
      totalUsers: 1247,
      totalIssues: 892,
      resolvedIssues: 645,
      activeVolunteers: 89,
      newUsersThisWeek: 34,
      issuesThisWeek: 67
    },
    issuesByStatus: [
      { status: 'reported', count: 45 },
      { status: 'in_progress', count: 56 },
      { status: 'resolved', count: 645 },
      { status: 'assigned', count: 34 },
      { status: 'in_review', count: 23 },
      { status: 'closed', count: 89 }
    ],
    issuesByCategory: [
      { category: 'infrastructure', count: 234 },
      { category: 'safety', count: 156 },
      { category: 'sanitation', count: 189 },
      { category: 'utilities', count: 123 },
      { category: 'environment', count: 98 },
      { category: 'other', count: 92 }
    ],
    userGrowth: [
      { date: '2024-01', count: 1000 },
      { date: '2024-02', count: 1120 },
      { date: '2024-03', count: 1247 }
    ],
    issueTrends: [
      { date: '2024-01-15', reported: 12, resolved: 8 },
      { date: '2024-01-16', reported: 15, resolved: 11 },
      { date: '2024-01-17', reported: 18, resolved: 14 },
      { date: '2024-01-18', reported: 14, resolved: 12 },
      { date: '2024-01-19', reported: 16, resolved: 13 },
      { date: '2024-01-20', reported: 19, resolved: 15 },
      { date: '2024-01-21', reported: 17, resolved: 14 }
    ]
  });

  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
  };

  const handleRetry = () => {
    fetchAnalytics();
  };

  // Loading state
  if (loading && !analytics) {
    return (
      <div className="flex h-screen bg-gray-50">
        {sidebarOpen && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole={role} />
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div>Loading...</div>}>
              <LoadingState />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  // Error state (when no data exists)
  if (error && !analytics) {
    return (
      <div className="flex h-screen bg-gray-50">
        {sidebarOpen && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole={role} />
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div>Loading...</div>}>
              <ErrorState error={error} onRetry={handleRetry} />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole={role} />
        <main className="flex-1 overflow-auto p-6">
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <Suspense fallback={<div>Loading header...</div>}>
                <AnalyticsHeader 
                  timeRange={timeRange} 
                  onTimeRangeChange={handleTimeRangeChange} 
                />
              </Suspense>

              {/* Error Banner */}
              {error && (
                <Suspense fallback={<div>Loading error banner...</div>}>
                  <ErrorBanner error={error} onRetry={handleRetry} />
                </Suspense>
              )}

              {/* Key Metrics */}
              <Suspense fallback={<div>Loading metrics...</div>}>
                <KeyMetrics overview={analytics?.overview || null} />
              </Suspense>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Issues by Status */}
                <Suspense fallback={<div>Loading status chart...</div>}>
                  <IssuesByStatus 
                    items={analytics?.issuesByStatus || []} 
                    totalIssues={analytics?.overview?.totalIssues || 0} 
                  />
                </Suspense>

                {/* Issues by Category */}
                <Suspense fallback={<div>Loading category chart...</div>}>
                  <IssuesByCategory 
                    items={analytics?.issuesByCategory || []} 
                    totalIssues={analytics?.overview?.totalIssues || 0} 
                  />
                </Suspense>
              </div>

              {/* Issue Trends */}
              <Suspense fallback={<div>Loading trends...</div>}>
                <IssueTrends 
                  trends={analytics?.issueTrends || []} 
                  timeRange={timeRange} 
                />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;