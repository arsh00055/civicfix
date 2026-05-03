'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HandThumbUpIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid } from '@heroicons/react/24/solid';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { issuesAPI } from '@/lib/services/api/endpoints';
import notificationService from '@/lib/services/notificationService';

interface VoteButtonProps {
  issueId: string;
  initialVotes: number;
  initialHasVoted?: boolean;
  onVote?: (issueId: string, voted: boolean) => void;
  className?: string;
  showCount?: boolean;
}

const VoteButton: React.FC<VoteButtonProps> = ({ 
  issueId, 
  initialVotes, 
  initialHasVoted = false,
  onVote,
  className = '',
  showCount = true
}) => {
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isLoading, setIsLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Check if user has already voted on this issue
  useEffect(() => {
    const checkUserVote = async () => {
      if (user?.id && issueId && !initialHasVoted) {
        try {
          const issueResponse = await issuesAPI.getIssue(issueId);
          const issueData = issueResponse.data;
          
          // Check if user has voted based on voters array
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
  }, [user?.id, issueId, initialHasVoted]);

  const handleVote = async () => {
    if (!isAuthenticated || !user?.id) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (isLoading || !initialCheckDone) return;

    setIsLoading(true);
    try {
      const response = await issuesAPI.voteIssue(issueId);
      const result = response.data;
      
      // Update based on API response
      setHasVoted(result.voted);
      setVotes(result.upvotes);
      
      onVote?.(issueId, result.voted);
      
      if (result.voted) {
        notificationService.showSuccessNotification('Vote added!');
      } else {
        notificationService.showInfoNotification('Vote removed');
      }
      
    } catch (error) {
      console.error('Vote failed:', error);
      notificationService.showErrorNotification('Failed to vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClass = `flex items-center cursor-pointer justify-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
    hasVoted
      ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`;

  const iconClass = `h-5 w-5 transition-transform ${
    hasVoted ? 'scale-110' : ''
  } ${isLoading ? 'animate-pulse' : ''}`;

  return (
    <button
      onClick={handleVote}
      disabled={isLoading || !initialCheckDone}
      className={buttonClass}
      title={hasVoted ? 'Remove vote' : 'Vote for this issue'}
      aria-label={hasVoted ? 'Remove vote' : 'Vote for this issue'}
    >
      {hasVoted ? (
        <HandThumbUpSolid className={iconClass} />
      ) : (
        <HandThumbUpIcon className={iconClass} />
      )}
      {showCount && (
        <span className="text-sm font-medium min-w-[20px] text-center">
          {votes}
        </span>
      )}
    </button>
  );
};

export default VoteButton;