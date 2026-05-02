'use client';

import React from 'react';
import SearchBox from '@/components/common/SearchBox';
import SelectField from '@/components/UI/forms/SelectField';

interface IssueFilters {
  status: string | undefined;
  category: string | undefined;
  priority: string | undefined;
  search: string;
}

interface IssueFiltersProps {
  filters: IssueFilters;
  onFiltersChange: (filters: IssueFilters) => void;
}

const IssueFilters: React.FC<IssueFiltersProps> = ({ filters, onFiltersChange }) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'reported', label: 'Reported' },
    { value: 'in_review', label: 'In Review' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'safety', label: 'Safety' },
    { value: 'environment', label: 'Environment' },
    { value: 'public_services', label: 'Public Services' },
    { value: 'other', label: 'Other' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const updateFilter = (key: keyof IssueFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      category: 'all',
      priority: 'all',
      search: ''
    });
  };

  const hasActiveFilters = filters.status !== 'all' || 
                          filters.category !== 'all' || 
                          filters.priority !== 'all' || 
                          filters.search !== '';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Issues
          </label>
          <SearchBox
            value={filters.search}
            onChange={(value) => updateFilter('search', value)}
            className='text-black '
            placeholder="Search by title, description, or location..."
          />
        </div>

        <div className="w-full lg:w-74">
          <SelectField
            label="Status"
            value={filters.status}
            onChange={(value) => updateFilter('status', value)}
            options={statusOptions}
          />
        </div>

        <div className="w-full lg:w-74">
          <SelectField
            label="Category"
            value={filters.category}
            onChange={(value) => updateFilter('category', value)}
            options={categoryOptions}
          />
        </div>

        <div className="w-full lg:w-74">
          <SelectField
            label="Priority"
            value={filters.priority}
            onChange={(value) => updateFilter('priority', value)}
            options={priorityOptions}
          />
        </div>

        {hasActiveFilters && (
          <div className="w-full lg:w-auto">
            <button
              onClick={clearFilters}
              className="w-full cursor-pointer lg:w-auto bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueFilters;