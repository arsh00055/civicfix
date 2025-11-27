import React from 'react';
import { ExclamationTriangleIcon } from '../../../components/UI/icons';

interface AuthRequiredProps {
  onLogin: () => void;
}

const AuthRequired: React.FC<AuthRequiredProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <ExclamationTriangleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
        <p className="text-gray-600 mb-4">Please log in to view your reports</p>
        <button
          onClick={onLogin}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default AuthRequired;