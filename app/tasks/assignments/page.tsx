'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Loading from '@/app/loading';
import Error from '@/app/error';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { volunteersAPI } from '@/lib/services/api/endpoints';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Assignment {
  id: string;
  taskId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: 'assigned' | 'in_progress' | 'resolved' | 'closed';
  location: string;
  latitude: number;
  longitude: number;
  images: string[];
  reportedBy: string;
  reportedAt: string;
  claimedAt: string;
  updatedAt: string;
  progress: number;
  commentsCount: number;
  upvotes: number;
  tags: string[];
  estimatedResolutionTime?: string;
  resolutionNotes?: string;
}

const AssignmentsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || (user.role !== 'volunteer' && user.role !== 'admin')) {
        setError('Only volunteers can view assignments');
        return;
      }

      const response = await volunteersAPI.getMyAssignments();
      const data = response.data;
      setAssignments(data.assignments || []);
      
    } catch (err: any) {
      console.error('Failed to fetch assignments:', err);
      setError(err?.message || 'Failed to load your assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (assignmentId: string, taskId: string, newStatus: string) => {
    try {
      setUpdatingStatus(assignmentId);
      
      await volunteersAPI.updateTaskStatus(taskId, newStatus);
      
      // Update local state
      setAssignments(prev => prev.map(assignment => 
        assignment.id === assignmentId 
          ? { 
              ...assignment, 
              status: newStatus as Assignment['status'],
              progress: newStatus === 'in_progress' ? 50 : newStatus === 'resolved' ? 100 : 25,
              updatedAt: new Date().toISOString()
            }
          : assignment
      ));
      
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      
      if (newStatus === 'resolved') {
        toast.success('Assignment completed! Great work! 🎉');
      }
      
    } catch (err: any) {
      console.error('Failed to update status:', err);
      toast.error(err?.message || 'Failed to update task status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleRetry = () => {
    fetchAssignments();
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      assigned: {
        color: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        icon: '⏳',
        label: 'Assigned',
        bgColor: 'bg-yellow-100',
        dotColor: 'bg-yellow-500'
      },
      in_progress: {
        color: 'bg-blue-50 text-blue-800 border-blue-200',
        icon: '🔄',
        label: 'In Progress',
        bgColor: 'bg-blue-100',
        dotColor: 'bg-blue-500'
      },
      resolved: {
        color: 'bg-green-50 text-green-800 border-green-200',
        icon: '✅',
        label: 'Resolved',
        bgColor: 'bg-green-100',
        dotColor: 'bg-green-500'
      },
      closed: {
        color: 'bg-gray-50 text-gray-800 border-gray-200',
        icon: '🔒',
        label: 'Closed',
        bgColor: 'bg-gray-100',
        dotColor: 'bg-gray-500'
      },
      default: {
        color: 'bg-gray-50 text-gray-800 border-gray-200',
        icon: '📋',
        label: status,
        bgColor: 'bg-gray-100',
        dotColor: 'bg-gray-500'
      }
    };
    return configs[status as keyof typeof configs] || configs.default;
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      critical: { color: 'bg-red-100 text-red-800', label: 'Critical', icon: '🔴' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'High', icon: '🟠' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium', icon: '🟡' },
      low: { color: 'bg-green-100 text-green-800', label: 'Low', icon: '🟢' },
      default: { color: 'bg-gray-100 text-gray-800', label: 'Normal', icon: '⚪' }
    };
    return configs[priority as keyof typeof configs] || configs.default;
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

  // Filter assignments based on showResolved toggle
  const filteredAssignments = assignments.filter(assignment => 
    showResolved ? true : assignment.status !== 'resolved'
  );

  const activeCount = assignments.filter(a => a.status !== 'resolved').length;
  const resolvedCount = assignments.filter(a => a.status === 'resolved').length;

  if (!user || (user.role !== 'volunteer' && user.role !== 'admin')) {
    return (
      <MainLayout role={user?.role ?? null}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Volunteer Access Required</h2>
              <p className="text-gray-600 mb-6">
                This page is only accessible to volunteers. If you're a volunteer, please log in with your volunteer account.
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

  return (
    <MainLayout role={user?.role}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
                  <p className="text-gray-600 mt-1">
                    {activeCount} active · {resolvedCount} resolved
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResolved(false)}
                  className={`px-4 py-2 cursor-pointer rounded-lg transition-colors ${
                    !showResolved 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => setShowResolved(true)}
                  className={`px-4 py-2 cursor-pointer rounded-lg transition-colors ${
                    showResolved 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({assignments.length})
                </button>
                <button
                  onClick={handleRetry}
                  className="flex items-center cursor-pointer justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
          {loading && assignments.length === 0 && (<Loading />)}

          {/* Error State */}
          {error && !loading && (
            <Error error={error as unknown as Error & { digest?: string }} reset={handleRetry} />
          )}

          {/* Empty State */}
          {!loading && !error && filteredAssignments.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {showResolved ? 'No assignments found' : 'No active assignments'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {showResolved 
                  ? "You haven't completed any assignments yet."
                  : "You don't have any active assignments. Browse available tasks to find work that needs to be done."
                }
              </p>
              {!showResolved && (
                <button
                  onClick={() => router.push('/tasks/available')}
                  className="bg-green-600 cursor-pointer text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Browse Available Tasks
                </button>
              )}
            </div>
          )}

          {/* Assignments List */}
          {!loading && !error && filteredAssignments.length > 0 && (
            <div className="space-y-4">
              {filteredAssignments.map(assignment => {
                const statusConfig = getStatusConfig(assignment.status);
                const priorityConfig = getPriorityConfig(assignment.priority);
                const isUpdating = updatingStatus === assignment.id;
                const isResolved = assignment.status === 'resolved';
                
                return (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
                      isResolved ? 'border-gray-200 opacity-75' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left Content */}
                      <div className="flex-1">
                        {/* Title and Status Badge */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className={`text-xl font-bold ${isResolved ? 'text-gray-600' : 'text-gray-900'}`}>
                            {assignment.title}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                            {statusConfig.label}
                          </span>
                        </div>
                        
                        {/* Priority and Category Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                            {priorityConfig.icon} {priorityConfig.label}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium">
                            {assignment.category?.toUpperCase()}
                          </span>
                        </div>
                        
                        {/* Description */}
                        <p className={`text-sm mb-4 line-clamp-2 ${isResolved ? 'text-gray-500' : 'text-gray-600'}`}>
                          {assignment.description}
                        </p>
                        
                        {/* Progress Bar - Only show for active assignments */}
                        {!isResolved && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{assignment.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 rounded-full h-2 transition-all duration-300"
                                style={{ width: `${assignment.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Completion Badge for Resolved */}
                        {isResolved && (
                          <div className="mb-4 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              ✅ Completed on {formatDate(assignment.updatedAt)}
                            </span>
                          </div>
                        )}
                        
                        {/* Metadata */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{assignment.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Claimed {formatDate(assignment.claimedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>By {assignment.reportedBy}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{assignment.commentsCount} comments</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 lg:flex-col xl:flex-row">
                        {assignment.status === 'assigned' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleUpdateStatus(assignment.id, assignment.taskId, 'in_progress')}
                            disabled={isUpdating}
                            className="px-5 py-2 cursor-pointer bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {isUpdating ? 'Updating...' : 'Start Work'}
                          </motion.button>
                        )}
                        
                        {assignment.status === 'in_progress' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleUpdateStatus(assignment.id, assignment.taskId, 'resolved')}
                            disabled={isUpdating}
                            className="px-5 py-2 cursor-pointer bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {isUpdating ? 'Updating...' : 'Mark Resolved'}
                          </motion.button>
                        )}
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => router.push(`/issues/${assignment.taskId}?role=${user?.role || ''}`)}
                          className="px-5 py-2 cursor-pointer bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AssignmentsPage;