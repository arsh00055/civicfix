import React, { useState } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import PrimaryButton from '../../../../components/UI/buttons/PrimaryButton';
import ConfirmModal from '../../../../components/UI/modals/ConfirmModal';

interface ClaimButtonProps {
  issueId: string;
  currentStatus: string;
  onClaim?: (issueId: string) => void;
}

const ClaimButton: React.FC<ClaimButtonProps> = ({ 
  issueId, 
  currentStatus, 
  onClaim 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { isAuthenticated, userRole } = useAuth();

  const canClaim = userRole === 'volunteer' && 
                  ['reported', 'in_review'].includes(currentStatus);

  const handleClaim = async () => {
    if (!isAuthenticated) {
      alert('Please log in to claim issues');
      return;
    }

    if (userRole !== 'volunteer') {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Issue claimed:', issueId);
      onClaim?.(issueId);
      alert('Issue claimed successfully!');
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
        disabled={isLoading}
        className="px-4"
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