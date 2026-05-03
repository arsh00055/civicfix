'use client';

import React from 'react';

type AssignmentStatus = 'reported' | 'in_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

interface AssignmentsFiltersProps {
  statusFilter: AssignmentStatus | '';
  onStatusFilterChange: (status: AssignmentStatus | '') => void;
}

const AssignmentsFilters: React.FC<AssignmentsFiltersProps> = ({
  statusFilter,
  onStatusFilterChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as AssignmentStatus | '')}
            className="border border-gray-300 cursor-pointer rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
          >
            <option value="">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        {statusFilter && (
          <button
            onClick={() => onStatusFilterChange('')}
            className="text-sm text-blue-600 cursor-pointer hover:text-blue-700 font-medium whitespace-nowrap"
          >
            Clear Filter
          </button>
        )}
      </div>
    </div>
  );
};

export default AssignmentsFilters;