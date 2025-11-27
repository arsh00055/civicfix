import React from 'react';
import { Link } from 'react-router-dom';
import PrimaryButton from '../../components/UI/buttons/PrimaryButton';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. 
          The page might have been moved or doesn't exist.
        </p>

        <div className="space-y-4">
          <Link to="/dashboard">
            <PrimaryButton className="w-full">
              Go to Dashboard
            </PrimaryButton>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Or go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;