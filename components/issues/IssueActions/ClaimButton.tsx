'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
import ConfirmModal from '@/components/UI/modals/ConfirmModal';
import { issuesAPI } from '@/lib/services/api/endpoints';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

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
  const [isClaimed, setIsClaimed] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const canClaim = user?.role === 'volunteer' && 
                  ['reported', 'in_review'].includes(currentStatus) &&
                  !isClaimed;

  const handleClaim = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/issues');
      return;
    }

    if (user?.role !== 'volunteer') {
      toast.warning('Only volunteers can claim issues');
      return;
    }

    if (!canClaim) {
      toast.error('This issue cannot be claimed at the moment');
      return;
    }

    setShowConfirm(true);
  };

  const confirmClaim = async () => {
    setIsLoading(true);
    setShowConfirm(false);
    
    try {
      await issuesAPI.claimIssue(issueId);
      setIsClaimed(true);
      onClaim?.(issueId);
      toast.success('🎉 Issue claimed successfully! You are now responsible for resolving this issue.');
      
      if (window.location.pathname.includes('/issues/')) {
        router.refresh();
      }
      
    } catch (error) {
      console.error('Claim failed:', error);
      toast.error('Failed to claim issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If user can't claim but is a volunteer, show "Claimed" button
  if (user?.role === 'volunteer') {
    if (!canClaim && isClaimed) {
      return (
        <PrimaryButton
          disabled={true}
          className={`px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-lg shadow-sm ${className}`}
        >
          <CheckCircleIcon className="h-5 w-5 inline mr-2" />
          Claimed
        </PrimaryButton>
      );
    }
    
    if (!canClaim && !isClaimed) {
      return null;
    }
  } else {
    return null;
  }

  return (
    <>
      <PrimaryButton
        onClick={handleClaim}
        disabled={isLoading || disabled}
        className={`px-6 py-3 bg-gradient-to-r cursor-pointer from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${className}`}
        isLoading={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Claiming...
          </span>
        ) : (
          'Claim Issue'
        )}
      </PrimaryButton>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmClaim}
        title="Ready to Make a Difference?"
        message="By claiming this issue, you're taking responsibility to help your community. The reporter will be notified, and this issue will be assigned to you."
        confirmText="Yes, I'll Handle It"
        cancelText="Not Now"
        variant="info"
      />
    </>
  );
};

export default ClaimButton;