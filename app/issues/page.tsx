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
      setLoading(true); setError(null);
      const response = await issuesAPI.getIssues({ userId: user?.id });
      const raw = response.data;
      let issueList: Issue[] = Array.isArray(raw) ? raw : Array.isArray(raw?.issues) ? raw.issues : Array.isArray(raw?.data) ? raw.data : [];
      setIssues(issueList);
      if (user) {
        const newVoteMap = new Map<string, boolean>();
        issueList.forEach(issue => newVoteMap.set(issue.id, issue.voters?.includes(user.id) || false));
        setVoteStatusMap(newVoteMap);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load issues. Please try again.');
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleVote = async (issueId: string) => {
    if (!isAuthenticated || !user) { toast.warning('Please login to vote'); router.push('/login'); return; }
    try {
      const response = await issuesAPI.voteIssue(issueId);
      const result = response.data;
      setIssues(prev => prev.map(issue => issue.id === issueId ? { ...issue, upvotes: result.upvotes, voters: result.voted ? [...(issue.voters || []), user.id] : (issue.voters || []).filter(v => v !== user.id) } : issue));
      setVoteStatusMap(prev => { const m = new Map(prev); m.set(issueId, result.voted); return m; });
      toast.success(result.voted ? 'Vote added!' : 'Vote removed');
    } catch { toast.error('Failed to vote. Please try again.'); }
  };

  const hasUserVoted = useCallback((issueId: string): boolean => voteStatusMap.get(issueId) || false, [voteStatusMap]);

  if (loading) return <div className="space-y-6"><Loading /></div>;
  if (error) return <Error error={error as unknown as Error & { digest?: string }} reset={fetchIssues} />;

  return (
    <MainLayout role={user?.role ?? null}>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          {/* FIX: text-xl on mobile, text-3xl on sm+ */}
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">Community Issues</h1>
          <p className="text-gray-600 text-sm sm:text-base">
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
          onIssueClick={(issue) => router.push(`/issues/${issue.id}?role=` + (user?.role || ''))}
          onVote={handleVote}
          getUserVoteStatus={hasUserVoted}
        />

        <div className="mt-8 sm:mt-12 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              {/* FIX: text-lg on mobile */}
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Want to contribute more?</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Report issues, vote on important problems, or volunteer to help fix them.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => { if (!isAuthenticated) { router.push('/login'); return; } router.push('/issues/new?role=' + (user?.role || '')); }}
                className="bg-blue-600 cursor-pointer text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
              >
                Report New Issue
              </button>
              {isAuthenticated && user?.role === 'volunteer' && (
                <button
                  onClick={() => router.push('/tasks/available')}
                  className="bg-green-600 cursor-pointer text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
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
