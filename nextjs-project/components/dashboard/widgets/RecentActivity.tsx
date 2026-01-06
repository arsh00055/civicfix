'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserPlusIcon,
  TrophyIcon,
  ChatBubbleLeftIcon
} from '@/components/UI/icons';
import { activityAPI } from '@/lib/services/api/endpoints';

interface Activity {
  id: number;
  type: string;
  message: string;
  time: string;
  user: string;
  timestamp: string;
  metadata?: {
    issueId?: string;
    userId?: string;
    achievementId?: string;
    commentId?: string;
  };
}

const RecentActivity: React.FC = () => {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await activityAPI.getRecentActivity();
      
      // Handle different response formats safely
      if (response.data && Array.isArray(response.data.activities)) {
        setActivities(response.data.activities.slice(0, 5)); // Show only 5
      } else if (Array.isArray(response.data)) {
        setActivities(response.data.slice(0, 5));
      } else {
        console.warn('Unexpected activity response format:', response.data);
        setActivities([]);
        setError('Could not load activity data');
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      setError('Failed to load recent activity');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'issue_reported':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'issue_resolved':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'volunteer_joined':
        return <UserPlusIcon className="h-5 w-5 text-blue-600" />;
      case 'achievement_unlocked':
        return <TrophyIcon className="h-5 w-5 text-purple-600" />;
      case 'comment_added':
        return <ChatBubbleLeftIcon className="h-5 w-5 text-indigo-600" />;
      default:
        return <span className="text-gray-600 text-lg">🔔</span>;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'issue_reported':
        return 'bg-yellow-100';
      case 'issue_resolved':
        return 'bg-green-100';
      case 'volunteer_joined':
        return 'bg-blue-100';
      case 'achievement_unlocked':
        return 'bg-purple-100';
      case 'comment_added':
        return 'bg-indigo-100';
      default:
        return 'bg-gray-100';
    }
  };

  const handleActivityClick = (activity: Activity) => {
    // Navigate based on activity type
    if (activity.metadata?.issueId) {
      router.push(`/issues/${activity.metadata.issueId}`);
    } else if (activity.metadata?.userId) {
      router.push(`/profile/${activity.metadata.userId}`);
    } else if (activity.metadata?.achievementId) {
      router.push(`/profile/achievements`);
    }
  };

  const handleViewAllActivity = () => {
    router.push('/notifications');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Recent Activity</h2>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Recent Activity</h2>
        <div className="text-center py-6 text-gray-500">
          <p>{error}</p>
          <button
            onClick={fetchRecentActivity}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <button 
          onClick={fetchRecentActivity}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => handleActivityClick(activity)}
            className="w-full flex items-start space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer text-left"
          >
            <div className={`w-10 h-10 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center shadow-sm flex-shrink-0`}>
              {getActivityIcon(activity.type)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{activity.message}</p>

              <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                <span>{activity.time}</span>
                <span>•</span>
                <span className="font-medium truncate">{activity.user}</span>
              </div>
            </div>
          </button>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <p>No recent activity</p>
            <p className="text-sm mt-1">Activity will appear here as things happen</p>
          </div>
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button 
            onClick={handleViewAllActivity}
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