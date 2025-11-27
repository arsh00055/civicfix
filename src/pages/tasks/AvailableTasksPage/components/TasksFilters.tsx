import React from 'react';
import SearchBox from '../../../../components/common/SearchBox';

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={filters.category}
            onChange={(e) => onCategoryFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="Road Maintenance">Road Maintenance</option>
            <option value="Public Safety">Public Safety</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Vandalism">Vandalism</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
          <select
            value={filters.priority}
            onChange={(e) => onPriorityFilter(e.target.value as Priority | '')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Tasks</label>
          <SearchBox
            onSearch={onSearch}
            placeholder="Search tasks by title or description..."
            value={filters.search}
            onChange={onSearch}
          />
        </div>
      </div>
      {hasActiveFilters && (
        <div className="flex justify-end mt-4">
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default TasksFilters;