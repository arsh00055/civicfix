import React from 'react';
import { ChartBarIcon } from '../../../../components/UI/icons';

interface ErrorBannerProps {
  error: string | null;
  onRetry: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onRetry }) => {
  if (!error) return null;

  return (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <ChartBarIcon className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onRetry}
            className="text-sm text-red-700 hover:text-red-600 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;