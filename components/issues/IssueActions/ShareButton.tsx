'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import IconButton from '@/components/UI/buttons/IconButton';
import { ShareIcon } from '@/components/UI/icons';
import ConfirmModal from '@/components/UI/modals/ConfirmModal';

interface ShareButtonProps {
  issueId: string;
  issueTitle?: string;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  issueId, 
  issueTitle = 'Community Issue',
  className = ''
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const pathname = usePathname();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const shareUrl = `${baseUrl}/issues/${issueId}`;
  const shareText = `Check out this community issue: ${issueTitle}`;

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareOptions(false);
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareOptions(false);
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareOptions(false);
  };

  const shareByEmail = () => {
    const subject = `Community Issue: ${issueTitle}`;
    const body = `${shareText}\n\nView details: ${shareUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    setShowShareOptions(false);
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
      color: 'text-blue-600'
    },
    {
      name: 'Facebook',
      icon: '📘',
      action: shareOnFacebook,
      color: 'text-blue-700'
    },
    {
      name: 'Twitter',
      icon: '🐦',
      action: shareOnTwitter,
      color: 'text-sky-500'
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      action: shareOnWhatsApp,
      color: 'text-green-600'
    },
    {
      name: 'Email',
      icon: '📧',
      action: shareByEmail,
      color: 'text-gray-600'
    },
  ];

  const canShare = typeof navigator !== 'undefined' && navigator.share;

  const handleNativeShare = async () => {
    if (canShare) {
      try {
        await navigator.share({
          title: issueTitle,
          text: shareText,
          url: shareUrl,
        });
        setShowShareOptions(false);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Native share failed:', error);
        }
      }
    }
  };

  return (
    <>
      <IconButton
        icon={ShareIcon}
        onClick={() => setShowShareOptions(true)}
        title="Share this issue"
        className={className}
      />

      <ConfirmModal
        isOpen={showShareOptions}
        onClose={() => setShowShareOptions(false)}
        onConfirm={() => {}}
        title="Share This Issue"
        message="Help spread awareness by sharing this issue with others."
        confirmText="Confirm"
        cancelText="Close"
        variant="info"
      >
        <div className="space-y-2">
          {canShare && (
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center space-x-3 w-full p-3 text-left rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 mb-2"
            >
              <span className="text-xl">📱</span>
              <span className="font-medium text-gray-900">Share via...</span>
            </button>
          )}
          
          {shareOptions.map(option => (
            <button
              key={option.name}
              onClick={option.action}
              className="flex items-center space-x-3 w-full p-3 text-left rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className={`text-xl ${option.color}`}>{option.icon}</span>
              <span className="font-medium text-gray-900">{option.name}</span>
            </button>
          ))}
        </div>
      </ConfirmModal>
    </>
  );
};

export default ShareButton;