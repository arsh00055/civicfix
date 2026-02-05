'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Issue } from '@/types/issue.types';
import { issuesAPI, commentsAPI } from '@/lib/services/api/endpoints'; // Import APIs
import { useAuth } from '@/features/auth/hooks/useAuth'; // Import auth if needed

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
  voteIssue: (id: string) => Promise<Issue>;
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
  
  // Search & Filter
  searchIssues: (query: string) => Promise<void>;
}

interface UseIssuesOptions {
  initialFilters?: any;
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
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  
  const { user } = useAuth(); // If you need user info

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
      };
      
      const response = await issuesAPI.getIssues(params);
      const issuesData = response.data || [];
      
      if (reset) {
        setIssues(issuesData);
      } else {
        setIssues(prev => [...prev, ...issuesData]);
      }
      
      // Calculate pagination
      const total = response.data.total || issuesData.length;
      const calculatedTotalPages = Math.ceil(total / pageSize);
      setTotalPages(calculatedTotalPages);
      setHasMore(pageNum < calculatedTotalPages);
      
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch issues');
      console.error('Error fetching issues:', err);
      
      // Fallback for development
      if (process.env.NODE_ENV !== 'production') {
        const mockIssues: Issue[] = [
          {
            id: '1',
            title: 'Pothole on Main Street',
            description: 'Large pothole causing traffic issues',
            status: 'in_progress',
            priority: 'high',
            category: 'infrastructure',
            reporter: {
              id: 'user123',
              name: 'John Doe',
            },
            location: '123 Main St, Downtown (40.7128, -74.0060)',
            images: [],
            upvotes: 15,
            views: 30,
            assignedTo: {
              id: "volunteer12",
              name: "Jaspreet",
              role: 'volunteer',
            },
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            latitude: 0,
            longitude: 0,
            reporterId: '',
            commentsCount: 0,
            reportedAt: ''
          }
        ];
        setIssues(mockIssues);
        setHasMore(false);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, pageSize]);

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
    try {
      const response = await issuesAPI.createIssue(issueData);
      const newIssue = response.data || response;
      
      setIssues(prev => [newIssue, ...prev]);
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
      
      setIssues(prev => prev.map(issue => 
        issue.id === id ? updatedIssue : issue
      ));
      
      return updatedIssue;
    } catch (err: any) {
      console.error('Error updating issue:', err);
      throw err;
    }
  };

  const deleteIssue = async (id: string): Promise<void> => {
    try {
      await issuesAPI.deleteIssue(id);
      setIssues(prev => prev.filter(issue => issue.id !== id));
    } catch (err: any) {
      console.error('Error deleting issue:', err);
      throw err;
    }
  };

  const voteIssue = async (id: string): Promise<Issue> => {
    try {
      const response = await issuesAPI.voteIssue(id);
      const updatedIssue = response.data || response;
      
      setIssues(prev => prev.map(issue => 
        issue.id === id ? updatedIssue : issue
      ));
      
      return updatedIssue;
    } catch (err: any) {
      console.error('Error voting on issue:', err);
      throw err;
    }
  };

  const claimIssue = async (id: string): Promise<Issue> => {
    try {
      const response = await issuesAPI.claimIssue(id);
      const updatedIssue = response.data || response;
      
      setIssues(prev => prev.map(issue => 
        issue.id === id ? updatedIssue : issue
      ));
      
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
      
      setIssues(prev => prev.map(issue => 
        issue.id === issueId 
          ? { 
              ...issue, 
              comments: [...(issue.comments || []), newComment],
              updatedAt: new Date().toISOString()
            }
          : issue
      ));
      
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
      // First check local state
      const localIssue = issues.find(issue => issue.id === id);
      if (localIssue) return localIssue;
      
      // Fetch from API if not found locally
      const response = await issuesAPI.getIssue(id);
      return response.data || response;
    } catch (err: any) {
      console.error('Error fetching issue by ID:', err);
      throw err;
    }
  };

  const getIssuesByStatus = (status: Issue['status']): Issue[] => {
    return issues.filter(issue => issue.status === status);
  };

  const getIssuesByCategory = (category: string): Issue[] => {
    return issues.filter(issue => issue.category === category);
  };

  const getIssuesByReporter = (reporterId: string): Issue[] => {
    return issues.filter(issue => issue.reporterId === reporterId);
  };

  const getFilteredIssues = (filters: Partial<Issue>): Issue[] => {
    return issues.filter(issue => {
      return Object.entries(filters).every(([key, value]) => {
        // @ts-ignore
        return issue[key] === value;
      });
    });
  };

  const searchIssues = async (query: string): Promise<void> => {
    try {
      setLoading(true);
      const params = { search: query, ...filters };
      const response = await issuesAPI.getIssues(params);
      const issuesData = response.data || [];
      setIssues(issuesData);
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
    
    // Search
    searchIssues,
  };
};