'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
import ConfirmModal from '@/components/UI/modals/ConfirmModal';
import { issuesAPI } from '@/lib/services/api/endpoints';

interface ClaimButtonProps {
  issueId: string;
  currentStatus: string;
  onClaim?: (issueId: string) => void;
  disabled?: boolean;
  className?: string;
}

const ClaimButton: React.FC<ClaimButtonProps> = ({ 
  issueId, 
  currentStatus, 
  onClaim,
  disabled = false,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const canClaim = user?.role === 'volunteer' && 
                  ['reported', 'in_review'].includes(currentStatus);

  const handleClaim = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/issues');
      return;
    }

    if (user?.role !== 'volunteer') {
      alert('Only volunteers can claim issues');
      return;
    }

    if (!canClaim) {
      alert('This issue cannot be claimed at the moment');
      return;
    }

    setShowConfirm(true);
  };

  const confirmClaim = async () => {
    setIsLoading(true);
    setShowConfirm(false);
    
    try {
      // Call API to claim issue
      await issuesAPI.claimIssue(issueId);
      
      // Call parent callback if provided
      onClaim?.(issueId);
      
      // Show success message
      console.log('Issue claimed successfully:', issueId);
      
      // Optionally refresh the page or update state
      if (window.location.pathname.includes('/issues/')) {
        router.refresh();
      }
      
    } catch (error) {
      console.error('Claim failed:', error);
      alert('Failed to claim issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!canClaim) {
    return null;
  }

  return (
    <>
      <PrimaryButton
        onClick={handleClaim}
        disabled={isLoading || disabled}
        className={`px-4 ${className}`}
        isLoading={isLoading}
      >
        {isLoading ? 'Claiming...' : 'Claim Issue'}
      </PrimaryButton>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmClaim}
        title="Claim This Issue?"
        message="By claiming this issue, you're committing to work on resolving it. This will assign the issue to you and notify the reporter."
        confirmText="Yes, Claim It"
        cancelText="Cancel"
        variant="info"
      />
    </>
  );
};

export default ClaimButton;