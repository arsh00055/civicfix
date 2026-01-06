'use client';

import React from 'react';
import { CheckCircleIcon, RefreshIcon } from '@/components/UI/icons';

interface MyAssignmentsHeaderProps {
  onRefresh: () => void;
}

const MyAssignmentsHeader: React.FC<MyAssignmentsHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <CheckCircleIcon className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
            <p className="text-gray-600 mt-1">
              Manage and track your claimed tasks
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
        >
          <RefreshIcon className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};

export default MyAssignmentsHeader;