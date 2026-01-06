'use client';

import React from 'react';
import { MapPinIcon, ClockIcon, UserIcon } from '@/components/UI/icons';
import type { Issue } from '@/types';

type Priority = 'low' | 'medium' | 'high' | 'critical';

interface TaskCardProps {
  task: Issue;
  isClaiming: boolean;
  onClaimTask: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isClaiming, onClaimTask }) => {
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstimatedTime = (priority: Priority): string => {
    switch (priority) {
      case 'critical': return '1-2 hours';
      case 'high': return '2-4 hours';
      case 'medium': return '4-8 hours';
      case 'low': return '1-2 days';
      default: return 'Varies';
    }
  };

  const getSkillsForCategory = (category: string): string[] => {
    switch (category) {
      case 'infrastructure':
        return ['construction', 'safety', 'repair'];
      case 'safety':
        return ['safety', 'inspection', 'emergency'];
      case 'sanitation':
        return ['cleaning', 'environment', 'maintenance'];
      case 'utilities':
        return ['technical', 'repair', 'maintenance'];
      case 'environment':
        return ['cleaning', 'environment', 'conservation'];
      default:
        return ['general', 'community'];
    }
  };

  const skills = getSkillsForCategory(task.category);
  const estimatedTime = getEstimatedTime(task.priority as Priority);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{task.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority as Priority)}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>

      {/* Task Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{task.location}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Estimated: {estimatedTime}</span>
        </div>
        {task.reporter && (
          <div className="flex items-center text-sm text-gray-500">
            <UserIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Reported by: {task.reporter.name}</span>
          </div>
        )}
      </div>

      {/* Category */}
      <div className="mb-3">
        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
          {task.category.charAt(0).toUpperCase() + task.category.slice(1).replace('_', ' ')}
        </span>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Skills Required:</div>
        <div className="flex flex-wrap gap-2">
          {skills.map(skill => (
            <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-auto">
        <span className="text-sm text-gray-500">
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
        <button
          onClick={() => onClaimTask(task.id)}
          disabled={isClaiming}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          {isClaiming ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Claiming...</span>
            </>
          ) : (
            <span>Claim Task</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;