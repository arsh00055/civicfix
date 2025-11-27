import React from 'react';
import { UsersIcon } from '../../../../components/UI/icons';

interface UserManagementHeaderProps {
  onRefresh: () => void;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <UsersIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage all users and their roles in the system
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default UserManagementHeader;