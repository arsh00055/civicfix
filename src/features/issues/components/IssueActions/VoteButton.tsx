import React, { useState } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { HeartIcon } from '../../../../components/UI/icons';
import NotificationService from '../../../../services/notificationService';

interface VoteButtonProps {
  issueId: string;
  initialVotes: number;
  onVote?: (issueId: string, voted: boolean) => void;
}

const VoteButton: React.FC<VoteButtonProps> = ({ 
  issueId, 
  initialVotes, 
  onVote 
}) => {
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleVote = async () => {
    if (!isAuthenticated) {
      NotificationService.showInfoNotification('Please log in to vote on issues');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (hasVoted) {
        setVotes(prev => prev - 1);
        setHasVoted(false);
        onVote?.(issueId, false);
        NotificationService.showInfoNotification('Vote removed');
      } else {
        setVotes(prev => prev + 1);
        setHasVoted(true);
        onVote?.(issueId, true);
        NotificationService.showSuccessNotification('Vote recorded!');
      }
    } catch (error) {
      console.error('Vote failed:', error);
      NotificationService.showErrorNotification('Failed to vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={isLoading}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
        hasVoted
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <HeartIcon className={`h-4 w-4 ${hasVoted ? 'fill-red-600' : ''}`} />
      <span className="text-sm font-medium">{votes}</span>
    </button>
  );
};

export default VoteButton;