import { useState, useEffect } from 'react';
import type { Issue } from '../../../types';
import { issuesAPI, commentsAPI } from '../../../services/api/endpoints';

export const useIssues = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await issuesAPI.getIssues();
      setIssues(response.data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch issues');
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const addIssue = async (issueData: any) => {
    try {
      const response = await issuesAPI.createIssue(issueData);
      const newIssue = response.data;
      setIssues(prev => [newIssue, ...prev]);
      return newIssue;
    } catch (err) {
      console.error('Error creating issue:', err);
      throw err;
    }
  };

  const updateIssue = async (id: string, updates: Partial<Issue>) => {
    try {
      const response = await issuesAPI.updateIssue(id, updates);
      const updatedIssue = response.data;
      
      setIssues(prev => prev.map(issue => 
        issue.id === id ? updatedIssue : issue
      ));
      
      return updatedIssue;
    } catch (err) {
      console.error('Error updating issue:', err);
      throw err;
    }
  };

  const deleteIssue = async (id: string) => {
    try {
      await issuesAPI.deleteIssue(id);
      setIssues(prev => prev.filter(issue => issue.id !== id));
    } catch (err) {
      console.error('Error deleting issue:', err);
      throw err;
    }
  };

  const voteIssue = async (id: string) => {
    try {
      const response = await issuesAPI.voteIssue(id);
      const updatedIssue = response.data;
      
      setIssues(prev => prev.map(issue => 
        issue.id === id ? updatedIssue : issue
      ));
      
      return updatedIssue;
    } catch (err) {
      console.error('Error voting on issue:', err);
      throw err;
    }
  };

  const claimIssue = async (id: string) => {
    try {
      const response = await issuesAPI.claimIssue(id);
      const updatedIssue = response.data;
      
      setIssues(prev => prev.map(issue => 
        issue.id === id ? updatedIssue : issue
      ));
      
      return updatedIssue;
    } catch (err) {
      console.error('Error claiming issue:', err);
      throw err;
    }
  };

  const addComment = async (issueId: string, commentData: { text: string }) => {
    try {
      const response = await commentsAPI.addComment(issueId, commentData);
      const newComment = response.data;
      
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
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const getIssueComments = async (issueId: string) => {
    try {
      const response = await commentsAPI.getComments(issueId);
      return response.data;
    } catch (err) {
      console.error('Error fetching comments:', err);
      throw err;
    }
  };

  const getMyReports = async () => {
    try {
      const response = await issuesAPI.getMyReports();
      return response.data;
    } catch (err) {
      console.error('Error fetching my reports:', err);
      throw err;
    }
  };

  const getIssueById = async (id: string): Promise<Issue | undefined> => {
    try {
      const response = await issuesAPI.getIssue(id);
      return response.data;
    } catch (err) {
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

  return {
    // State
    issues,
    loading,
    error,
    
    // Actions
    refetch: fetchIssues,
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
  };
};