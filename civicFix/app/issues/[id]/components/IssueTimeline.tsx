'use client'

import React from 'react'
import type { Issue } from '@/types/issue.types'
import { formatDateTime, formatRelativeTime } from '@/lib/utils/helpers/formatters'

interface IssueTimelineProps {
  issue: Issue
}

export default function IssueTimeline({ issue }: IssueTimelineProps) {
  const timelineEvents = [
    {
      id: 1,
      type: 'created',
      title: 'Issue Reported',
      description: `Issue was reported by ${issue.reporter?.name || 'a citizen'}`,
      timestamp: issue.createdAt,
      icon: '📝',
    },
    ...(issue.status !== 'reported' ? [{
      id: 2,
      type: 'reviewed',
      title: 'Under Review',
      description: 'Issue is being reviewed by the community team',
      timestamp: new Date(issue.createdAt).toISOString(),
      icon: '👀',
    }] : []),
    ...(issue.assignedToId ? [{
      id: 3,
      type: 'assigned',
      title: 'Assigned to Volunteer',
      description: `Issue was assigned to ${issue.assignedTo?.name || 'a volunteer'}`,
      timestamp: new Date(issue.createdAt).toISOString(),
      icon: '👤',
    }] : []),
    ...(issue.status === 'in_progress' ? [{
      id: 4,
      type: 'in_progress',
      title: 'Work Started',
      description: 'Volunteer has started working on the issue',
      timestamp: new Date(issue.createdAt).toISOString(),
      icon: '⚡',
    }] : []),
    ...(issue.status === 'resolved' && issue.resolvedAt ? [{
      id: 5,
      type: 'resolved',
      title: 'Issue Resolved',
      description: 'The issue has been successfully resolved',
      timestamp: issue.resolvedAt,
      icon: '✅',
    }] : []),
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Timeline</h3>
      
      <div className="space-y-6">
        {timelineEvents.map((event, index) => (
          <div key={event.id} className="flex space-x-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                index === 0 ? 'bg-blue-100 text-blue-600' :
                index === timelineEvents.length - 1 ? 'bg-green-100 text-green-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {event.icon}
              </div>
              {index < timelineEvents.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 mt-2" aria-hidden="true" />
              )}
            </div>

            <div className="flex-1 pb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{event.title}</h4>
                  <span className="text-sm text-gray-500">
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                <p className="text-xs text-gray-400">
                  {formatDateTime(event.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {timelineEvents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No timeline events yet.</p>
        </div>
      )}
    </div>
  )
}