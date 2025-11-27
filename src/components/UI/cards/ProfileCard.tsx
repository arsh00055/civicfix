import React from 'react';

interface ProfileCardProps {
  user: {
    name: string;
    email: string;
    avatar: string;
    role: string;
    joinDate: string;
  };
  stats?: {
    issuesReported: number;
    issuesResolved: number;
    rating: number;
  };
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, stats }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={user.avatar}
          alt={user.name}
          className="h-16 w-16 rounded-full border-2 border-gray-300"
        />
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            {user.role}
          </span>
        </div>
      </div>
      
      {stats && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.issuesReported}</div>
            <div className="text-xs text-gray-600">Reported</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.issuesResolved}</div>
            <div className="text-xs text-gray-600">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.rating}</div>
            <div className="text-xs text-gray-600">Rating</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;