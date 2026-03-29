'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserPlusIcon,
  TrophyIcon,
  ChatBubbleLeftIcon,
  HandThumbUpIcon,
  BriefcaseIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  timestamp: string;
  user: string;
  actionUrl?: string;
  metadata?: {
    issueId?: string;
    userId?: string;
    achievementId?: string;
    commentId?: string;
    volunteerName?: string;
    reporterName?: string;
    commenterName?: string;
  };
}

interface RecentActivityProps {
  notifications?: Notification[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onViewAll?: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  notifications = [],
  loading = false,
  error = null,
  onRefresh,
  onViewAll,
  onNotificationClick
}) => {
  const router = useRouter();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'issue_reported':
      case 'new_issue_alert':
      case 'urgent_issue_alert':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'issue_resolved':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'task_claimed':
      case 'issue_assigned':
        return <BriefcaseIcon className="h-5 w-5 text-blue-600" />;
      case 'task_completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'achievement_unlocked':
        return <TrophyIcon className="h-5 w-5 text-purple-600" />;
      case 'issue_commented':
        return <ChatBubbleLeftIcon className="h-5 w-5 text-indigo-600" />;
      case 'issue_voted':
        return <HandThumbUpIcon className="h-5 w-5 text-blue-600" />;
      case 'user_registered':
      case 'volunteer_joined':
        return <UserPlusIcon className="h-5 w-5 text-green-600" />;
      case 'issue_in_progress':
        return <ClockIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <span className="text-gray-600 text-lg">🔔</span>;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'issue_reported':
      case 'new_issue_alert':
      case 'urgent_issue_alert':
        return 'bg-yellow-100';
      case 'issue_resolved':
      case 'task_completed':
        return 'bg-green-100';
      case 'task_claimed':
      case 'issue_assigned':
        return 'bg-blue-100';
      case 'achievement_unlocked':
        return 'bg-purple-100';
      case 'issue_commented':
        return 'bg-indigo-100';
      case 'issue_voted':
        return 'bg-blue-100';
      case 'user_registered':
      case 'volunteer_joined':
        return 'bg-green-100';
      case 'issue_in_progress':
        return 'bg-cyan-100';
      default:
        return 'bg-gray-100';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (notification.actionUrl) {
      router.push(notification.actionUrl);
    } else if (notification.metadata?.issueId) {
      router.push(`/issues/${notification.metadata.issueId}`);
    } else if (notification.metadata?.achievementId) {
      router.push('/profile/achievements');
    } else if (notification.metadata?.userId) {
      router.push(`/profile/${notification.metadata.userId}`);
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      router.push('/notifications');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse flex items-start space-x-4 p-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Retry
            </button>
          )}
        </div>
        <div className="text-center py-6 text-gray-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Refresh
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className="w-full flex items-start space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer text-left"
            >
              <div className={`w-10 h-10 ${getActivityColor(notification.type)} rounded-full flex items-center justify-center shadow-sm flex-shrink-0`}>
                {getActivityIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {notification.message}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-400 space-x-2">
                  <span>{notification.time}</span>
                  <span>•</span>
                  <span className="font-medium truncate">{notification.user}</span>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No recent activity</p>
            <p className="text-sm mt-1">Activity will appear here as things happen</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button 
            onClick={handleViewAll}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;