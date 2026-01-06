'use client';

import React from 'react';
import Image from 'next/image';
import { User } from '@/types/user.types';

interface ProfileCardProps {
  user: User;
  stats?: {
    issuesReported: number;
    issuesResolved: number;
    rating: number;
  };
  showStats?: boolean;
  className?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  user, 
  stats,
  showStats = true,
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative h-16 w-16">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              fill
              className="rounded-full border-2 border-gray-300 object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center border-2 border-gray-300">
              <span className="text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 truncate">{user.name}</h2>
          <p className="text-gray-600 text-sm truncate">{user.email}</p>
          <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
          </span>
        </div>
      </div>
      
      {showStats && stats && (
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