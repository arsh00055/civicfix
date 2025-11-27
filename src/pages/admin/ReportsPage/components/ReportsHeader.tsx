import React from 'react';
import { DocumentReportIcon, RefreshIcon } from '../../../../components/UI/icons';

interface ReportsHeaderProps {
  onRefresh: () => void;
}

const ReportsHeader: React.FC<ReportsHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <DocumentReportIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Reports</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Generate and download comprehensive system reports
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

export default ReportsHeader;