import React, { useState } from 'react';
import IconButton from '../../../../components/UI/buttons/IconButton';
import { ShareIcon } from '../../../../components/UI/icons';
import ConfirmModal from '../../../../components/UI/modals/ConfirmModal';

interface ShareButtonProps {
  issueId: string;
  issueTitle?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ issueId, issueTitle = 'Community Issue' }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);

  const shareUrl = `${window.location.origin}/issues/${issueId}`;
  const shareText = `Check out this community issue: ${issueTitle}`;

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
      setShowShareOptions(false);
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy link. Please try again.');
    }
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: '🔗',
      action: copyToClipboard,
    },
    {
      name: 'Facebook',
      icon: '📘',
      action: shareOnFacebook,
    },
    {
      name: 'Twitter',
      icon: '🐦',
      action: shareOnTwitter,
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      action: shareOnWhatsApp,
    },
  ];

  return (
    <>
      <IconButton
        icon={ShareIcon}
        onClick={() => setShowShareOptions(true)}
        title="Share this issue"
      />

      <ConfirmModal
        isOpen={showShareOptions}
        onClose={() => setShowShareOptions(false)}
        onConfirm={() => {}}
        title="Share This Issue"
        message="Help spread awareness by sharing this issue with others."
        confirmText=""
        cancelText="Close"
        size="sm"
      >
        <div className="space-y-3">
          {shareOptions.map(option => (
            <button
              key={option.name}
              onClick={option.action}
              className="flex items-center space-x-3 w-full p-3 text-left rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-xl">{option.icon}</span>
              <span className="font-medium text-gray-900">{option.name}</span>
            </button>
          ))}
        </div>
      </ConfirmModal>
    </>
  );
};

export default ShareButton;