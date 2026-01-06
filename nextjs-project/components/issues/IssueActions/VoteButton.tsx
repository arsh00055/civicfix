'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { HeartIcon } from '@/components/UI/icons';
import { issuesAPI } from '@/lib/services/api/endpoints';
import notificationService from '@/lib/services/notificationService';

interface VoteButtonProps {
  issueId: string;
  initialVotes: number;
  onVote?: (issueId: string, voted: boolean) => void;
  className?: string;
  showCount?: boolean;
}

const VoteButton: React.FC<VoteButtonProps> = ({ 
  issueId, 
  initialVotes, 
  onVote,
  className = '',
  showCount = true
}) => {
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Check if user has already voted on this issue
  useEffect(() => {
    const checkUserVote = async () => {
      if (user?.id && issueId) {
        try {
          // Use getIssue endpoint to check if user has voted
          // In a real app, you might need to check the issue data
          // or have a separate endpoint for checking votes
          const issueResponse = await issuesAPI.getIssue(issueId);
          const issueData = issueResponse.data;
          
          // Assuming issueData has a voters array or similar
          // This is a simplified check - adjust based on your actual API response
          if (issueData && issueData.voters && Array.isArray(issueData.voters)) {
            setHasVoted(issueData.voters.includes(user.id));
          }
        } catch (error) {
          console.error('Failed to check vote status:', error);
        } finally {
          setInitialCheckDone(true);
        }
      } else {
        setInitialCheckDone(true);
      }
    };

    checkUserVote();
  }, [user?.id, issueId]);

  const handleVote = async () => {
    if (!isAuthenticated || !user?.id) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (isLoading || !initialCheckDone) return;

    setIsLoading(true);
    try {
      // Use the existing voteIssue endpoint
      const response = await issuesAPI.voteIssue(issueId);
      
      // Toggle vote state
      if (hasVoted) {
        // Vote removed - your API should handle toggling
        setVotes(prev => Math.max(0, prev - 1));
        setHasVoted(false);
        onVote?.(issueId, false);
        notificationService.showInfoNotification('Vote removed');
      } else {
        // Vote added
        setVotes(prev => prev + 1);
        setHasVoted(true);
        onVote?.(issueId, true);
        notificationService.showSuccessNotification('Vote recorded!');
      }
      
      // Optionally update from response if available
      if (response.data && response.data.votes !== undefined) {
        setVotes(response.data.votes);
      }
      
    } catch (error) {
      console.error('Vote failed:', error);
      notificationService.showErrorNotification('Failed to vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClass = `flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
    hasVoted
      ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`;

  const iconClass = `h-5 w-5 transition-transform ${
    hasVoted ? 'fill-red-600 scale-110' : ''
  } ${isLoading ? 'animate-pulse' : ''}`;

  return (
    <button
      onClick={handleVote}
      disabled={isLoading || !initialCheckDone}
      className={buttonClass}
      title={hasVoted ? 'Remove vote' : 'Vote for this issue'}
      aria-label={hasVoted ? 'Remove vote' : 'Vote for this issue'}
    >
      <HeartIcon className={iconClass} />
      {showCount && (
        <span className="text-sm font-medium min-w-[20px] text-center">
          {votes}
        </span>
      )}
    </button>
  );
};

export default VoteButton;