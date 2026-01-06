'use client';

import React from 'react';
import type { Notification } from '@/types';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notificationId: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onNotificationClick,
}) => {
  const groupNotificationsByDate = (notifs: Notification[]) => {
    const groups: Record<string, Notification[]> = {};
    
    notifs.forEach(notification => {
      const date = new Date(notification.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });
    
    return groups;
  };

  const getGroupHeader = (dateString: string): string => {
    const today = new Date();
    const date = new Date(dateString);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    const diffInDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <div className="divide-y divide-gray-100">
      {Object.entries(groupedNotifications).map(([date, dayNotifications]) => (
        <div key={date}>
          {/* Date Header */}
          <div className="px-4 py-2 bg-gray-50 sticky top-0 z-10">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {getGroupHeader(date)}
            </span>
          </div>

          {/* Notifications for this date */}
          {dayNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={onNotificationClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default NotificationList;