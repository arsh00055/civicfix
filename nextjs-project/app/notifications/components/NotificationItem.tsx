'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { Notification } from '@/types';
import { formatRelativeTime } from '@/lib/utils/helpers/formatters';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notificationId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const router = useRouter();

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      'issue_update': '🔔',
      'new_comment': '💬',
      'issue_resolved': '✅',
      'volunteer_assigned': '👤',
      'achievement_unlocked': '🏆',
      'system_alert': '⚠️',
    };
    return icons[type] || '📢';
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      'issue_resolved': 'text-green-600 bg-green-100',
      'achievement_unlocked': 'text-green-600 bg-green-100',
      'system_alert': 'text-red-600 bg-red-100',
      'volunteer_assigned': 'text-blue-600 bg-blue-100',
      'issue_update': 'text-orange-600 bg-orange-100',
      'new_comment': 'text-purple-600 bg-purple-100',
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  const handleClick = () => {
    if (!notification.read) {
      onClick(notification.id);
    }
    
    // Navigate based on notification metadata
    if (notification.metadata?.issueId) {
      router.push(`/issues/${notification.metadata.issueId}`);
    } else if (notification.metadata?.achievementId) {
      router.push('/profile?section=achievements');
    } else if (notification.metadata?.url) {
      router.push(notification.metadata.url);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: any) => {
    e.stopPropagation();
    action.onClick?.();
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
        notification.read 
          ? 'bg-white hover:bg-gray-50' 
          : 'bg-blue-50 hover:bg-blue-100 border-l-2 border-blue-500'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
          <span className="text-sm">{getNotificationIcon(notification.type)}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 font-medium line-clamp-2">
            {notification.title}
          </p>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {formatRelativeTime(notification.timestamp)}
          </p>
        </div>

        {/* Unread indicator */}
        {!notification.read && (
          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
        )}
      </div>

      {/* Actions */}
      {notification.actions && notification.actions.length > 0 && (
        <div className="flex space-x-2 mt-3 ml-11">
          {notification.actions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => handleActionClick(e, action)}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationItem;