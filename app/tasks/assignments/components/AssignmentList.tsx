'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon } from '@/components/UI/icons';
import type { Issue } from '@/types';
import AssignmentCard from './AssignmentCard';

type AssignmentStatus = 'reported' | 'in_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

interface AssignmentsListProps {
  assignments: Issue[];
  filteredAssignments: Issue[];
  updatingAssignment: string | null;
  statusFilter: AssignmentStatus | '';
  onUpdateStatus: (assignmentId: string, newStatus: AssignmentStatus) => void;
  onViewDetails: (assignmentId: string) => void;
  onClearFilter: () => void;
  onBrowseTasks: () => void;
}

const AssignmentsList: React.FC<AssignmentsListProps> = ({
  assignments,
  filteredAssignments,
  updatingAssignment,
  statusFilter,
  onUpdateStatus,
  onViewDetails,
  onClearFilter,
  onBrowseTasks
}) => {
  const router = useRouter();

  if (filteredAssignments.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
        <p className="text-gray-600 mb-6">
          {assignments.length === 0 
            ? "You haven't claimed any tasks yet. Browse available tasks to get started!"
            : "No assignments match your current filter."
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {assignments.length === 0 && (
            <button
              onClick={onBrowseTasks}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Available Tasks
            </button>
          )}
          {assignments.length > 0 && statusFilter && (
            <button
              onClick={onClearFilter}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Filter
            </button>
          )}
          <button
            onClick={() => router.push('/dashboard')}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredAssignments.map(assignment => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          isUpdating={updatingAssignment === assignment.id}
          onUpdateStatus={onUpdateStatus}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default AssignmentsList;