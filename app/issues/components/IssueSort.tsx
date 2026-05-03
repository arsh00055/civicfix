'use client';

import React from 'react';

type SortOption = 'newest' | 'oldest' | 'priority' | 'votes' | 'updated';

interface IssueSortProps {
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
}

const IssueSort: React.FC<IssueSortProps> = ({ sortBy, onSortChange }) => {
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'priority', label: 'Priority' },
    { value: 'votes', label: 'Most Votes' },
    { value: 'updated', label: 'Recently Updated' },
  ];

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="sort" className="text-sm font-medium text-gray-700">
        Sort by:
      </label>
      <select
        id="sort"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="border cursor-pointer text-black  cursor-pointer border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default IssueSort;