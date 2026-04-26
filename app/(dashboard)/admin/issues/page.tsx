'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Loading from '@/app/loading';
import Error from '@/app/error';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { issuesAPI } from '@/lib/services/api/endpoints';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { FileTextIcon } from 'lucide-react';
import { ReviewModal } from './components/reviewModal';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  reporter?: { name: string; avatar?: string };
  assignedTo?: { name: string };
  resolutionNotes?: string;
  resolutionProof?: string[];
  submittedForReviewAt?: string;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  commentsCount: number;
}


const AdminIssuesPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchIssues();
    }
  }, [user, activeTab]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { limit: 50 };
      if (activeTab === 'pending') {
        params.status = 'pending_review';
      }
      
      const response = await issuesAPI.getIssues(params);
      const data = response.data;
      setIssues(data.issues || []);
      
    } catch (err: any) {
      console.error('Failed to fetch issues:', err);
      setError(err?.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (approved: boolean, reviewNotes: string, rejectionReason?: string) => {
    if (!selectedIssue) return;

    try {
      setIsSubmitting(true);
      
      const endpoint = `/api/issues/${selectedIssue.id}/review`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          approved,
          reviewNotes,
          rejectionReason,
        }),
      });

      if (!response.ok) toast.error('Failed to review');

      toast.success(approved ? 'Issue resolved successfully!' : 'Issue rejected and sent back for rework');
      
      setShowReviewModal(false);
      fetchIssues();
      
    } catch (err: any) {
      console.error('Failed to review:', err);
      toast.error(err?.message || 'Failed to review issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return { color: 'bg-purple-100 text-purple-800', icon: ClockIcon, label: 'Pending Review' };
      case 'resolved':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Resolved' };
      case 'in_progress':
        return { color: 'bg-blue-100 text-blue-800', icon: ClockIcon, label: 'In Progress' };
      case 'assigned':
        return { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Assigned' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: ClockIcon, label: status };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  if (!user || user.role !== 'admin') {
    return (
      <MainLayout role={user?.role ?? null}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
              <p className="text-gray-600 mb-6">
                This page is only accessible to administrators.
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const pendingCount = issues.filter(i => i.status === 'pending_review').length;

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
                  <p className="text-gray-600 mt-1">
                    Review and manage reported issues
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
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
                  className="flex items-center cursor-pointer justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && issues.length === 0 && <Loading />}

          {/* Error State */}
          {error && !loading && (
            <Error error={error as unknown as Error & { digest?: string }} reset={fetchIssues} />
          )}

          {/* Empty State */}
          {!loading && !error && issues.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FlagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'pending' ? 'No pending reviews' : 'No issues found'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {activeTab === 'pending' 
                  ? "There are no issues waiting for review at the moment."
                  : "No issues have been reported yet."}
              </p>
            </div>
          )}

          {/* Issues List */}
          {!loading && !error && issues.length > 0 && (
            <div className="space-y-4">
              {issues.map(issue => {
                const statusBadge = getStatusBadge(issue.status);
                const StatusIcon = statusBadge.icon;
                
                return (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left Content */}
                      <div className="flex-1">
                        {/* Title and Status */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            {issue.title}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusBadge.label}
                          </span>
                        </div>
                        
                        {/* Priority and Category */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getPriorityBadge(issue.priority)}`}>
                            {issue.priority.toUpperCase()}
                          </span>
                          <span className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium">
                            {issue.category}
                          </span>
                        </div>
                        
                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {issue.description}
                        </p>
                        
                        {/* Metadata */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4" />
                            <span className="truncate">{issue.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>Reported {formatDate(issue.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            <span>{issue.reporter?.name || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChatBubbleLeftIcon className="w-4 h-4" />
                            <span>{issue.commentsCount} comments</span>
                          </div>
                        </div>

                        {/* Volunteer Info */}
                        {issue.assignedTo && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                            <UserIcon className="w-4 h-4" />
                            <span>Assigned to: {issue.assignedTo.name}</span>
                          </div>
                        )}

                        {/* Resolution Notes Preview */}
                        {issue.resolutionNotes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Resolution Notes:</p>
                            <p className="text-sm text-gray-700 line-clamp-2">{issue.resolutionNotes}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        {issue.status === 'pending_review' && (
                          <button
                            onClick={() => {
                              setSelectedIssue(issue);
                              setShowReviewModal(true);
                            }}
                            className="px-5 py-2 cursor-pointer bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-all shadow-sm flex items-center gap-2"
                          >
                            <EyeIcon className="w-4 h-4" />
                            Review Resolution
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

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedIssue(null);
        }}
        onSubmit={handleReview}
        issue={selectedIssue}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default AdminIssuesPage;