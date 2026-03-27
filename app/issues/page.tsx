'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import IssueList from './components/IssueList';
import { useAuth } from '@/features/auth/hooks/useAuth';
import Loading from '@/app/loading';
import Error from '@/app/error';
import MainLayout from '@/components/layout/MainLayout';
import type { Issue } from '@/types/issue.types';
import { issuesAPI } from '@/lib/services/api/endpoints';
import { toast } from 'sonner';

const IssuesPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voteStatusMap, setVoteStatusMap] = useState<Map<string, boolean>>(new Map());

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pass userId to get vote status from server
      const response = await issuesAPI.getIssues({
        userId: user?.id,
      });

      const raw = response.data;
      let issueList: Issue[] = [];

      if (Array.isArray(raw)) {
        issueList = raw;
      } else if (raw && Array.isArray(raw.issues)) {
        issueList = raw.issues;
      } else if (raw && Array.isArray(raw.data)) {
        issueList = raw.data;
      }

      setIssues(issueList);
      
      // Build vote status map from the issues data
      if (user) {
        const newVoteMap = new Map<string, boolean>();
        issueList.forEach(issue => {
          // Check if user has voted by looking at voters array
          const hasVoted = issue.voters?.includes(user.id) || false;
          newVoteMap.set(issue.id, hasVoted);
        });
        setVoteStatusMap(newVoteMap);
      }
    } catch (err: any) {
      console.error('Failed to fetch issues:', err);
      setError(err?.message || 'Failed to load issues. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleVote = async (issueId: string) => {
    if (!isAuthenticated || !user) {
      toast.warning('Please login to vote');
      router.push('/login');
      return;
    }

    try {
      const response = await issuesAPI.voteIssue(issueId);
      const result = response.data;
      
      // Update local issues state
      setIssues(prev => prev.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            upvotes: result.upvotes,
            voters: result.voted 
              ? [...(issue.voters || []), user.id]
              : (issue.voters || []).filter(voterId => voterId !== user.id),
          };
        }
        return issue;
      }));
      
      // Update vote status map
      setVoteStatusMap(prev => {
        const newMap = new Map(prev);
        newMap.set(issueId, result.voted);
        return newMap;
      });
      
      toast.success(result.voted ? 'Vote added!' : 'Vote removed');
    } catch (error) {
      console.error('Failed to vote:', error);
      toast.error('Failed to vote. Please try again.');
    }
  };

  const handleReportIssue = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push('/issues/new?role=' + (user?.role || ''));
  };

  const handleIssueClick = (issue: Issue) => {
    router.push(`/issues/${issue.id}?role=` + (user?.role || ''));
  };

  // Helper function to check if user has voted on an issue
  const hasUserVoted = useCallback((issueId: string): boolean => {
    return voteStatusMap.get(issueId) || false;
  }, [voteStatusMap]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <Error
        error={error as unknown as Error & { digest?: string }}
        reset={fetchIssues}
      />
    );
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
          issues={issues}
          showFilters={true}
          showSort={true}
          showPagination={true}
          showActions={isAuthenticated}
          showVoting={isAuthenticated}
          title=""
          emptyStateTitle="No issues found"
          emptyStateDescription="Be the first to report an issue in your community"
          onIssueClick={handleIssueClick}
          onVote={handleVote}
          getUserVoteStatus={hasUserVoted}
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
                className="bg-blue-600 cursor-pointer text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Report New Issue
              </button>
              {isAuthenticated && user?.role === 'volunteer' && (
                <button
                  onClick={() => router.push('/tasks/available')}
                  className="bg-green-600 cursor-pointer text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
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