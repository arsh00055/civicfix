'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { useVolunteers } from '@/lib/hooks/api/useVolunteers';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IssueCardProps {
  issue: Issue;
  isVoted?: boolean;
  onVote?: () => Promise<void>;
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

// ---------------------------------------------------------------------------
// Lookup tables — defined once at module level
// ---------------------------------------------------------------------------

type PriorityConfig = {
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  dotColor: string;
};

const PRIORITY_CONFIG: Record<string, PriorityConfig> = Object.freeze({
  critical: { color: 'bg-red-50 text-red-700 border-red-200',         icon: FlagIcon,                label: 'Critical', dotColor: 'bg-red-500'    },
  high:     { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: ExclamationTriangleIcon, label: 'High',     dotColor: 'bg-orange-500' },
  medium:   { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: ClockIcon,               label: 'Medium',   dotColor: 'bg-yellow-500' },
  low:      { color: 'bg-green-50 text-green-700 border-green-200',    icon: CheckCircleIcon,         label: 'Low',      dotColor: 'bg-green-500'  },
});
const DEFAULT_PRIORITY: PriorityConfig = Object.freeze({
  color: 'bg-gray-50 text-gray-700 border-gray-200',
  icon: ExclamationTriangleIcon,
  label: 'Normal',
  dotColor: 'bg-gray-500',
});

type StatusConfig = {
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  dotColor: string;
};

const STATUS_CONFIG: Record<string, StatusConfig> = Object.freeze({
  resolved:       { color: 'bg-green-50 text-green-700 border-green-200',     icon: CheckCircleIcon,       label: 'Resolved',       dotColor: 'bg-green-500'  },
  in_progress:    { color: 'bg-blue-50 text-blue-700 border-blue-200',        icon: ArrowPathIcon,         label: 'In Progress',    dotColor: 'bg-blue-500'   },
  assigned:       { color: 'bg-purple-50 text-purple-700 border-purple-200',  icon: BriefcaseIcon,         label: 'Assigned',       dotColor: 'bg-purple-500' },
  pending_review: { color: 'bg-orange-50 text-orange-700 border-orange-200',  icon: ClockIcon,             label: 'Pending Review', dotColor: 'bg-orange-500' },
  pending:        { color: 'bg-yellow-50 text-yellow-700 border-yellow-200',  icon: ClockIcon,             label: 'Pending',        dotColor: 'bg-yellow-500' },
  reported:       { color: 'bg-yellow-50 text-yellow-700 border-yellow-200',  icon: ExclamationTriangleIcon, label: 'Reported',     dotColor: 'bg-yellow-500' },
});
const DEFAULT_STATUS: StatusConfig = Object.freeze({
  color: 'bg-gray-50 text-gray-700 border-gray-200',
  icon: ClockIcon,
  label: 'Unknown',
  dotColor: 'bg-gray-500',
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const diffMs    = Date.now() - new Date(dateString).getTime();
  const diffMins  = Math.floor(diffMs / 60_000);
  if (diffMins < 1)   return 'Just now';
  if (diffMins < 60)  return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays  = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)   return `${diffDays} days ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Is this task overdue? (claimed > 7 days ago, not resolved/closed)
function getOverdueInfo(issue: Issue & { assignedAt?: string; deadlineExtendedUntil?: string }): {
  isOverdue: boolean;
  daysOverdue: number;
} {
  if (!issue.assignedAt) return { isOverdue: false, daysOverdue: 0 };
  if (['resolved', 'closed', 'pending_review'].includes(issue.status)) {
    return { isOverdue: false, daysOverdue: 0 };
  }

  const deadlineDate = issue.deadlineExtendedUntil
    ? new Date(issue.deadlineExtendedUntil)
    : (() => {
        const d = new Date(issue.assignedAt!);
        d.setDate(d.getDate() + 7);
        return d;
      })();

  const daysOverdue = Math.floor((Date.now() - deadlineDate.getTime()) / 86_400_000);
  return { isOverdue: daysOverdue > 0, daysOverdue: Math.max(daysOverdue, 0) };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  isVoted: propIsVoted,
  onVote,
  showActions    = true,
  showVoting     = true,
  showClaimButton = false,
  showStatus     = true,
  onClaim,
  onStatusUpdate,
  onUpdate,
  onClick,
  className      = '',
  compact        = false,
  variant        = 'default',
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading]         = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Issue['status']>(issue.status);
  const [isVoted, setIsVoted]             = useState(propIsVoted || false);
  const [voteCount, setVoteCount]         = useState(issue.upvotes || 0);
  const { claimTask, updateTaskStatus }   = useVolunteers();

  useEffect(() => { setIsVoted(propIsVoted || false); }, [propIsVoted]);
  useEffect(() => { setVoteCount(issue.upvotes || 0); }, [issue.upvotes]);
  useEffect(() => { setCurrentStatus(issue.status); }, [issue.status]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleVote = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading || !onVote) return;

    const prevVoted = isVoted;
    const prevCount = voteCount;
    setIsVoted(!prevVoted);
    setVoteCount(n => prevVoted ? n - 1 : n + 1);

    try {
      setIsLoading(true);
      await onVote();
      toast.success(prevVoted ? 'Vote removed' : 'Vote added!');
      onUpdate?.();
    } catch {
      setIsVoted(prevVoted);
      setVoteCount(prevCount);
      toast.error('Failed to vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, onVote, isVoted, voteCount, onUpdate]);

  const handleViewDetails = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/issues/${issue.id}?role=${user?.role || ''}`);
  }, [router, issue.id, user?.role]);

  const handleClaim = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    try {
      setIsLoading(true);
      if (onClaim) {
        onClaim(issue.id);
      } else {
        await claimTask(issue.id);
        toast.success('Task claimed successfully!');
        onUpdate?.();
      }
    } catch {
      toast.error('Failed to claim task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, onClaim, issue.id, claimTask, onUpdate]);

  const handleStatusUpdate = useCallback(async (newStatus: Issue['status'], e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    try {
      setIsLoading(true);
      if (onStatusUpdate) {
        onStatusUpdate(issue.id, newStatus);
      } else {
        await updateTaskStatus(issue.id, newStatus);
        setCurrentStatus(newStatus);
        toast.success(`Status updated to ${newStatus.replaceAll('_', ' ')}`);
        onUpdate?.();
      }
    } catch {
      toast.error('Failed to update status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, onStatusUpdate, issue.id, updateTaskStatus, onUpdate]);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const priorityConfig = PRIORITY_CONFIG[issue.priority]  ?? DEFAULT_PRIORITY;
  const statusConfig   = STATUS_CONFIG[currentStatus]      ?? { ...DEFAULT_STATUS, label: currentStatus };
  const PriorityIcon   = priorityConfig.icon;

  const canClaimTask    = showClaimButton && !issue.assignedTo && currentStatus === 'reported';
  const isAssignedToMe  = issue.assignedTo?.id === user?.id;
  const canUpdateStatus = isAssignedToMe && ['assigned', 'in_progress'].includes(currentStatus);

  const isResolved     = currentStatus === 'resolved';
  const resolutionTime = isResolved && issue.resolvedAt && issue.createdAt
    ? (() => {
        const hours = Math.round(
          (new Date(issue.resolvedAt).getTime() - new Date(issue.createdAt).getTime()) / 3_600_000
        );
        return hours < 24 ? `${hours}h` : `${Math.round(hours / 24)}d`;
      })()
    : null;

  // ── Overdue detection ─────────────────────────────────────────────────────
  // Cast to any to read the extra fields stored by the claim/escalate routes
  const issueWithMeta = issue as any;
  const { isOverdue, daysOverdue } = getOverdueInfo(issueWithMeta);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`
        relative bg-white rounded-2xl border transition-all duration-200
        ${isOverdue
          ? 'border-red-300 shadow-sm shadow-red-50'
          : variant === 'featured'
          ? 'border-blue-200 shadow-lg shadow-blue-50'
          : 'border-gray-200 hover:shadow-md hover:border-gray-300'}
        ${compact ? 'p-4' : 'p-5'}
        ${isLoading ? 'opacity-60 pointer-events-none' : ''}
        ${className}
      `}
    >
      {/* Featured badge */}
      {variant === 'featured' && !isOverdue && (
        <div className="absolute -top-3 left-5">
          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
            Featured
          </span>
        </div>
      )}

      {/* Overdue badge — top-left, replaces featured */}
      {isOverdue && !compact && (
        <div className="absolute -top-3 left-5">
          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            🔴 {daysOverdue}d overdue
          </span>
        </div>
      )}

      {/* Pulsing dot for in_progress */}
      {currentStatus === 'in_progress' && (
        <div className="absolute top-4 right-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
          </span>
        </div>
      )}

      {/* Top row: title + vote button */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={`
            font-semibold line-clamp-2 leading-snug mb-2
            ${compact ? 'text-sm' : 'text-base'}
            ${isOverdue ? 'text-red-900' : variant === 'featured' ? 'text-blue-900' : 'text-gray-900'}
          `}>
            {issue.title}
          </h3>

          {/* Pills */}
          <div className="flex flex-wrap gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${priorityConfig.color}`}>
              <PriorityIcon className="w-3 h-3" />
              {priorityConfig.label}
            </span>

            {showStatus && (
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusConfig.dotColor}`} />
                {statusConfig.label}
              </span>
            )}

            <span className="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium">
              {issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}
            </span>

            {isResolved && resolutionTime && (
              <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
                ✓ {resolutionTime}
              </span>
            )}

            {/* Admin warning badge — visible on community issue list too */}
            {issueWithMeta.adminWarnings > 0 && !compact && (
              <span className="inline-flex items-center px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-medium">
                ⚠️ {issueWithMeta.adminWarnings} warning{issueWithMeta.adminWarnings > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Vote button */}
        {showVoting && !compact && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVote}
            disabled={isLoading || !onVote}
            aria-label={isVoted ? 'Remove vote' : 'Add vote'}
            className={`
              flex flex-col items-center justify-center min-w-[52px] px-2.5 py-2 rounded-xl border transition-all
              ${isVoted ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'}
              disabled:cursor-not-allowed
            `}
          >
            {isVoted
              ? <HandThumbUpSolid className="w-5 h-5 text-blue-600 mb-0.5" />
              : <HandThumbUpIcon  className="w-5 h-5 text-gray-400 mb-0.5" />
            }
            <span className={`text-xs font-bold ${isVoted ? 'text-blue-600' : 'text-gray-600'}`}>
              {voteCount}
            </span>
          </motion.button>
        )}
      </div>

      {/* Description */}
      {!compact && issue.description && (
        <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">
          {issue.description}
        </p>
      )}

      {/* Metadata row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 pt-3 border-t border-gray-100">
        {issue.location && (
          <span className="flex items-center gap-1">
            <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate max-w-[140px]">{issue.location}</span>
          </span>
        )}
        <span className="flex items-center gap-1">
          <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
          {formatDate(issue.createdAt)}
        </span>
        {!compact && issue.reporter?.name && (
          <span className="flex items-center gap-1">
            <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate max-w-[100px]">{issue.reporter.name}</span>
          </span>
        )}
        {!compact && issue.commentsCount !== undefined && (
          <span className="flex items-center gap-1">
            <ChatBubbleLeftIcon className="w-3.5 h-3.5 flex-shrink-0" />
            {issue.commentsCount}
          </span>
        )}
      </div>

      {/* Assigned volunteer banner */}
      {!compact && issue.assignedTo && (
        <div className="mt-3 flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-blue-500 font-medium leading-none mb-0.5">Assigned volunteer</p>
            <p className="text-sm font-semibold text-blue-900 truncate">{issue.assignedTo.name}</p>
          </div>
          {isAssignedToMe && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">
              You
            </span>
          )}
        </div>
      )}

      {/* Previous reassignments note */}
      {!compact && issueWithMeta.previousAssignments?.length > 0 && (
        <div className="mt-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-xl">
          <p className="text-xs text-orange-600">
            🔄 Reassigned {issueWithMeta.previousAssignments.length} time{issueWithMeta.previousAssignments.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Action bar */}
      {showActions && !compact && (
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 gap-2">
          <div className="flex gap-2">
            {canUpdateStatus && (
              <>
                {currentStatus !== 'in_progress' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={e => handleStatusUpdate('in_progress', e)}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Start work
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={e => handleStatusUpdate('resolved', e)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Mark resolved
                </motion.button>
              </>
            )}
          </div>

          <div className="flex gap-2 ml-auto">
            {canClaimTask && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleClaim}
                disabled={isLoading}
                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <BriefcaseIcon className="w-3.5 h-3.5" />
                Claim task
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleViewDetails}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            >
              View details
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Compact claim button */}
      {compact && canClaimTask && (
        <div className="flex justify-end mt-2.5">
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={handleClaim}
            disabled={isLoading}
            className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Claim
          </motion.button>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 rounded-2xl flex items-center justify-center">
          <div className="w-7 h-7 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );

  if (onClick) return cardContent;

  return (
    <Link href={`/issues/${issue.id}`} className="block">
      {cardContent}
    </Link>
  );
};

export default IssueCard;