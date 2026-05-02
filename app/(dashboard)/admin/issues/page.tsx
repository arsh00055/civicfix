'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Loading from '@/app/loading';
import Error from '@/app/error';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { issuesAPI } from '@/lib/services/api/endpoints';
import apiClient from '@/lib/services/api/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon,
  UserIcon, MapPinIcon, CalendarIcon, ChatBubbleLeftIcon, FlagIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { FileTextIcon } from 'lucide-react';
import { ReviewModal } from './components/reviewModal';
import { EscalateModal } from './components/EscalateModal';
import { formatRelativeTime } from '@/lib/helpers/dashboardUtils';
import { Issue } from '@/types/issue.types';

const STATUS_BADGE: Record<string, { color: string; icon: any; label: string }> = Object.freeze({
  pending_review: { color: 'bg-purple-100 text-purple-800', icon: ClockIcon,       label: 'Pending Review' },
  resolved:       { color: 'bg-green-100 text-green-800',   icon: CheckCircleIcon, label: 'Resolved'       },
  in_progress:    { color: 'bg-blue-100 text-blue-800',     icon: ClockIcon,       label: 'In Progress'    },
  assigned:       { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon,       label: 'Assigned'       },
  in_review:      { color: 'bg-purple-100 text-purple-800', icon: ClockIcon,       label: 'In Review'      },
});
const DEFAULT_STATUS_BADGE = { color: 'bg-gray-100 text-gray-800', icon: ClockIcon, label: '' };

const PRIORITY_CLASSES: Record<string, string> = Object.freeze({
  critical: 'bg-red-100 text-red-800',
  high:     'bg-orange-100 text-orange-800',
  medium:   'bg-yellow-100 text-yellow-800',
  low:      'bg-green-100 text-green-800',
});

// Helper — how many days since a date string
function daysSince(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

// Is this issue overdue (claimed > 7 days ago, not resolved)?
function isOverdue(issue: any): boolean {
  if (!issue.assignedAt) return false;
  if (['resolved', 'closed'].includes(issue.status)) return false;
  return (daysSince(issue.assignedAt) ?? 0) > 7;
}

// Is this issue stale (reported > 21 days ago, not resolved)?
function isStale(issue: any): boolean {
  if (['resolved', 'closed'].includes(issue.status)) return false;
  return (daysSince(issue.createdAt) ?? 0) > 21;
}

const AdminIssuesPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [issues, setIssues]                   = useState<Issue[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue]     = useState<Issue | null>(null);
  const [showReviewModal, setShowReviewModal]  = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateIssue, setEscalateIssue]     = useState<Issue | null>(null);
  const [isSubmitting, setIsSubmitting]        = useState(false);
  const [activeTab, setActiveTab]             = useState<'pending' | 'overdue' | 'all'>('pending');

  useEffect(() => {
    if (user?.role === 'admin') fetchIssues();
  }, [user, activeTab]);

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'overdue') {
        // Fetch assigned, in_progress AND reported (stale unassigned) in parallel
        const [assignedRes, inProgressRes, reportedRes] = await Promise.all([
          issuesAPI.getIssues({ status: 'assigned',    limit: 100 }),
          issuesAPI.getIssues({ status: 'in_progress', limit: 100 }),
          issuesAPI.getIssues({ status: 'reported',    limit: 100 }),
        ]);

        const combined = [
          ...(assignedRes.data.issues   || []),
          ...(inProgressRes.data.issues || []),
          ...(reportedRes.data.issues   || []),
        ];

        // Deduplicate by id
        const seen = new Set<string>();
        const deduped = combined.filter(i => {
          if (seen.has(i.id)) return false;
          seen.add(i.id);
          return true;
        });

        // Keep only overdue or stale ones
        setIssues(deduped.filter(i => isOverdue(i) || isStale(i)));
        return;
      }

      // pending and all tabs — single fetch
      const params: any = { limit: 50 };
      if (activeTab === 'pending') params.status = 'pending_review';
      const response = await issuesAPI.getIssues(params);
      setIssues(response.data.issues || []);

    } catch (err: any) {
      console.error('Failed to fetch issues:', err);
      setError(err?.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const handleReview = useCallback(async (
    approved: boolean,
    reviewNotes: string,
    rejectionReason?: string
  ) => {
    if (!selectedIssue) return;
    try {
      setIsSubmitting(true);
      await apiClient.post(`/issues/${selectedIssue.id}/review`, {
        approved,
        reviewNotes,
        rejectionReason,
      });
      toast.success(
        approved
          ? 'Issue resolved successfully!'
          : 'Issue rejected and sent back for rework'
      );
      setShowReviewModal(false);
      setSelectedIssue(null);
      fetchIssues();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to review issue');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedIssue, fetchIssues]);

  const handleCloseReview = useCallback(() => {
    setShowReviewModal(false);
    setSelectedIssue(null);
  }, []);

  const handleOpenEscalate = useCallback((issue: Issue) => {
    setEscalateIssue(issue);
    setShowEscalateModal(true);
  }, []);

  const handleCloseEscalate = useCallback(() => {
    setShowEscalateModal(false);
    setEscalateIssue(null);
  }, []);

  const pendingCount = useMemo(
    () => issues.filter(i => i.status === 'in_review' ).length,
    [issues]
  );

  const overdueCount = useMemo(
    () => issues.filter(i => isOverdue(i) || isStale(i)).length,
    [issues]
  );

  if (!user || user.role !== 'admin') {
    return (
      <MainLayout role={user?.role ?? null}>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
            <p className="text-gray-600 mb-6">This page is only accessible to administrators.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FlagIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Manage Issues</h1>
                  <p className="text-gray-600 mt-1">Review and manage reported issues</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-2 cursor-pointer rounded-lg transition-colors ${
                    activeTab === 'pending'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending Review ({pendingCount})
                </button>

                {/* Overdue tab — shows red dot if there are overdue issues */}
                <button
                  onClick={() => setActiveTab('overdue')}
                  className={`relative px-4 py-2 cursor-pointer rounded-lg transition-colors ${
                    activeTab === 'overdue'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⚠️ Overdue / Stale
                  {overdueCount > 0 && activeTab !== 'overdue' && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {overdueCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 cursor-pointer rounded-lg transition-colors ${
                    activeTab === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Issues
                </button>

                <button
                  onClick={fetchIssues}
                  className="flex items-center cursor-pointer gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Overdue tab explanation banner */}
          {activeTab === 'overdue' && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">Overdue & Stale Issues</p>
                <p className="text-sm text-orange-700 mt-0.5">
                  <strong>Overdue:</strong> Claimed by a volunteer more than 7 days ago and not yet resolved. &nbsp;
                  <strong>Stale:</strong> Reported more than 21 days ago and still not resolved.
                  Use "Take Action" to warn the volunteer, reassign, or bump the priority.
                </p>
              </div>
            </div>
          )}

          {loading && issues.length === 0 && <Loading />}

          {error && !loading && (
            <Error
              error={error as unknown as Error & { digest?: string }}
              reset={fetchIssues}
            />
          )}

          {!loading && !error && issues.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FlagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'pending' ? 'No pending reviews' :
                 activeTab === 'overdue' ? 'No overdue or stale issues 🎉' :
                 'No issues found'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {activeTab === 'pending'
                  ? 'There are no issues waiting for review at the moment.'
                  : activeTab === 'overdue'
                  ? 'All tasks are being handled within the deadline. Great work!'
                  : 'No issues have been reported yet.'}
              </p>
            </div>
          )}

          {!loading && !error && issues.length > 0 && (
            <div className="space-y-4">
              {issues.map(issue => {
                const statusBadge = STATUS_BADGE[issue.status] ?? { ...DEFAULT_STATUS_BADGE, label: issue.status };
                const StatusIcon  = statusBadge.icon;
                const overdueFlag = isOverdue(issue);
                const staleFlag   = isStale(issue);
                const needsAction = overdueFlag || staleFlag;

                const daysAssigned = daysSince((issue as any).assignedAt);
                const daysReported = daysSince(issue.createdAt);

                return (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
                      needsAction ? 'border-orange-300' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">

                        {/* Title + status */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-bold text-gray-900">{issue.title}</h3>
                            {/* Overdue / Stale badges */}
                            {overdueFlag && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                🔴 {daysAssigned! - 7}d overdue
                              </span>
                            )}
                            {staleFlag && !overdueFlag && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                                ⏳ {daysReported}d old
                              </span>
                            )}
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusBadge.color} flex-shrink-0`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusBadge.label}
                          </span>
                        </div>

                        {/* Priority + category */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${PRIORITY_CLASSES[issue.priority] ?? 'bg-gray-100 text-gray-800'}`}>
                            {issue.priority.toUpperCase()}
                          </span>
                          <span className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium">
                            {issue.category}
                          </span>
                          {/* Admin warnings count */}
                          {(issue as any).adminWarnings > 0 && (
                            <span className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-medium">
                              ⚠️ {(issue as any).adminWarnings} warning{(issue as any).adminWarnings > 1 ? 's' : ''} sent
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{issue.description}</p>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{issue.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                            <span>Reported {formatRelativeTime(issue.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{issue.reporter?.name || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChatBubbleLeftIcon className="w-4 h-4 flex-shrink-0" />
                            <span>{issue.commentsCount} comments</span>
                          </div>
                        </div>

                        {issue.assignedTo && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                            <UserIcon className="w-4 h-4 flex-shrink-0" />
                            <span>Assigned to: <strong>{issue.assignedTo.name}</strong></span>
                            {daysAssigned !== null && (
                              <span className="text-gray-400">({daysAssigned} days ago)</span>
                            )}
                          </div>
                        )}

                        {issue.resolutionNotes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Resolution Notes:</p>
                            <p className="text-sm text-gray-700 line-clamp-2">{issue.resolutionNotes}</p>
                          </div>
                        )}

                        {/* Previous assignments log */}
                        {(issue as any).previousAssignments?.length > 0 && (
                          <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                            <p className="text-xs text-orange-700 font-medium mb-1">
                              Previously reassigned {(issue as any).previousAssignments.length} time(s)
                            </p>
                            <p className="text-xs text-orange-600">
                              Last: {(issue as any).previousAssignments.at(-1)?.volunteerName} — {(issue as any).previousAssignments.at(-1)?.reason}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 lg:grid-cols-1 flex-shrink-0">
                        {/* Review button — for pending_review / in_review */}
                        {issue.status === 'in_review' && (
                          <button
                            onClick={() => { setSelectedIssue(issue); setShowReviewModal(true); }}
                            className="px-5 py-2 cursor-pointer bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-all shadow-sm flex items-center gap-2"
                          >
                            <EyeIcon className="w-4 h-4" />
                            Review Resolution
                          </button>
                        )}

                        {/* Take Action — for overdue or stale issues */}
                        {needsAction && (
                          <button
                            onClick={() => handleOpenEscalate(issue)}
                            className="px-5 py-2 cursor-pointer bg-orange-600 text-white text-sm font-medium rounded-xl hover:bg-orange-700 transition-all shadow-sm flex items-center gap-2"
                          >
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            Take Action
                          </button>
                        )}

                        <button
                          onClick={() => router.push(`/issues/${issue.id}?role=admin`)}
                          className="px-5 py-2 cursor-pointer bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
                        >
                          <FileTextIcon className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ReviewModal
        isOpen={showReviewModal}
        onClose={handleCloseReview}
        onSubmit={handleReview}
        issue={selectedIssue}
        isSubmitting={isSubmitting}
      />

      <EscalateModal
        isOpen={showEscalateModal}
        onClose={handleCloseEscalate}
        onSuccess={fetchIssues}
        issue={escalateIssue}
      />
    </>
  );
};

export default AdminIssuesPage;