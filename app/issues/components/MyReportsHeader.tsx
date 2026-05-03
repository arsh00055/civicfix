'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DocumentTextIcon, RefreshIcon } from '@/components/UI/icons';

interface MyReportsHeaderProps {
  onRefresh: () => void;
  onReportNew: () => void;
}

const MyReportsHeader: React.FC<MyReportsHeaderProps> = ({ onRefresh, onReportNew }) => {
  const router = useRouter();

  const handleReportNew = () => {
    router.push('/issues/new');
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Reports</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Track all the issues you've reported in the community
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="flex items-center cursor-pointer space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshIcon className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={onReportNew || handleReportNew}
            className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Report New Issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyReportsHeader;