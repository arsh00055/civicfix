import React, { useState, useEffect, Suspense } from 'react';
import { issuesAPI } from '../../services/api/endpoints';
import { useAuth } from '../../features/auth/hooks/useAuth';
import IssueList from '../../features/issues/components/IssueList/IssueList';
import EmptyState from '../../components/common/EmptyState';
import { DocumentTextIcon } from '../../components/UI/icons';
import Sidebar from '../../components/layout/sidebar/Sidebar';
import Header from '../../components/layout/Header/Header';
import { useAppSelector } from '../../app/store/hooks';
import type { Issue } from '../../types';

// Lazy-loaded components
import {
  MyReportsHeader,
  ErrorBanner,
  ReportsStats,
  ReportsFilters,
  AuthRequired,
  LoadingState,
  ErrorState
} from './components/lazy';

interface MyReportsProps {
  role: string | null;
}

const MyReportsPage: React.FC<MyReportsProps> = ({ role }) => {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const [reports, setReports] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMyReports();
    }
  }, [filters, user, isAuthenticated]);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !isAuthenticated) {
        setError('Please log in to view your reports');
        return;
      }

      const response = await issuesAPI.getMyReports();
      setReports(response.data.issues);
      
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Failed to load your reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const clearFilters = () => {
    setFilters({ status: '', search: '' });
  };

  const handleRetry = () => {
    fetchMyReports();
  };

  const handleReportNew = () => {
    window.location.href = '/report-issue';
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const filteredReports = reports.filter(report => {
    let matches = true;
    if (filters.status && report.status !== filters.status) matches = false;
    if (filters.search && !report.title.toLowerCase().includes(filters.search.toLowerCase())) matches = false;
    return matches;
  });

  // Show loading or redirect if user is not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="flex h-screen bg-gray-50">
        {sidebarOpen && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole={role} />
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div>Loading...</div>}>
              <AuthRequired onLogin={handleLogin} />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !reports.length) {
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
  if (error && !reports.length) {
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
          <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <Suspense fallback={<div>Loading header...</div>}>
                <MyReportsHeader 
                  onRefresh={handleRetry} 
                  onReportNew={handleReportNew} 
                />
              </Suspense>

              {/* Error Banner */}
              <Suspense fallback={<div>Loading error banner...</div>}>
                <ErrorBanner error={error} onRetry={handleRetry} />
              </Suspense>

              {/* Stats */}
              <Suspense fallback={<div>Loading stats...</div>}>
                <ReportsStats reports={reports} />
              </Suspense>

              {/* Filters */}
              <Suspense fallback={<div>Loading filters...</div>}>
                <ReportsFilters
                  filters={filters}
                  filteredCount={filteredReports.length}
                  totalCount={reports.length}
                  onStatusFilter={handleStatusFilter}
                  onSearch={handleSearch}
                  onClearFilters={clearFilters}
                />
              </Suspense>

              {/* Reports List */}
              {filteredReports.length === 0 ? (
                <EmptyState
                  icon={DocumentTextIcon}
                  title="No reports found"
                  description={reports.length === 0 
                    ? "You haven't reported any issues yet. Start by reporting a community issue!"
                    : "No reports match your current filters."
                  }
                  action={
                    reports.length === 0 ? (
                      <button 
                        onClick={handleReportNew}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Report First Issue
                      </button>
                    ) : (
                      <button 
                        onClick={clearFilters}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Clear Filters
                      </button>
                    )
                  }
                />
              ) : (
                <IssueList 
                  issues={filteredReports} 
                  showActions={true}
                  showVoting={false}
                  title="My Reported Issues"
                  emptyStateTitle="No reports match your filters"
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyReportsPage;