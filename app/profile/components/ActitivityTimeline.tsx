'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatRelativeTime, formatDateTime } from '@/lib/utils/helpers/formatters';
import { usersAPI } from '@/lib/services/api/endpoints';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { UserActivity } from '@/types/user.types';

const ActivityTimeline: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      const response = await usersAPI.getUserActivity(user.id);
      setActivities(response.data?.slice(0, 5) || []); // Show only 5 activities
      
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'issue_reported': return '📝';
      case 'issue_resolved': return '✅';
      case 'comment_added': return '💬';
      case 'achievement_unlocked': return '🏆';
      case 'task_completed': return '🎯';
      case 'profile_updated': return '👤';
      default: return '🔔';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'issue_reported': return 'text-blue-600 bg-blue-100';
      case 'issue_resolved': return 'text-green-600 bg-green-100';
      case 'comment_added': return 'text-purple-600 bg-purple-100';
      case 'achievement_unlocked': return 'text-yellow-600 bg-yellow-100';
      case 'task_completed': return 'text-green-600 bg-green-100';
      case 'profile_updated': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleViewAllActivity = () => {
    // Could navigate to full activity page if exists
    console.log('View all activity');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        {activities.length > 0 && (
          <button 
            onClick={handleViewAllActivity}
            className="text-sm text-blue-600 cursor-pointer hover:text-blue-500 font-medium"
          >
            View All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex space-x-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              {index < activities.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 mt-2" />
              )}
            </div>

            {/* Activity content */}
            <div className="flex-1 pb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                  <span className="text-sm text-gray-500">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{activity.description}</p>
                <p className="text-xs text-gray-400">
                  {formatDateTime(activity.timestamp)}
                </p>

                {/* Action buttons */}
                {activity.metadata?.issueId && (
                  <div className="mt-3 flex space-x-2">
                    <button 
                      onClick={() => router.push(`/issues/${activity.metadata?.issueId}`)}
                      className="text-sm cursor-pointer text-blue-600 hover:text-blue-500 font-medium"
                    >
                      View Issue
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity.</p>
            <p className="text-sm mt-1">Your activity will appear here.</p>
          </div>
        )}
      </div>

      {activities.length > 0 && activities.length >= 5 && (
        <div className="mt-6 text-center">
          <button 
            onClick={handleViewAllActivity}
            className="text-blue-600 cursor-pointer hover:text-blue-500 font-medium"
          >
            View All Activity →
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;