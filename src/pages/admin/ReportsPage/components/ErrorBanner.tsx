import React from 'react';
import { DocumentReportIcon } from '../../../../components/UI/icons';

interface ErrorBannerProps {
  error: string | null;
  onDismiss: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <DocumentReportIcon className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onDismiss}
            className="text-sm text-red-700 hover:text-red-600 font-medium"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;