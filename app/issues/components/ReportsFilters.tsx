'use client';

import React from 'react';
import SearchBox from '@/components/common/SearchBox';

interface ReportsFiltersProps {
  filters: {
    status: string;
    search: string;
  };
  filteredCount: number;
  totalCount: number;
  onStatusFilter: (status: string) => void;
  onSearch: (search: string) => void;
  onClearFilters: () => void;
}

const ReportsFilters: React.FC<ReportsFiltersProps> = ({
  filters,
  filteredCount,
  onStatusFilter,
  onSearch,
  onClearFilters
}) => {
  const hasActiveFilters = filters.status || filters.search;

  return (
    <>
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-500">
          {filteredCount} report{filteredCount !== 1 ? 's' : ''} found
          {hasActiveFilters ? ' (filtered)' : ''}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 cursor-pointer hover:text-blue-700 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => onStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="reported">Reported</option>
              <option value="in_review">In Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Reports</label>
            <SearchBox
              value={filters.search}
              onChange={onSearch}
              placeholder="Search your reports by title..."
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportsFilters;