import React from 'react';
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '../../../../components/UI/icons';
import type { Issue } from '../../../../types';

type AssignmentStatus = 'reported' | 'in_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

interface AssignmentCardProps {
  assignment: Issue;
  isUpdating: boolean;
  onUpdateStatus: (assignmentId: string, newStatus: AssignmentStatus) => void;
  onViewDetails: (assignmentId: string) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  isUpdating,
  onUpdateStatus,
  onViewDetails
}) => {
  const getStatusIcon = (status: AssignmentStatus) => {
    switch (status) {
      case 'resolved': 
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'in_progress': 
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'assigned': 
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'reported': 
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case 'closed': 
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
      default: 
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reported': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressPercentage = (assignment: Issue): number => {
    switch (assignment.status) {
      case 'reported': return 0;
      case 'assigned': return 25;
      case 'in_progress': return 75;
      case 'resolved': return 100;
      case 'closed': return 0;
      default: return 0;
    }
  };

  const getEstimatedCompletion = (assignment: Issue): string => {
    const created = new Date(assignment.createdAt);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    if (assignment.status === 'resolved' && assignment.resolvedAt) {
      const resolved = new Date(assignment.resolvedAt);
      const resolveDays = Math.ceil((resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return `Resolved in ${resolveDays} day${resolveDays !== 1 ? 's' : ''}`;
    }
    
    return `Active for ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  const progress = getProgressPercentage(assignment);
  const canStart = assignment.status === 'assigned';
  const canComplete = assignment.status === 'in_progress';

  return (
    <div key={assignment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(assignment.status as AssignmentStatus)}
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(assignment.priority)}`}>
                {assignment.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status as AssignmentStatus)}`}>
                {assignment.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{assignment.description}</p>

      {/* Assignment Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-sm font-medium text-gray-700">Location</div>
          <div className="text-sm text-gray-600">{assignment.location}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-700">Category</div>
          <div className="text-sm text-gray-600">{assignment.category}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-700">Duration</div>
          <div className="text-sm text-gray-600">{getEstimatedCompletion(assignment)}</div>
        </div>
      </div>

      {/* Progress Bar */}
      {assignment.status !== 'resolved' && assignment.status !== 'closed' && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-700 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Claimed on {new Date(assignment.createdAt).toLocaleDateString()}
        </div>
        <div className="flex space-x-2">
          {canStart && (
            <button
              onClick={() => onUpdateStatus(assignment.id, 'in_progress')}
              disabled={isUpdating}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Starting...</span>
                </>
              ) : (
                <span>Start Task</span>
              )}
            </button>
          )}
          {canComplete && (
            <button
              onClick={() => onUpdateStatus(assignment.id, 'resolved')}
              disabled={isUpdating}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Completing...</span>
                </>
              ) : (
                <span>Mark Complete</span>
              )}
            </button>
          )}
          <button
            onClick={() => onViewDetails(assignment.id)}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;