'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import IssueList from './components/IssueList';
import { useAuth } from '@/features/auth/hooks/useAuth';
import apiClient from '@/lib/services/api/client';
import Loading from '@/app/loading';
import Error from '@/app/error';
import MainLayout from '@/components/layout/MainLayout';

const IssuesPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      console.log(user?.role);
      setLoading(true);
      const response = await apiClient.get('/issues');
      setIssues(response.data?.issues || response.data.issues || []);
    } catch (err) {
      console.error('Failed to fetch issues:', err);
      setError('Failed to load issues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReportIssue = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push('/issues/new?role=' + (user?.role || '') );
  };

  const handleIssueClick = (issue: any) => {
    router.push(`/issues/${issue.id}?role=` + (user?.role || ''));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (<Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />);
  }

  return (
    <MainLayout role={user?.role ?? null}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Issues</h1>
          <p className="text-gray-600">
            Browse and contribute to issues reported in your community. Help make a difference!
          </p>
        </div>

        <IssueList 
          showFilters={true}
          showSort={true}
          showPagination={true}
          showActions={isAuthenticated}
          showVoting={isAuthenticated}
          title=""
          emptyStateTitle="No issues found"
          emptyStateDescription="Be the first to report an issue in your community"
          onIssueClick={handleIssueClick}
          issues={issues}
        />
        
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Want to contribute more?</h3>
              <p className="text-gray-600">
                Report issues, vote on important problems, or volunteer to help fix them.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReportIssue}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Report New Issue
              </button>
              {isAuthenticated && user?.role === 'volunteer' && (
                <button
                  onClick={() => router.push('/tasks/available')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  View Available Tasks
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default IssuesPage;