import React from 'react';
import type { UserActivity } from '../../../types';
import { formatRelativeTime, formatDateTime } from '../../../utils/helpers/formatters';

const ActivityTimeline: React.FC = () => {
  const activities: UserActivity[] = [
    {
      id: '1',
      type: 'issue_reported',
      title: 'Reported New Issue',
      description: 'Pothole on Main Street',
      timestamp: '2024-01-15T14:20:00Z',
      metadata: { issueId: '1' }
    },
    {
      id: '2',
      type: 'comment_added',
      title: 'Added Comment',
      description: 'On "Broken Street Light" issue',
      timestamp: '2024-01-14T10:30:00Z',
      metadata: { issueId: '2' }
    },
    {
      id: '3',
      type: 'achievement_unlocked',
      title: 'Achievement Unlocked',
      description: 'First Issue Reporter',
      timestamp: '2024-01-10T08:00:00Z',
      metadata: { achievementId: 'first_issue' }
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'issue_reported': return '📝';
      case 'issue_resolved': return '✅';
      case 'comment_added': return '💬';
      case 'achievement_unlocked': return '🏆';
      default: return '🔔';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'issue_reported': return 'text-blue-600 bg-blue-100';
      case 'issue_resolved': return 'text-green-600 bg-green-100';
      case 'comment_added': return 'text-purple-600 bg-purple-100';
      case 'achievement_unlocked': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>

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
                      onClick={() => window.location.href = `/issues/${activity.metadata.issueId}`}
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium"
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

      {activities.length > 0 && (
        <div className="mt-6 text-center">
          <button className="text-blue-600 hover:text-blue-500 font-medium">
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;