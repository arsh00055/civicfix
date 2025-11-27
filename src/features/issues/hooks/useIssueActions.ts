import { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import NotificationService from '../../../services/notificationService';

export const useIssueActions = () => {
  const [loading, setLoading] = useState(false);
  const { userRole } = useAuth();

  const voteIssue = async (issueId: string): Promise<boolean> => {
    if (loading) return false;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Voted on issue:', issueId);
      NotificationService.showSuccessNotification('Vote recorded!');
      return true;
    } catch (error) {
      console.error('Vote failed:', error);
      NotificationService.showErrorNotification('Failed to vote. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const claimIssue = async (issueId: string): Promise<boolean> => {
    if (userRole !== 'volunteer') {
      NotificationService.showErrorNotification('Only volunteers can claim issues');
      return false;
    }

    if (loading) return false;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Claimed issue:', issueId);
      NotificationService.showSuccessNotification('Issue claimed successfully!');
      return true;
    } catch (error) {
      console.error('Claim failed:', error);
      NotificationService.showErrorNotification('Failed to claim issue. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateIssueStatus = async (issueId: string, status: string): Promise<boolean> => {
    if (loading) return false;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Updated issue status:', issueId, status);
      NotificationService.showSuccessNotification('Status updated successfully!');
      return true;
    } catch (error) {
      console.error('Status update failed:', error);
      NotificationService.showErrorNotification('Failed to update status. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (issueId: string, content: string): Promise<boolean> => {
    if (loading) return false;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Added comment to issue:', issueId, content);
      NotificationService.showSuccessNotification('Comment added!');
      return true;
    } catch (error) {
      console.error('Comment failed:', error);
      NotificationService.showErrorNotification('Failed to add comment. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    voteIssue,
    claimIssue,
    updateIssueStatus,
    addComment,
  };
};