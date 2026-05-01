'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Issue, IssueFilters } from '@/types/issue.types';
import { issuesAPI, commentsAPI } from '@/lib/services/api/endpoints';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface UseIssuesReturn {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  hasMore: boolean;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  addIssue: (issueData: Partial<Issue>) => Promise<Issue>;
  updateIssue: (id: string, updates: Partial<Issue>) => Promise<Issue>;
  deleteIssue: (id: string) => Promise<void>;
  voteIssue: (id: string) => Promise<{ voted: boolean; upvotes: number }>;
  claimIssue: (id: string) => Promise<Issue>;
  addComment: (issueId: string, commentData: { text: string }) => Promise<any>;
  getIssueComments: (issueId: string) => Promise<any[]>;
  getMyReports: () => Promise<Issue[]>;
  getIssueById: (id: string) => Promise<Issue | undefined>;
  getIssuesByStatus: (status: Issue['status']) => Issue[];
  getIssuesByCategory: (category: string) => Issue[];
  getIssuesByReporter: (reporterId: string) => Issue[];
  getFilteredIssues: (filters: Partial<Issue>) => Issue[];
  searchIssues: (query: string) => Promise<void>;
  // Vote status helpers
  hasUserVoted: (issueId: string) => boolean;
  getUserVoteStatus: (issueId: string) => boolean;
  getVoteCount: (issueId: string) => number;
}

interface UseIssuesOptions {
  initialFilters?: IssueFilters;
  pageSize?: number;
  autoFetch?: boolean;
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
  const [hasMore, setHasMore] = useState(false);
  const [filters] = useState(initialFilters);
  const [voteStatusMap, setVoteStatusMap] = useState<Map<string, boolean>>(new Map());

  const { user } = useAuth();

  // Helper to check if current user has voted on an issue
  const hasUserVoted = useCallback((issueId: string): boolean => {
    // First check the map for quick lookup
    if (voteStatusMap.has(issueId)) {
      return voteStatusMap.get(issueId) || false;
    }
    
    // Fallback to searching in issues array
    const issue = issues.find(i => i.id === issueId);
    if (!issue || !user) return false;
    
    return issue.voters?.includes(user.id) || false;
  }, [issues, user, voteStatusMap]);

  const getUserVoteStatus = useCallback((issueId: string): boolean => {
    return hasUserVoted(issueId);
  }, [hasUserVoted]);

  const getVoteCount = useCallback((issueId: string): number => {
    const issue = issues.find(i => i.id === issueId);
    return issue?.upvotes || 0;
  }, [issues]);

  // Update vote status map whenever issues change
  useEffect(() => {
    if (user) {
      const newMap = new Map<string, boolean>();
      issues.forEach(issue => {
        const hasVoted = issue.voters?.includes(user.id) || false;
        newMap.set(issue.id, hasVoted);
      });
      setVoteStatusMap(newMap);
    }
  }, [issues, user]);

  const fetchIssues = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
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
        userId: user?.id, // Pass user ID to get vote status
      };

      const response = await issuesAPI.getIssues(params);

      // Handle both { issues: [], total: N } and plain array responses
      const raw = response.data;
      let issuesData: Issue[] = [];
      let total = 0;

      if (Array.isArray(raw)) {
        issuesData = raw;
        total = raw.length;
      } else if (raw && Array.isArray(raw.issues)) {
        issuesData = raw.issues;
        total = raw.total ?? raw.pagination?.total ?? raw.issues.length;
      } else if (raw && Array.isArray(raw.data)) {
        issuesData = raw.data;
        total = raw.total ?? raw.data.length;
      } else {
        issuesData = [];
        total = 0;
      }

      // Ensure each issue has the voters array and vote status
      const processedIssues: Issue[] = issuesData.map(issue => ({
        ...issue,
        hasVoted: user ? (issue.voters?.includes(user.id) ?? false) : false,
        voters: issue.voters || [],
      }));

      if (reset) {
        setIssues(processedIssues);
      } else {
        setIssues(prev => [...prev, ...processedIssues]);
      }

      const calculatedTotalPages = Math.ceil(total / pageSize) || 1;
      setTotalPages(calculatedTotalPages);
      setHasMore(pageNum < calculatedTotalPages);

    } catch (err: any) {
      setError(err?.message || 'Failed to fetch issues');
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pageSize, user]);

  useEffect(() => {
    if (autoFetch) {
      fetchIssues(1, true);
    }
  }, [autoFetch, fetchIssues]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchIssues(nextPage, false);
  }, [loading, hasMore, page, fetchIssues]);

  const addIssue = async (issueData: Partial<Issue>): Promise<Issue> => {
    const response = await issuesAPI.createIssue(issueData);
    const newIssue = response.data;
    setIssues(prev => [newIssue, ...prev]);
    return newIssue;
  };

  const updateIssue = async (id: string, updates: Partial<Issue>): Promise<Issue> => {
    const response = await issuesAPI.updateIssue(id, updates);
    const updatedIssue = response.data;
    setIssues(prev => prev.map(issue => issue.id === id ? updatedIssue : issue));
    return updatedIssue;
  };

  const deleteIssue = async (id: string): Promise<void> => {
    await issuesAPI.deleteIssue(id);
    setIssues(prev => prev.filter(issue => issue.id !== id));
  };

  const voteIssue = async (id: string): Promise<{ voted: boolean; upvotes: number }> => {
    try {
      const response = await issuesAPI.voteIssue(id);
      const result = response.data;
      
      // Update the issue in local state with proper typing
      setIssues(prev => prev.map(issue => {
        if (issue.id === id) {
          let updatedVoters: string[];
          if (result.voted) {
            // Add user ID to voters array
            updatedVoters = user?.id ? [...(issue.voters || []), user.id] : issue.voters || [];
          } else {
            // Remove user ID from voters array
            updatedVoters = (issue.voters || []).filter(voterId => voterId !== user?.id);
          }
          
          const updatedIssue = {
            ...issue,
            upvotes: result.upvotes,
            voters: updatedVoters,
            hasVoted: result.voted,
          };
          
          // Update the vote status map
          setVoteStatusMap(prevMap => {
            const newMap = new Map(prevMap);
            newMap.set(id, result.voted);
            return newMap;
          });
          
          return updatedIssue;
        }
        return issue;
      }));
      
      return { voted: result.voted, upvotes: result.upvotes };
    } catch (error) {
      console.error('Failed to vote:', error);
      throw error;
    }
  };

  const claimIssue = async (id: string): Promise<Issue> => {
    const response = await issuesAPI.claimIssue(id);
    const updatedIssue = response.data;
    setIssues(prev => prev.map(issue => issue.id === id ? updatedIssue : issue));
    return updatedIssue;
  };

  const addComment = async (issueId: string, commentData: { text: string }): Promise<any> => {
    const response = await commentsAPI.addComment(issueId, commentData);
    const newComment = response.data;
    setIssues(prev => prev.map(issue =>
      issue.id === issueId
        ? { 
            ...issue, 
            comments: [...(issue.comments || []), newComment], 
            commentsCount: (issue.commentsCount || 0) + 1,
            updatedAt: new Date().toISOString() 
          }
        : issue
    ));
    return newComment;
  };

  const getIssueComments = async (issueId: string): Promise<any[]> => {
    const response = await commentsAPI.getComments(issueId);
    return response.data || [];
  };

  const getMyReports = async (): Promise<Issue[]> => {
    const response = await issuesAPI.getMyReports();
    return response.data || [];
  };

  const getIssueById = async (id: string): Promise<Issue | undefined> => {
    const localIssue = issues.find(issue => issue.id === id);
    if (localIssue) return localIssue;
    const response = await issuesAPI.getIssue(id);
    return response.data;
  };

  const getIssuesByStatus = (status: Issue['status']): Issue[] =>
    issues.filter(issue => issue.status === status);

  const getIssuesByCategory = (category: string): Issue[] =>
    issues.filter(issue => issue.category === category);

  const getIssuesByReporter = (reporterId: string): Issue[] =>
    issues.filter(issue => issue.reporterId === reporterId);

  const getFilteredIssues = (filters: Partial<Issue>): Issue[] =>
    issues.filter(issue =>
      Object.entries(filters).every(([key, value]) => (issue as any)[key] === value)
    );

  const searchIssues = async (query: string): Promise<void> => {
    try {
      setLoading(true);
      const params = { search: query, ...filters, userId: user?.id };
      const response = await issuesAPI.getIssues(params);
      const raw = response.data;
      const issuesData: Issue[] = Array.isArray(raw) ? raw : raw?.issues ?? raw?.data ?? [];
      const processedIssues: Issue[] = issuesData.map(issue => ({
        ...issue,
        hasVoted: user ? (issue.voters?.includes(user.id) ?? false) : false,
        voters: issue.voters || [],
      }));
      setIssues(processedIssues);
    } catch (err: any) {
      setError(err?.message || 'Failed to search issues');
    } finally {
      setLoading(false);
    }
  };

  return {
    issues,
    loading,
    error,
    page,
    totalPages,
    hasMore,
    // Vote status helpers
    hasUserVoted,
    getUserVoteStatus,
    getVoteCount,
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
    getIssueById,
    getIssuesByStatus,
    getIssuesByCategory,
    getIssuesByReporter,
    getFilteredIssues,
    searchIssues,
  };
};