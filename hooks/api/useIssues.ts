'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Issue } from '@/types/issue.types';
import { issuesAPI, commentsAPI } from '@/lib/services/api/endpoints';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface UseIssuesReturn {
  // State
  issues: Issue[];
  loading: boolean;
  error: string | null;

  // Pagination
  page: number;
  totalPages: number;
  hasMore: boolean;

  // Actions
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  addIssue: (issueData: Partial<Issue>) => Promise<Issue>;
  updateIssue: (id: string, updates: Partial<Issue>) => Promise<Issue>;
  deleteIssue: (id: string) => Promise<void>;
  voteIssue: (id: string) => Promise<any>;
  claimIssue: (id: string) => Promise<Issue>;
  addComment: (issueId: string, commentData: { text: string }) => Promise<any>;
  getIssueComments: (issueId: string) => Promise<any[]>;
  getMyReports: () => Promise<Issue[]>;

  // Getters
  getIssueById: (id: string) => Promise<Issue | undefined>;
  getIssuesByStatus: (status: Issue['status']) => Issue[];
  getIssuesByCategory: (category: string) => Issue[];
  getIssuesByReporter: (reporterId: string) => Issue[];
  getFilteredIssues: (filters: Partial<Issue>) => Issue[];
  getUserVoteStatus: (issueId: string) => boolean;
  getVoteCount: (issueId: string) => number;
  hasUserVoted: (issueId: string) => boolean;

  // Search & Filter
  searchIssues: (query: string) => Promise<void>;
}

interface UseIssuesOptions {
  initialFilters?: any;
  pageSize?: number;
  autoFetch?: boolean;
}

function extractIssues(response: any): Issue[] {
  if (!response) return [];

  const data = response.data !== undefined ? response.data : response;

  // { issues: [...], total: N }
  if (data && Array.isArray(data.issues)) return data.issues;

  // { data: [...] }
  if (data && Array.isArray(data.data)) return data.data;

  // plain array
  if (Array.isArray(data)) return data;

  return [];
}

function extractTotal(response: any, issues: Issue[]): number {
  if (!response) return issues.length;
  const data = response.data !== undefined ? response.data : response;
  if (data && typeof data.total === 'number') return data.total;
  return issues.length;
}

export const useIssues = (options?: UseIssuesOptions): UseIssuesReturn => {
  const {
    initialFilters = {},
    pageSize = 10,
    autoFetch = true,
  } = options || {};

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters] = useState(initialFilters);

  const { user } = useAuth();

  const fetchIssues = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      try {
        if (reset) {
          setLoading(true);
          setPage(1);
        }

        setError(null);

        const params = {
          ...filters,
          page: pageNum,
          limit: pageSize,
        };

        const response = await issuesAPI.getIssues(params);
        const issuesData = extractIssues(response);
        const total = extractTotal(response, issuesData);

        if (reset || pageNum === 1) {
          setIssues(issuesData);
        } else {
          setIssues((prev) => [...prev, ...issuesData]);
        }

        const calculatedTotalPages = Math.ceil(total / pageSize);
        setTotalPages(calculatedTotalPages);
        setHasMore(pageNum < calculatedTotalPages);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch issues');
        console.error('Error fetching issues:', err);
        setIssues([]);
        setHasMore(false);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [filters, pageSize]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchIssues(1, true);
    } else {
      setLoading(false);
    }
  }, [autoFetch, fetchIssues]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    const nextPage = page + 1;
    setPage(nextPage);
    await fetchIssues(nextPage, false);
  }, [loading, hasMore, page, fetchIssues]);

  const addIssue = async (issueData: Partial<Issue>): Promise<Issue> => {
    try {
      const response = await issuesAPI.createIssue(issueData);
      const newIssue = response.data || response;

      setIssues((prev) => [newIssue, ...(Array.isArray(prev) ? prev : [])]);
      return newIssue;
    } catch (err: any) {
      console.error('Error creating issue:', err);
      throw err;
    }
  };

  const updateIssue = async (id: string, updates: Partial<Issue>): Promise<Issue> => {
    try {
      const response = await issuesAPI.updateIssue(id, updates);
      const updatedIssue = response.data || response;

      setIssues((prev) =>
        (Array.isArray(prev) ? prev : []).map((issue) =>
          issue.id === id ? updatedIssue : issue
        )
      );

      return updatedIssue;
    } catch (err: any) {
      console.error('Error updating issue:', err);
      throw err;
    }
  };

  const deleteIssue = async (id: string): Promise<void> => {
    try {
      await issuesAPI.deleteIssue(id);
      setIssues((prev) => (Array.isArray(prev) ? prev : []).filter((issue) => issue.id !== id));
    } catch (err: any) {
      console.error('Error deleting issue:', err);
      throw err;
    }
  };

  // ✅ FIX: API returns { voted: bool, upvotes: number } — not a full Issue.
  //         Patch the existing issue in state instead of replacing it entirely.
  const voteIssue = async (id: string): Promise<any> => {
    try {
      const response = await issuesAPI.voteIssue(id);
      const result = response.data || response;

      setIssues((prev) =>
        (Array.isArray(prev) ? prev : []).map((issue) => {
          if (issue.id !== id) return issue;

          const currentVoters: string[] = Array.isArray((issue as any).voters)
            ? (issue as any).voters
            : [];

          const userId = user?.id;
          let updatedVoters: string[];

          if (result.voted) {
            // Add user to voters
            updatedVoters = userId && !currentVoters.includes(userId)
              ? [...currentVoters, userId]
              : currentVoters;
          } else {
            // Remove user from voters
            updatedVoters = userId
              ? currentVoters.filter((v: string) => v !== userId)
              : currentVoters;
          }

          return {
            ...issue,
            upvotes: result.upvotes ?? (issue as any).upvotes,
            voters: updatedVoters,
          };
        })
      );

      return result;
    } catch (err: any) {
      console.error('Error voting on issue:', err);
      throw err;
    }
  };

  const claimIssue = async (id: string): Promise<Issue> => {
    try {
      const response = await issuesAPI.claimIssue(id);
      const updatedIssue = response.data || response;

      setIssues((prev) =>
        (Array.isArray(prev) ? prev : []).map((issue) =>
          issue.id === id ? updatedIssue : issue
        )
      );

      return updatedIssue;
    } catch (err: any) {
      console.error('Error claiming issue:', err);
      throw err;
    }
  };

  const addComment = async (issueId: string, commentData: { text: string }): Promise<any> => {
    try {
      const response = await commentsAPI.addComment(issueId, commentData);
      const newComment = response.data || response;

      setIssues((prev) =>
        (Array.isArray(prev) ? prev : []).map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                comments: [...(issue.comments || []), newComment],
                commentsCount: (issue.commentsCount || 0) + 1,
                updatedAt: new Date().toISOString(),
              }
            : issue
        )
      );

      return newComment;
    } catch (err: any) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const getIssueComments = async (issueId: string): Promise<any[]> => {
    try {
      const response = await commentsAPI.getComments(issueId);
      return response.data || response || [];
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      throw err;
    }
  };

  const getMyReports = async (): Promise<Issue[]> => {
    try {
      const response = await issuesAPI.getMyReports();
      return response.data || response || [];
    } catch (err: any) {
      console.error('Error fetching my reports:', err);
      throw err;
    }
  };

  const getIssueById = async (id: string): Promise<Issue | undefined> => {
    try {
      const localIssue = (Array.isArray(issues) ? issues : []).find((issue) => issue.id === id);
      if (localIssue) return localIssue;

      const response = await issuesAPI.getIssue(id);
      return response.data || response;
    } catch (err: any) {
      console.error('Error fetching issue by ID:', err);
      throw err;
    }
  };

  const getIssuesByStatus = (status: Issue['status']): Issue[] => {
    return (Array.isArray(issues) ? issues : []).filter((issue) => issue.status === status);
  };

  const getIssuesByCategory = (category: string): Issue[] => {
    return (Array.isArray(issues) ? issues : []).filter((issue) => issue.category === category);
  };

  const getIssuesByReporter = (reporterId: string): Issue[] => {
    return (Array.isArray(issues) ? issues : []).filter(
      (issue) => issue.reporterId === reporterId
    );
  };

  const getFilteredIssues = (filterObj: Partial<Issue>): Issue[] => {
    return (Array.isArray(issues) ? issues : []).filter((issue) => {
      return Object.entries(filterObj).every(([key, value]) => {
        // @ts-ignore
        return issue[key] === value;
      });
    });
  };

  const getUserVoteStatus = (issueId: string): boolean => {
    if (!user) return false;
    const issue = (Array.isArray(issues) ? issues : []).find((i) => i.id === issueId);
    if (!issue) return false;
    return Array.isArray((issue as any).voters) && (issue as any).voters.includes(user.id);
  };

  // ✅ alias — test calls hasUserVoted() which is same as getUserVoteStatus()
  const hasUserVoted = (issueId: string): boolean => getUserVoteStatus(issueId);

  const getVoteCount = (issueId: string): number => {
    const issue = (Array.isArray(issues) ? issues : []).find((i) => i.id === issueId);
    if (!issue) return 0;
    return (issue as any).upvotes ?? 0;
  };

  const searchIssues = async (query: string): Promise<void> => {
    try {
      setLoading(true);
      const params = { search: query, ...filters };
      const response = await issuesAPI.getIssues(params);
      setIssues(extractIssues(response));
    } catch (err: any) {
      setError(err?.message || 'Failed to search issues');
      console.error('Error searching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    issues,
    loading,
    error,

    // Pagination
    page,
    totalPages,
    hasMore,

    // Actions
    refetch: () => fetchIssues(1, true),
    loadMore,
    addIssue,
    updateIssue,
    deleteIssue,
    voteIssue,
    claimIssue,
    addComment,
    getIssueComments,
    getMyReports,

    // Getters
    getIssueById,
    getIssuesByStatus,
    getIssuesByCategory,
    getIssuesByReporter,
    getFilteredIssues,
    getUserVoteStatus,
    getVoteCount,
    hasUserVoted,

    // Search
    searchIssues,
  };
};