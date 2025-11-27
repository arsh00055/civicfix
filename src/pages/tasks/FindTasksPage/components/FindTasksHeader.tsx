import React from 'react';
import { FilterIcon, RefreshIcon } from '../../../../components/UI/icons';

interface FindTasksHeaderProps {
  onRefresh: () => void;
}

const FindTasksHeader: React.FC<FindTasksHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FilterIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Find Tasks</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Discover tasks that match your skills, location, and interests
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshIcon className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};

export default FindTasksHeader;