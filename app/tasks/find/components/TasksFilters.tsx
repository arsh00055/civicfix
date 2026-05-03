'use client';

import React from 'react';
import SearchBox from '@/components/common/SearchBox';

type Priority = 'low' | 'medium' | 'high' | 'critical';

interface TasksFiltersProps {
  filters: {
    category: string;
    priority: Priority | '';
    search: string;
  };
  onCategoryFilter: (category: string) => void;
  onPriorityFilter: (priority: Priority | '') => void;
  onSearch: (search: string) => void;
  onClearFilters: () => void;
}

const TasksFilters: React.FC<TasksFiltersProps> = ({
  filters,
  onCategoryFilter,
  onPriorityFilter,
  onSearch,
  onClearFilters
}) => {
  const hasActiveFilters = filters.category || filters.priority || filters.search;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Tasks</label>
          <SearchBox
            value={filters.search}
            className='text-black'
            onChange={onSearch}
            placeholder="Search by title, description, or location..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={filters.category}
            onChange={(e) => onCategoryFilter(e.target.value)}
            className="w-full text-black cursor-pointer border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="safety">Safety</option>
            <option value="sanitation">Sanitation</option>
            <option value="utilities">Utilities</option>
            <option value="environment">Environment</option>
            <option value="community">Community</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
          <select
            value={filters.priority}
            onChange={(e) => onPriorityFilter(e.target.value as Priority | '')}
            className="w-full text-black cursor-pointer border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-4 flex items-center space-x-2 flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.category && (
            <span className="inline-flex items-center cursor-pointer px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200">
              Category: {filters.category}
              <button
                onClick={() => onCategoryFilter('')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.priority && (
            <span className="inline-flex items-center cursor-pointer px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
              Priority: {filters.priority}
              <button
                onClick={() => onPriorityFilter('')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 border border-gray-200">
              Search: {filters.search}
              <button
                onClick={() => onSearch('')}
                className="ml-1 text-gray-600 cursor-pointer hover:text-gray-800"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 cursor-pointer hover:text-blue-800 font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default TasksFilters;