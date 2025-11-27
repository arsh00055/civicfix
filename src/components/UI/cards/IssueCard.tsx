import React, { useState } from 'react';
import type { Issue } from '../../../types';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
} from '../../../components/UI/icons';
import { issuesAPI, volunteersAPI } from '../../../services/api/endpoints';
import { useNavigate } from 'react-router-dom';

interface IssueCardProps {
  issue: Issue;
  showActions?: boolean;
  showVoting?: boolean;
  showClaimButton?: boolean;
  showStatus?: boolean;
  onClaim?: (taskId: string) => void;
  onStatusUpdate?: (taskId: string, status: string) => void;
  onUpdate?: () => void;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}

const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  showActions = true,
  showVoting = true,
  showClaimButton = false,
  showStatus = true,
  onClaim,
  onStatusUpdate,
  onUpdate,
  onClick,
  className = "",
  compact = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<"assigned" | "in_progress" | "reported" | "in_review" | "resolved" | "closed">(issue.status);
  const navigate = useNavigate();
  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    try {
      setIsLoading(true);
      await issuesAPI.voteIssue(issue.id);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/issues/${issue.id}`);
  }

  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    try {
      setIsLoading(true);
      if (onClaim) {
        onClaim(issue.id);
      } else {
        await volunteersAPI.claimTask(issue.id);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Failed to claim task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: "assigned" | "in_progress" | "reported" | "in_review" | "resolved" | "closed", e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    try {
      setIsLoading(true);
      if (onStatusUpdate) {
        onStatusUpdate(issue.id, newStatus);
      } else {
        await volunteersAPI.updateTaskStatus(issue.id, newStatus);
        setCurrentStatus(newStatus);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'reported':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_review':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return CheckCircleIcon;
      case 'in_progress':
        return ClockIcon;
      case 'assigned':
      case 'reported':
      case 'in_review':
      default:
        return ExclamationTriangleIcon;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const canClaimTask = showClaimButton && !issue.volunteerId && currentStatus === 'reported';
  const isAssignedToMe = issue.volunteerId === 'current-user-id'; // You'd get this from auth context
  const canUpdateStatus = isAssignedToMe && ['assigned', 'in_progress'].includes(currentStatus);

  if (compact) {
    return (
      <div 
        className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer ${className} ${
          isLoading ? 'opacity-50' : ''
        }`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
              {issue.title}
            </h3>
            <p className="text-xs text-gray-500 truncate mb-2">
              {issue.location}
            </p>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getPriorityStyles(issue.priority)}`}>
                {issue.priority}
              </span>
              {showStatus && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getStatusStyles(currentStatus)}`}>
                  {React.createElement(getStatusIcon(currentStatus), { className: "w-3 h-3 mr-1" })}
                  {currentStatus}
                </span>
              )}
            </div>
          </div>
          {canClaimTask && (
            <button
              onClick={handleClaim}
              disabled={isLoading}
              className="ml-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Claim
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer ${className} ${
        isLoading ? 'opacity-50' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {issue.title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityStyles(issue.priority)}`}>
              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
              {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
            </span>
            {showStatus && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyles(currentStatus)}`}>
                {React.createElement(getStatusIcon(currentStatus), { className: "w-4 h-4 mr-1" })}
                {currentStatus.replace('_', ' ').charAt(0).toUpperCase() + currentStatus.replace('_', ' ').slice(1)}
              </span>
            )}
          </div>
        </div>
        
        {showVoting && (
          <button
            onClick={handleVote}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 ml-4 flex-shrink-0"
          >
            <span className="text-lg">▲</span>
            <span className="font-semibold text-gray-700">{issue.votes || 0}</span>
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-3">
        {issue.description}
      </p>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <MapPinIcon className="w-4 h-4 text-gray-400" />
          <span className="truncate">{issue.location}</span>
        </div>
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <span>Reported {formatDate(issue.createdAt)}</span>
        </div>
        {issue.reporter && (
          <div className="flex items-center space-x-2">
            <UserIcon className="w-4 h-4 text-gray-400" />
            <span>By {issue.reporter.name}</span>
          </div>
        )}
        {issue.comments && issue.comments.length > 0 && (
          <div className="flex items-center space-x-2">
            <ChatBubbleLeftIcon className="w-4 h-4 text-gray-400" />
            <span>{issue.comments.length} comments</span>
          </div>
        )}
      </div>

      {/* Volunteer Assignment */}
      {issue.volunteer && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <UserIcon className="w-4 h-4" />
            <span>Assigned to <strong>{issue.volunteer.name}</strong></span>
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            {canUpdateStatus && (
              <>
                <button
                  onClick={(e) => handleStatusUpdate('in_progress', e)}
                  disabled={isLoading || currentStatus === 'in_progress'}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Work
                </button>
                <button
                  onClick={(e) => handleStatusUpdate('resolved', e)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Mark Resolved
                </button>
              </>
            )}
          </div>

          <div className="flex space-x-2">
            {canClaimTask && (
              <button
                onClick={handleClaim}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Claim Task
              </button>
            )}
            <button 
              onClick={handleViewDetails}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueCard;