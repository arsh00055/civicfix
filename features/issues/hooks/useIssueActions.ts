'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import notificationService from '@/lib/services/notificationService';

interface UseIssueActionsReturn {
  loading: boolean;
  voteIssue: (issueId: string) => Promise<boolean>;
  claimIssue: (issueId: string) => Promise<boolean>;
  updateIssueStatus: (issueId: string, status: string) => Promise<boolean>;
  addComment: (issueId: string, content: string) => Promise<boolean>;
  shareIssue: (issueId: string) => Promise<boolean>;
  reportIssue: (issueId: string, reason: string) => Promise<boolean>;
}

export const useIssueActions = (): UseIssueActionsReturn => {
  const [loading, setLoading] = useState(false);
  const { userRole, user } = useAuth();

  const voteIssue = useCallback(async (issueId: string): Promise<boolean> => {
    if (loading) return false;

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      notificationService.showSuccessNotification('Your vote has been recorded successfully!');

      return true;
    } catch (error: any) {
      console.error('Vote failed:', error);
      
      notificationService.showErrorNotification('Failed to vote. Please try again.');
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const claimIssue = useCallback(async (issueId: string): Promise<boolean> => {
    if (userRole !== 'volunteer') {
      notificationService.showErrorNotification('Only volunteers can claim issues.');
      return false;
    }

    if (loading) return false;

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notificationService.showSuccessNotification('Issue claimed successfully! You can now start working on it.');
      
      return true;
    } catch (error: any) {
      console.error('Claim failed:', error);
      
      notificationService.showErrorNotification('Failed to claim issue. Please try again.');
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [loading, userRole]);

  const updateIssueStatus = useCallback(async (issueId: string, status: string): Promise<boolean> => {
    if (!user || userRole !== 'volunteer') {
      notificationService.showErrorNotification('Only assigned volunteers can update issue status.');
      return false;
    }

    if (loading) return false;

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const statusDisplay = status.replace('_', ' ').toLowerCase();
      notificationService.showSuccessNotification(`Issue status updated to "${statusDisplay}".`);
      
      return true;
    } catch (error: any) {
      console.error('Status update failed:', error);
      
      notificationService.showErrorNotification('Failed to update status. Please try again.');
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [loading, user, userRole]);

  const addComment = useCallback(async (issueId: string, content: string): Promise<boolean> => {
    if (!user) {
      notificationService.showErrorNotification('Please log in to add comments.');
      return false;
    }

    if (loading) return false;

    if (!content.trim()) {
      notificationService.showErrorNotification('Comment cannot be empty.');
      return false;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      notificationService.showSuccessNotification('Your comment has been posted successfully!');
      
      return true;
    } catch (error: any) {
      console.error('Comment failed:', error);
      
      notificationService.showErrorNotification('Failed to add comment. Please try again.');
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [loading, user]);

  const shareIssue = useCallback(async (issueId: string): Promise<boolean> => {
    try {
      const shareUrl = `${window.location.origin}/issues/${issueId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Community Issue',
          text: 'Check out this community issue that needs attention!',
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        notificationService.showSuccessNotification('Issue link copied to clipboard!');
      }
      
      return true;
    } catch (error: any) {
      console.error('Share failed:', error);
      
      notificationService.showErrorNotification('Failed to share issue. Please try again.');
      
      return false;
    }
  }, []);

  const reportIssue = useCallback(async (issueId: string, reason: string): Promise<boolean> => {
    if (!user) {
      notificationService.showErrorNotification('Please log in to report issues');
      return false;
    }

    if (loading) return false;

    if (!reason.trim()) {
      notificationService.showErrorNotification('Please provide a reason for reporting.');
      return false;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      notificationService.showSuccessNotification('Thank you for reporting. Our team will review this issue.');
      
      return true;
    } catch (error: any) {
      console.error('Report failed:', error);
      
      notificationService.showErrorNotification('Failed to report issue. Please try again.');
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [loading, user]);

  return {
    loading,
    voteIssue,
    claimIssue,
    updateIssueStatus,
    addComment,
    shareIssue,
    reportIssue,
  };
};