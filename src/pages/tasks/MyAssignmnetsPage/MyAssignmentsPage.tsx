import React, { useState, useEffect, Suspense } from 'react';
import { volunteersAPI } from '../../../services/api/endpoints';
import Sidebar from '../../../components/layout/sidebar/Sidebar';
import Header from '../../../components/layout/Header/Header';
import { useAppSelector } from '../../../app/store/hooks';
import type { Issue } from '../../../types';

// Lazy-loaded components
import {
  MyAssignmentsHeader,
  ErrorBanner,
  AssignmentsStats,
  AssignmentsFilters,
  AssignmentsList,
  LoadingState,
  ErrorState
} from './components/lazy';

interface MyAssignmentsProps {
  role: string | null;
}

type AssignmentStatus = 'reported' | 'in_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

const MyAssignmentsPage: React.FC<MyAssignmentsProps> = ({ role }) => {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const [assignments, setAssignments] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingAssignment, setUpdatingAssignment] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | ''>('');

  useEffect(() => {
    fetchAssignments();
  }, [statusFilter]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await volunteersAPI.getMyAssignments();
      setAssignments(response.data.assignments);
      
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      setError('Failed to load your assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, newStatus: AssignmentStatus) => {
    try {
      setUpdatingAssignment(assignmentId);
      
      await volunteersAPI.updateTaskStatus(assignmentId, newStatus);
      
      // Update local state optimistically
      setAssignments(prev => prev.map(assignment => 
        assignment.id === assignmentId 
          ? { 
              ...assignment, 
              status: newStatus,
              updatedAt: new Date().toISOString(),
              ...(newStatus === 'resolved' ? { resolvedAt: new Date().toISOString() } : {})
            }
          : assignment
      ));
      
    } catch (err) {
      console.error('Failed to update assignment status:', err);
      setError('Failed to update assignment status. Please try again.');
    } finally {
      setUpdatingAssignment(null);
    }
  };

  const handleViewDetails = (assignmentId: string) => {
    window.location.href = `/issues/${assignmentId}`;
  };

  const handleBrowseTasks = () => {
    window.location.href = '/available-tasks';
  };

  const handleRetry = () => {
    fetchAssignments();
  };

  const filteredAssignments = assignments.filter(assignment => 
    !statusFilter || assignment.status === statusFilter
  );

  // Loading state
  if (loading && !assignments.length) {
    return (
      <div className="flex h-screen bg-gray-50">
        {sidebarOpen && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole={role} />
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div>Loading...</div>}>
              <LoadingState />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  // Error state (when no data exists)
  if (error && !assignments.length) {
    return (
      <div className="flex h-screen bg-gray-50">
        {sidebarOpen && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole={role} />
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div>Loading...</div>}>
              <ErrorState error={error} onRetry={handleRetry} />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole={role} />
        <main className="flex-1 overflow-auto p-6">
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <Suspense fallback={<div>Loading header...</div>}>
                <MyAssignmentsHeader onRefresh={handleRetry} />
              </Suspense>

              {/* Error Banner */}
              <Suspense fallback={<div>Loading error banner...</div>}>
                <ErrorBanner error={error} onRetry={handleRetry} />
              </Suspense>

              {/* Stats */}
              <Suspense fallback={<div>Loading stats...</div>}>
                <AssignmentsStats assignments={assignments} />
              </Suspense>

              {/* Filters */}
              <Suspense fallback={<div>Loading filters...</div>}>
                <AssignmentsFilters
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                />
              </Suspense>

              {/* Assignments List */}
              <Suspense fallback={<div>Loading assignments...</div>}>
                <AssignmentsList
                  assignments={assignments}
                  filteredAssignments={filteredAssignments}
                  updatingAssignment={updatingAssignment}
                  statusFilter={statusFilter}
                  onUpdateStatus={updateAssignmentStatus}
                  onViewDetails={handleViewDetails}
                  onClearFilter={() => setStatusFilter('')}
                  onBrowseTasks={handleBrowseTasks}
                />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyAssignmentsPage;