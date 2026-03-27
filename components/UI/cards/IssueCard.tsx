'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Issue } from '@/types/issue.types';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon,
  HandThumbUpIcon,
  FlagIcon,
  ArrowTopRightOnSquareIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid } from '@heroicons/react/24/solid';
import { useVolunteers } from '@/hooks/api/useVolunteers';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

interface IssueCardProps {
  issue: Issue;
  isVoted?: boolean; // Vote status from parent
  onVote?: () => Promise<void>; // Vote handler from parent
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
  variant?: 'default' | 'featured' | 'minimal';
}

const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  isVoted: propIsVoted,
  onVote,
  showActions = true,
  showVoting = true,
  showClaimButton = false,
  showStatus = true,
  onClaim,
  onStatusUpdate,
  onUpdate,
  onClick,
  className = "",
  compact = false,
  variant = 'default'
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Issue['status']>(issue.status);
  const [isVoted, setIsVoted] = useState(propIsVoted || false);
  const [voteCount, setVoteCount] = useState(issue.upvotes || 0);
  const [isHovered, setIsHovered] = useState(false);
  const { claimTask, updateTaskStatus } = useVolunteers();

  // Update local state when props change
  useEffect(() => {
    setIsVoted(propIsVoted || false);
  }, [propIsVoted]);

  useEffect(() => {
    setVoteCount(issue.upvotes || 0);
  }, [issue.upvotes]);

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading || !onVote) return;

    // Optimistic update
    const previousVoted = isVoted;
    const previousVoteCount = voteCount;
    
    setIsVoted(!previousVoted);
    setVoteCount(prev => previousVoted ? prev - 1 : prev + 1);
    
    try {
      setIsLoading(true);
      await onVote();
      
      toast.success(previousVoted ? 'Vote removed' : 'Vote added!');
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to vote:', error);
      // Rollback optimistic update
      setIsVoted(previousVoted);
      setVoteCount(previousVoteCount);
      toast.error('Failed to vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/issues/${issue.id}?role=${user?.role || ''}`);
  };

  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    try {
      setIsLoading(true);
      if (onClaim) {
        onClaim(issue.id);
      } else {
        await claimTask(issue.id);
        toast.success('Task claimed successfully!');
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Failed to claim task:', error);
      toast.error('Failed to claim task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Issue['status'], e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    try {
      setIsLoading(true);
      if (onStatusUpdate) {
        onStatusUpdate(issue.id, newStatus);
      } else {
        await updateTaskStatus(issue.id, newStatus);
        setCurrentStatus(newStatus);
        toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      critical: { 
        color: 'bg-red-50 text-red-700 border-red-200', 
        icon: FlagIcon,
        label: 'Critical',
        dotColor: 'bg-red-500'
      },
      high: { 
        color: 'bg-orange-50 text-orange-700 border-orange-200', 
        icon: ExclamationTriangleIcon,
        label: 'High',
        dotColor: 'bg-orange-500'
      },
      medium: { 
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
        icon: ClockIcon,
        label: 'Medium',
        dotColor: 'bg-yellow-500'
      },
      low: { 
        color: 'bg-green-50 text-green-700 border-green-200', 
        icon: CheckCircleIcon,
        label: 'Low',
        dotColor: 'bg-green-500'
      },
      default: { 
        color: 'bg-gray-50 text-gray-700 border-gray-200', 
        icon: ExclamationTriangleIcon,
        label: 'Normal',
        dotColor: 'bg-gray-500'
      }
    };
    return configs[priority as keyof typeof configs] || configs.default;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      resolved: { 
        color: 'bg-green-50 text-green-700 border-green-200', 
        icon: CheckCircleIcon,
        label: 'Resolved',
        dotColor: 'bg-green-500'
      },
      in_progress: { 
        color: 'bg-blue-50 text-blue-700 border-blue-200', 
        icon: ArrowPathIcon,
        label: 'In Progress',
        dotColor: 'bg-blue-500'
      },
      assigned: { 
        color: 'bg-purple-50 text-purple-700 border-purple-200', 
        icon: BriefcaseIcon,
        label: 'Assigned',
        dotColor: 'bg-purple-500'
      },
      pending: { 
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
        icon: ClockIcon,
        label: 'Pending',
        dotColor: 'bg-yellow-500'
      },
      reported: { 
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
        icon: ExclamationTriangleIcon,
        label: 'Reported',
        dotColor: 'bg-yellow-500'
      },
      default: { 
        color: 'bg-gray-50 text-gray-700 border-gray-200', 
        icon: ClockIcon,
        label: status,
        dotColor: 'bg-gray-500'
      }
    };
    return configs[status as keyof typeof configs] || configs.default;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const priorityConfig = getPriorityConfig(issue.priority);
  const statusConfig = getStatusConfig(currentStatus);
  const PriorityIcon = priorityConfig.icon;
  const StatusIcon = statusConfig.icon;
  
  const canClaimTask = showClaimButton && !issue.assignedTo && currentStatus === 'reported';
  const isAssignedToMe = issue.assignedTo?.id === user?.id;
  const canUpdateStatus = isAssignedToMe && ['assigned', 'in_progress'].includes(currentStatus);

  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { 
      y: -4,
      transition: { duration: 0.2 }
    }
  };

  const cardContent = (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      className={`
        relative bg-white rounded-2xl border transition-all duration-300
        ${variant === 'featured' ? 'border-blue-200 shadow-lg shadow-blue-100' : 'border-gray-200 hover:shadow-lg'}
        ${compact ? 'p-4' : 'p-6'}
        ${isLoading ? 'opacity-60 pointer-events-none' : ''}
        ${className}
      `}
    >
      {/* Featured Badge */}
      {variant === 'featured' && (
        <div className="absolute -top-3 left-6">
          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md">
            Featured
          </span>
        </div>
      )}

      {/* Status Dot Animation */}
      {currentStatus === 'in_progress' && (
        <div className="absolute top-4 right-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left content */}
        <div className="flex-1">
          {/* Title */}
          <h3 className={`
            font-bold text-gray-900 mb-3 line-clamp-2
            ${compact ? 'text-base' : 'text-xl'}
            ${variant === 'featured' ? 'text-blue-900' : ''}
          `}>
            {issue.title}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border
              ${priorityConfig.color}
            `}>
              <PriorityIcon className="w-3.5 h-3.5" />
              {priorityConfig.label}
            </span>
            
            {showStatus && (
              <span className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border
                ${statusConfig.color}
              `}>
                <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                {statusConfig.label}
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium">
              {issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}
            </span>
          </div>

          {/* Description - Not shown in compact mode */}
          {!compact && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {issue.description}
            </p>
          )}
        </div>

        {/* Voting Section */}
        {showVoting && !compact && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVote}
            disabled={isLoading || !onVote}
            className={`
              flex flex-col cursor-pointer items-center justify-center min-w-[60px] p-3 rounded-xl transition-all
              ${isVoted 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } border
            `}
          >
            {isVoted ? (
              <HandThumbUpSolid className="w-6 h-6 text-blue-600" />
            ) : (
              <HandThumbUpIcon className="w-6 h-6 text-gray-500" />
            )}
            <span className={`
              text-sm font-bold mt-1
              ${isVoted ? 'text-blue-600' : 'text-gray-700'}
            `}>
              {voteCount}
            </span>
            <span className="text-xs text-gray-500">votes</span>
          </motion.button>
        )}
      </div>

      {/* Metadata Grid */}
      <div className={`
        grid gap-3 text-sm text-gray-500 border-t pt-4 mt-4
        ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}
      `}>
        <div className="flex items-center gap-2 group">
          <MapPinIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span className="truncate text-xs">{issue.location || 'Location not specified'}</span>
        </div>
        
        <div className="flex items-center gap-2 group">
          <CalendarIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span className="text-xs">{formatDate(issue.createdAt)}</span>
        </div>
        
        {!compact && issue.reporter && (
          <div className="flex items-center gap-2 group">
            <UserIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span className="text-xs truncate">By {issue.reporter.name}</span>
          </div>
        )}
        
        {!compact && issue.commentsCount !== undefined && (
          <div className="flex items-center gap-2 group">
            <ChatBubbleLeftIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span className="text-xs">{issue.commentsCount} comments</span>
          </div>
        )}
      </div>

      {/* Volunteer Assignment Badge */}
      {!compact && issue.assignedTo && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-blue-600 font-medium">Assigned Volunteer</p>
              <p className="text-sm font-semibold text-blue-900">{issue.assignedTo.name}</p>
            </div>
            {isAssignedToMe && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Assigned to you
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      {showActions && !compact && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
          <div className="flex gap-2">
            {canUpdateStatus && (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => handleStatusUpdate('in_progress', e)}
                  disabled={isLoading || currentStatus === 'in_progress'}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Start Work
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => handleStatusUpdate('resolved', e)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 shadow-sm"
                >
                  Mark Resolved
                </motion.button>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {canClaimTask && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClaim}
                disabled={isLoading}
                className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-sm flex items-center gap-2"
              >
                <BriefcaseIcon className="w-4 h-4" />
                Claim Task
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewDetails}
              className="px-5 py-2 cursor-pointer bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              View Details
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Compact mode actions */}
      {compact && canClaimTask && (
        <div className="flex justify-end mt-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClaim}
            disabled={isLoading}
            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
          >
            Claim
          </motion.button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 rounded-2xl flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );

  // Wrap with Link if no onClick
  if (onClick) {
    return cardContent;
  }

  return (
    <Link href={`/issues/${issue.id}`} className="block">
      {cardContent}
    </Link>
  );
};

export default IssueCard;