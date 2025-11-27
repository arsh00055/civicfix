import React from 'react';
import { ClipboardIcon, RefreshIcon } from '../../../../components/UI/icons';

interface AvailableTasksHeaderProps {
  onRefresh: () => void;
}

const AvailableTasksHeader: React.FC<AvailableTasksHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <ClipboardIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Available Tasks</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Find and claim tasks that match your skills and interests
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

export default AvailableTasksHeader;